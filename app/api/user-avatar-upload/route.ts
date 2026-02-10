import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let filename = req.nextUrl.searchParams.get("filename");
    const type: string | null = req.nextUrl.searchParams.get("type");
    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      );
    }
    filename = filename + Date.now();
    const client = new S3Client({ region: process.env.AWS_REGION });
    const contentType: string | undefined = type ?? undefined;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `user/profile-picture/${filename}`,
      ContentType: contentType,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    if (!url) {
      return NextResponse.json(
        { error: "Failed to generate signed URL" },
        { status: 500 },
      );
    }
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
