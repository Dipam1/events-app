import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult.error;
    const { session } = authResult;

    const ourUser = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePictureUrl: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
      },
    });

    if (!ourUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ourUser);

  } catch (err) {
    console.error("Error fetching user session:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );

  }
}
