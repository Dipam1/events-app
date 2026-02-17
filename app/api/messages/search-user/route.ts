import { requireAuth } from "@/lib/api-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    const currentUserId =
      "session" in authResult ? authResult.session.user.id : null;

    const query = req.nextUrl.searchParams.get("query") || "";
    const userList = await prisma.user.findMany({
      select: { id: true, name: true },
      where: {
        name: { contains: query, mode: "insensitive" },
        NOT: {
          id: currentUserId || undefined,
        },
      },
      orderBy: { name: "asc" },
      take: 5,
    });

    if (userList.length === 0 || !userList)
      return NextResponse.json({ error: "No user found" }, { status: 404 });

    return NextResponse.json(userList);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
