'use client'
import { Flex, Empty, Space, Input, Button } from 'antd'
import MessageBlock from './MessageBlock'
import React, { useEffect } from 'react'
import { io } from "socket.io-client";
import { useSession } from 'next-auth/react';

type MinimalMessage = {
    id?: string;
    senderId: string;
    senderName?: string | null;
    profilePictureUrl?: string | null;
    content: string;
    createdAt: string;
    conversationId?: string;
};

type MessagesDisplayProps = {
    selectedConversationId: string;
    messageList: MinimalMessage[];
    message: string;
    messageContainerRef: React.RefObject<HTMLDivElement>;
    onMessageChange: (value: string) => void;
    onSendMessage: () => void;
    onReceiveMessage: (msg: MinimalMessage) => void;
};

const SOCKET_SERVER_URL = "http://localhost:3001";
let socket: any;

const MessagesDisplay: React.FC<MessagesDisplayProps> = ({
    selectedConversationId,
    messageList,
    message,
    messageContainerRef,
    onMessageChange,
    onSendMessage,
    onReceiveMessage
}) => {

    const { data: session } = useSession();

    useEffect(() => {
        if (!selectedConversationId) return;

        if (!socket) {
            socket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
        }

        socket.emit("join_conversation", selectedConversationId);

        // use .off() to prevent duplicate listeners if the effect re-runs
        socket.off("receive_message");
        socket.on("receive_message", (data: any) => {
            const incoming = data?.message;
            if (!incoming) return;
            // ignore messages sent by the current session user
            if (session?.user?.id && incoming.senderId === session.user.id) return;
            onReceiveMessage(incoming);
        });

        // CLEANUP: This stops the constant disconnect/reconnect logs
        return () => {
            socket.emit("leave_conversation", selectedConversationId);
        };
    }, [selectedConversationId, session?.user?.id]);

    return (
        <Flex vertical style={{ flex: 1, minWidth: 0 }}>
            {selectedConversationId ? (
                <Flex ref={messageContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }}>
                    <MessageBlock selected={selectedConversationId} messages={messageList} />
                </Flex>
            ) : (
                <Flex style={{ flex: 1 }} justify="center" align="center">
                    <Empty description="Select a conversation to start messaging" />
                </Flex>
            )}
            <Space direction="vertical" style={{ width: '100%', padding: '16px', borderTop: '1px solid #f0f0f0' }} align="end">
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    onPressEnter={onSendMessage}
                    disabled={!selectedConversationId}
                    style={{ width: '100%' }}
                />
                <Button
                    type="primary"
                    onClick={onSendMessage}
                    disabled={!selectedConversationId || message.trim().length === 0}
                >
                    Send
                </Button>
            </Space>
        </Flex>
    );
};

export default MessagesDisplay;
