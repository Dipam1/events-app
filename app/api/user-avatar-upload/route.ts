import { auth } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generates a presigned URL for direct S3 file upload
 * Required: Authenticated session + valid AWS credentials in environment
 * Query params:
 *   - filename: original filename (required)
 *   - type: MIME type (required, e.g., image/jpeg)
 *
 * Returns: { url: presigned URL, cleanUrl: permanent S3 URL, contentType: MIME type }
 */
export async function GET(req: NextRequest) {
  try {
    // Validate authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - valid session required" },
        { status: 401 },
      );
    }

    // Extract and validate query parameters
    const rawFilename = req.nextUrl.searchParams.get("filename") || "";
    const type = (req.nextUrl.searchParams.get("type") || "").trim();

    if (!rawFilename.trim()) {
      return NextResponse.json(
        { error: "Filename is required and cannot be empty" },
        { status: 400 },
      );
    }

    // Sanitize filename: take basename and allow only safe characters
    const basename = rawFilename.split(/[/\\]/).pop() || "";
    const sanitizedBasename = basename.replace(/[^A-Za-z0-9._-]/g, "");
    if (!sanitizedBasename) {
      return NextResponse.json(
        { error: "Filename contains no valid characters after sanitization" },
        { status: 400 },
      );
    }

    // Validate MIME type against an allowlist
    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!type || !allowedTypes.has(type)) {
      return NextResponse.json(
        { error: "Invalid or unsupported content type" },
        { status: 400 },
      );
    }

    // Validate environment variables
    const region = process.env.AWS_S3_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error("Missing AWS configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Create unique filename with timestamp to avoid collisions using sanitized basename
    const uniqueFilename = `${sanitizedBasename}-${Date.now()}`;

    // Initialize S3 client with credentials
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Define S3 put object command
    const contentType = type || undefined;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `user/profile-picture/${uniqueFilename}`,
      ContentType: contentType,
    });

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    if (!presignedUrl) {

      console.error("Failed to generate presigned URL");
      return NextResponse.json(
        { error: "Failed to generate upload URL" },
        { status: 500 },
      );
    }

    // Construct permanent S3 URL (without temporary credentials)
    const cleanUrl = `https://${bucketName}.s3.${region}.amazonaws.com/user/profile-picture/${uniqueFilename}`;

    return NextResponse.json({
      url: presignedUrl,
      cleanUrl,
      contentType,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
