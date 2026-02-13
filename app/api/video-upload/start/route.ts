import { auth } from "@/lib/auth";
import {
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_S3_REGION, AWS_BUCKET_NAME } =
      process.env;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - valid session required" },
        { status: 401 },
      );
    }

    const filename = req.nextUrl.searchParams.get("filename");
    const filetype = req.nextUrl.searchParams.get("filetype");
    const parts = parseInt(req.nextUrl.searchParams.get("parts") || "0");

    if (!filename || !filetype || !parts) {
      return NextResponse.json(
        { error: "Missing filename or filetype" },
        { status: 400 },
      );
    }

    // Map file extension to proper MIME type
    const mimeTypeMap: Record<string, string> = {
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
    };
    const contentType = mimeTypeMap[filetype.toLowerCase()] || "video/mp4";

    const KEY = `/videos/${session.user.id}/${filename}.${filetype}`;

    if (
      !AWS_ACCESS_KEY ||
      !AWS_SECRET_KEY ||
      !AWS_S3_REGION ||
      !AWS_BUCKET_NAME
    ) {
      return NextResponse.json(
        { error: "Missing required AWS configuration" },
        { status: 500 },
      );
    }

    const s3 = new S3Client({
      region: AWS_S3_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });

    const command = new CreateMultipartUploadCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: KEY,
      ContentType: contentType,
    });

    const uploadUrl = await s3.send(command);

    if (!uploadUrl || !uploadUrl.UploadId) {
      return NextResponse.json(
        { error: "Failed to initiate multipart upload" },
        { status: 500 },
      );
    }

    console.log("Multipart upload initiated:", {
      Key: KEY,
      UploadId: uploadUrl.UploadId,
      ContentType: contentType,
    });

    const urls = [];

    for (let index = 0; index < parts; index++) {
      const command = new UploadPartCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: KEY,
        UploadId: uploadUrl.UploadId,
        PartNumber: index + 1,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      urls.push(url);
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate signed URLs" },
        { status: 500 },
      );
    }

    return NextResponse.json({ urls, uploadID: uploadUrl.UploadId });
  } catch (error) {
    console.error("Error completing video upload:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
