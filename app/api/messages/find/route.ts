import { requireAuth } from "@/lib/api-middleware";
import {
  createConversation,
  findConversationMessages,
  findConversationWithIds,
} from "@/lib/messages";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET: Fetches or creates a conversation and returns the latest 20 messages between users
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if ("error" in user) {
      return user.error;
    }
    const userId = user.session.user.id;
    const conversationId = req.nextUrl.searchParams.get("conversationId");
    const recieverId = req.nextUrl.searchParams.get("id");

    if (!conversationId && !recieverId) {
      return NextResponse.json(
        { error: "Receiver ID or conversation ID is required" },
        { status: 400 },
      );
    }

    if (conversationId) {
      const messages = await findConversationMessages(conversationId);
      return NextResponse.json({ conversationId, messages });
    }

    let conversation = await findConversationWithIds(userId, recieverId as string);
    if (!conversation) {
      conversation = await createConversation(userId, recieverId as string);
      return NextResponse.json({ conversationId: conversation.id, messages: [] });
    }
    const messages = await findConversationMessages(conversation.id);

    return NextResponse.json({ conversationId: conversation.id, messages });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Cannot find user messages" },
      { status: 404 },
    );
  }
}
