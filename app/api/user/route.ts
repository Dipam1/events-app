import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if(!session) return new Response("Unauthorized", { status: 401 });

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
      return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify(ourUser), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error fetching user session:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );

  }
}
