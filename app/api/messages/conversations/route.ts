import { requireAuth } from "@/lib/api-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const userId = authResult.session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const data = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (participant) => participant.userId !== userId,
      );
      const lastMessage = conversation.messages[0]?.content || "";
      const lastMessageAt =
        conversation.messages[0]?.createdAt || conversation.updatedAt;

      return {
        id: conversation.id,
        userId: otherParticipant?.user?.id || "",
        name: otherParticipant?.user?.name || "Unknown",
        avatar: otherParticipant?.user?.profilePictureUrl || null,
        lastMessage,
        lastMessageAt,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Conversation list error:", error);
    return NextResponse.json(
      { message: "Failed to load conversations" },
      { status: 500 },
    );
  }
}
