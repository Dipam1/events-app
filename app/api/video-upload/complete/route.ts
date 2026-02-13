import { auth } from "@/lib/auth";
import { CompleteMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - valid session required" },
        { status: 401 },
      );
    }
    const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_S3_REGION, AWS_BUCKET_NAME } =
      process.env;

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
    const { uploadID, etagPart, filename, filetype } = await req.json();
    console.log("Complete upload params:", {
      uploadID,
      filename,
      filetype,
      etagPart,
    });

    if (!uploadID || !etagPart || !filename) {
      return NextResponse.json(
        { error: "Missing required parameters: uploadID, etagPart, filename" },
        { status: 400 },
      );
    }

    const s3 = new S3Client({
      region: AWS_S3_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });

    let parts;
    try {
      parts = typeof etagPart === "string" ? JSON.parse(etagPart) : etagPart;
    } catch (parseErr) {
      console.error("Failed to parse etagPart:", parseErr);
      return NextResponse.json(
        {
          error: `Invalid etagPart format: ${parseErr instanceof Error ? parseErr.message : "unknown error"}`,
        },
        { status: 400 },
      );
    }

    // Remap parts to have correct field names for AWS SDK (ETag, PartNumber)
    const formattedParts = parts.map((part: any) => ({
      ETag: part.etag || part.ETag,
      PartNumber: part.partNumber || part.PartNumber,
    }));

    console.log("Formatted parts for S3:", JSON.stringify(formattedParts, null, 2));

    // Reconstruct the same Key that was used in the start route
    // Key format from start: `/videos/${session.user.id}/${filename}.${filetype}`
    const key = filetype
      ? `/videos/${session.user.id}/${filename}.${filetype}`
      : `/videos/${session.user.id}/${filename}`;

    console.log("Using S3 Key:", key);

    const command = new CompleteMultipartUploadCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      UploadId: uploadID,
      MultipartUpload: {
        Parts: formattedParts,
      },
    });

    console.log("Sending complete multipart upload command:", {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      UploadId: uploadID,
      Parts: formattedParts,
    });
    const result = await s3.send(command);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to complete multipart upload" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl: `https://${AWS_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com${key}`,
    });
  } catch (err) {
    console.error("Complete upload error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
