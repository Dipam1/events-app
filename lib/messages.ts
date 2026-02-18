import { prisma } from "./prisma";

export async function findConversationWithIds(
  userId: string,
  recieverId: string,
) {
  if (!recieverId) {
    return null;
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userId } } },
        { participants: { some: { userId: recieverId } } },
      ],
    },
  });

  return conversation;
}

export async function createConversation(userId: string, recieverId: string) {
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: userId }, { userId: recieverId }],
      },
    },
  });

  return conversation;
}

export async function findConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profilePictureUrl: true,
        },
      },
    },
  });
}
