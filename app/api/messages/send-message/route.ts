import { requireAuth } from "@/lib/api-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const senderId = authResult.session.user.id;
    const { conversationId, content } = await req.json();

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 },
      );
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content: trimmedContent,
        },
        include: {
          sender: true,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });

    const payload = {
      id: result.id,
      conversationId: result.conversationId,
      senderId: result.senderId,
      senderName: result.sender?.name || null,
      profilePictureUrl: result.sender?.profilePictureUrl || null,
      content: result.content,
      createdAt: result.createdAt,
    };

    const conversationSocket = await redis.publish(
      "CHAT_CHANNEL",
      JSON.stringify({ conversationId, message: payload }),
    );

    if (!conversationSocket) {
      return NextResponse.json(
        { ...payload, warning: "Message saved but failed to sync in real-time" },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { ...payload, success: "Message sent successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
