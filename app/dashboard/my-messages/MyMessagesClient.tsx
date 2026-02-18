'use client'
import { Card, Flex, Select } from 'antd'
import ConversationList from './ConversationList'
import MessagesDisplay from './MessagesDisplay'
import React, { useEffect, useState, useRef } from 'react'

type ConversationItem = {
    id: string;
    userId: string;
    name: string;
    avatar: string | null;
    lastMessage: string;
    lastMessageAt: string;
};

type MinimalMessage = {
    id?: string;
    senderId: string;
    senderName?: string | null;
    profilePictureUrl?: string | null;
    content: string;
    createdAt: string;
    conversationId?: string;
};

const MyMessagesClient = () => {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [messageList, setMessageList] = useState<MinimalMessage[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState('');
    const [message, setMessage] = useState('');
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const messageContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messageList, selectedConversationId]);

    useEffect(() => {
        const loadConversations = async () => {
            try {
                const response = await fetch('/api/messages/conversations', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    setConversations(data);
                } else {
                    setConversations([]);
                }
            } catch (error) {
                console.log(error)
                setConversations([]);
            }
        };

        loadConversations();
    }, []);

    const onSelectUser = async (value: string) => {
        console.log(`selected ${value}`);
        try {
            const response = await fetch('/api/messages/find?id=' + value, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json();
            const conversationId = data?.conversationId || '';
            setSelectedConversationId(conversationId);
            if (Array.isArray(data?.messages)) {
                // API now returns minimal message shape already
                setMessageList(data.messages);
            } else {
                setMessageList([]);
            }
        } catch (error) {
            console.log(error)
        }
    };

    const onSelectConversation = async (conversationId: string) => {
        setSelectedConversationId(conversationId);
        try {
            const response = await fetch('/api/messages/find?conversationId=' + conversationId, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json();
            if (Array.isArray(data?.messages)) {
                setMessageList(data.messages);
            } else {
                setMessageList([]);
            }
        } catch (error) {
            console.log(error)
        }
    };

    const onSearch = async (value: string) => {
        console.log('search:', value);
        try {

            const userList = await fetch('/api/messages/search-user?query=' + value, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await userList.json();
            console.log(data)
            if (Array.isArray(data)) {
                const formattedOptions = data.map((user: { id: string; name: string }) => ({
                    value: user.id,
                    label: user.name,
                }));
                setOptions(formattedOptions);
            } else {
                setOptions([]);
            }
        } catch (error) {
            console.log(error)
        }
    };

    const handleSendMessage = async () => {
        const trimmedMessage = message.trim();
        if (!selectedConversationId || trimmedMessage.length === 0) {
            return;
        }

        try {
            const response = await fetch('/api/messages/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationId: selectedConversationId,
                    content: trimmedMessage,
                }),
            });
            const data = await response.json();
            if (data && data.id) {
                // API returns minimal message shape
                setMessageList((prev) => [data, ...prev]);
            }
            setMessage('');
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <Card
            title="My Messages"
            extra={(
                <Select
                    showSearch={{ optionFilterProp: 'label', onSearch }}
                    onChange={onSelectUser}
                    placeholder="Select a person"
                    options={options}
                    style={{ minWidth: 180 }}
                />
            )}
            style={{ borderRadius: 16 }}
        >
            <Flex gap="middle" style={{ height: 'calc(100vh - 300px)' }}>
                <ConversationList
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={onSelectConversation}
                />

                <MessagesDisplay
                    selectedConversationId={selectedConversationId}
                    messageList={messageList}
                    message={message}
                    messageContainerRef={messageContainerRef}
                    onMessageChange={setMessage}
                    onSendMessage={handleSendMessage}
                    onReceiveMessage={(m) => {
                        setMessageList((prev) => [m, ...prev])
                    }}
                />
            </Flex>
        </Card>
    )
}

export default MyMessagesClient