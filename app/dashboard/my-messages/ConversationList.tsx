'use client'
import { List, Avatar, Flex } from 'antd'
import React from 'react'

type ConversationItem = {
    id: string;
    userId: string;
    name: string;
    avatar: string | null;
    lastMessage: string;
    lastMessageAt: string;
};

type ConversationListProps = {
    conversations: ConversationItem[];
    selectedConversationId: string;
    onSelectConversation: (id: string) => void;
};

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedConversationId,
    onSelectConversation
}) => {
    return (
        <Flex vertical style={{ width: '30%', minWidth: 0 }}>
            <List<ConversationItem>
                style={{ overflowY: 'auto', flex: 1 }}
                itemLayout="horizontal"
                dataSource={conversations}
                locale={{ emptyText: 'No conversations yet' }}
                renderItem={(item) => (
                    <List.Item
                        key={item.id}
                        onClick={() => onSelectConversation(item.id)}
                        style={{
                            width: "100%",
                            cursor: 'pointer',
                            borderBottom: selectedConversationId === item.id ? '#e6f4ff 1px solid' : undefined,
                            padding: '12px 16px'
                        }}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={item.avatar || undefined} size={40} />}
                            title={<div style={{ fontWeight: 500 }}>{item.name}</div>}
                            description={<div style={{ color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.lastMessage}</div>}
                        />
                    </List.Item>
                )}
            />
        </Flex>
    );
};

export default ConversationList;
