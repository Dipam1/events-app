import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/api-middleware";

/**
 * GET: generates a presigned GET URL for loading an image from S3
 * Query params:
 *   - key: S3 object key (required)
 *
 * Returns: { url, key, expiresIn }
 */
export async function GET(req: NextRequest) {
	try {
		const authResult = await requireAuth();
		if (isAuthError(authResult)) return authResult.error;
		const { session } = authResult;

		const key = (req.nextUrl.searchParams.get("key") || "").trim();
		if (!key) {
			return NextResponse.json({ error: "Key is required" }, { status: 400 });
		}

		// Validate key path: must start with allowed prefixes and no path traversal
		const allowedPrefixes = ["user/", "events/", "videos/"];
		const hasValidPrefix = allowedPrefixes.some((prefix) => key.startsWith(prefix));

		if (!hasValidPrefix || key.includes("..") || key.startsWith("/")) {
			return NextResponse.json(
				{ error: "Invalid key path" },
				{ status: 400 }
			);
		}

		// Validate key regex: alphanumeric, hyphen, underscore, dot, forward slash only
		if (!/^[a-zA-Z0-9/_.-]+$/.test(key)) {
			return NextResponse.json(
				{ error: "Key contains invalid characters" },
				{ status: 400 }
			);
		}

		// Basic ownership validation for user-specific resources
		if (key.startsWith("user/profile-picture/")) {
			// For user profile pictures, allow access (users can view each other's public profiles)
			// If stricter privacy needed, add user ID validation here
		}
		// For videos, validate ownership
		else if (key.startsWith("videos/")) {
			const parts = key.split("/");
			if (parts.length < 2) {
				return NextResponse.json(
					{ error: "Invalid video key format" },
					{ status: 400 }
				);
			}
			const videoOwnerId = parts[1];
			if (videoOwnerId !== session.user.id) {
				return NextResponse.json(
					{ error: "Forbidden - access denied" },
					{ status: 403 }
				);
			}
		}

		const region = process.env.AWS_S3_REGION;
		const accessKeyId = process.env.AWS_ACCESS_KEY;
		const secretAccessKey = process.env.AWS_SECRET_KEY;
		const bucketName = process.env.AWS_BUCKET_NAME;

		if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
			console.error("Missing AWS configuration for get-image");
			return NextResponse.json(
				{ error: "Server configuration error" },
				{ status: 500 },
			);
		}

		const client = new S3Client({
			region,
			credentials: { accessKeyId, secretAccessKey },
		});

		const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
		const expiresIn = 3600;
		const presignedUrl = await getSignedUrl(client, command, { expiresIn });

		if (!presignedUrl) {
			console.error("Failed to generate presigned URL for image load");
			return NextResponse.json(
				{ error: "Failed to generate image URL" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ url: presignedUrl, key, expiresIn });
	} catch (error) {
		console.error("Error generating signed URL for image load:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Internal Server Error",
			},
			{ status: 500 },
		);
	}
}
