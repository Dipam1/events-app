import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/api-middleware";

/**
 * Confirms avatar upload completion and persists S3 URL to user profile
 * This endpoint is called after successful S3 file upload
 *
 * Required: Authenticated session
 * Query params: url - The permanent S3 object URL
 *
 * Returns: Updated user object with new profilePictureUrl
 */
export async function GET(req: NextRequest) {
  try {
    // Validate authentication
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult.error;
    const { session } = authResult;

    // Extract and validate URL parameter
    const url = req.nextUrl.searchParams.get("url");
    if (!url?.trim()) {
      return NextResponse.json(
        { error: "URL parameter is required and cannot be empty" },
        { status: 400 },
      );
    }

    // Validate URL is a valid S3 URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Update user profile with new avatar URL
    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        profilePictureUrl: url,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Avatar uploaded successfully",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error confirming avatar upload:", error);

    // Handle specific Prisma errors
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return NextResponse.json(
        { error: "Failed to update profile - duplicate or invalid data" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to confirm avatar upload",
      },
      { status: 500 },
    );
  }
}
