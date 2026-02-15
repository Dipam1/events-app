import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { requireOrganizer, isAuthError } from "@/lib/api-middleware";

/**
 * GET: generates a presigned PUT URL for uploading an event image to S3
 * Query params:
 *   - filename: original filename (required)
 *   - type: MIME type (required)
 *
 * Returns: { url, cleanUrl, key, contentType }
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireOrganizer();
    if (isAuthError(authResult)) return authResult.error;
    const { session } = authResult;

    const rawFilename = req.nextUrl.searchParams.get("filename") || "";
    const type = (req.nextUrl.searchParams.get("type") || "").trim();

    if (!rawFilename.trim()) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      );
    }

    const basename = rawFilename.split(/[/\\]/).pop() || "";
    const sanitizedBasename = basename.replace(/[^A-Za-z0-9._-]/g, "");
    if (!sanitizedBasename) {
      return NextResponse.json(
        { error: "Filename contains no valid characters" },
        { status: 400 },
      );
    }

    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!type || !allowedTypes.has(type)) {
      return NextResponse.json(
        { error: "Invalid or unsupported content type" },
        { status: 400 },
      );
    }

    const region = process.env.AWS_S3_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error("Missing AWS configuration for event-image-upload");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Use a folder for event images and include user id for traceability
    const uniqueFilename = `${sanitizedBasename}-${Date.now()}`;
    const key = `events/images/${session.user.id}/${uniqueFilename}`;

    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const contentType = type || undefined;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });
    if (!presignedUrl) {
      console.error("Failed to generate presigned URL for event image");
      return NextResponse.json(
        { error: "Failed to generate upload URL" },
        { status: 500 },
      );
    }

    const cleanUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ url: presignedUrl, cleanUrl, key, contentType });
  } catch (error) {
    console.error("Error generating signed URL for event image:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE: deletes an object from S3 by key.
 * Expects JSON body: { key: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireOrganizer();
    if (isAuthError(authResult)) return authResult.error;
    const { session } = authResult;

    const body = await req.json();
    const key = (body?.key || "").toString();
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Validate ownership: key must start with user's ID prefix
    const expectedPrefix = `events/images/${session.user.id}/`;
    if (!key.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Forbidden - you can only delete your own images" },
        { status: 403 }
      );
    }

    const region = process.env.AWS_S3_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error("Missing AWS configuration for event-image-delete");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
    await client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting S3 object:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
