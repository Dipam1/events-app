"use client";

import React from "react";
import { Empty, List, Avatar, Typography, Flex } from "antd";
import useUser from "@/lib/useUser";
import UserAvatar from "../../../public/user-avatar.svg";

const { Text, Paragraph } = Typography;

const MessageBlock = ({ selected, messages }) => {
  const { user } = useUser();

  if (!selected) return <Empty description="Select a user to send a message." />;
  if (!Array.isArray(messages) || messages.length === 0)
    return <Empty description="No messages yet. Start the conversation." />;

  const ordered = [...messages].reverse();

  return (
    <List
      style={{ width: "100%" }}
      dataSource={ordered}
      renderItem={(msg) => {
        const isOwn = user && user.id === msg.senderId;
        const bubbleStyle = {
          maxWidth: "75%",
          background: isOwn ? "#1890ff" : "#f5f5f5",
          color: isOwn ? "#fff" : "#000",
          padding: "8px 12px",
          borderRadius: 16,
          borderTopRightRadius: isOwn ? 4 : 16,
          borderTopLeftRadius: isOwn ? 16 : 4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        };

        return (
          <List.Item style={{ border: "none", padding: 8 }}>
            <Flex style={{ width: "100%" }} justify={isOwn ? "flex-end" : "flex-start"} gap={8} align="flex-end">
              {!isOwn && <Avatar src={msg.profilePictureUrl || UserAvatar} size={36} />}

              <Flex vertical align={isOwn ? "flex-end" : "flex-start"} gap={6} style={{ width: "90%" }}>
                {!isOwn && <Text strong>{msg.senderName || "Unknown"}</Text>}
                <Flex vertical style={bubbleStyle}>
                  <Paragraph style={{ margin: 0, color: isOwn ? "#fff" : "#000" }}>{msg.content}</Paragraph>
                  <Flex justify="flex-end" style={{ marginTop: 6 }}>
                    <Text style={{ fontSize: 12, color: isOwn ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.45)" }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

              {isOwn && <Avatar src={user?.profilePictureUrl || UserAvatar} size={36} />}
            </Flex>
          </List.Item>
        );
      }}
    />
  );
};

export default MessageBlock;
