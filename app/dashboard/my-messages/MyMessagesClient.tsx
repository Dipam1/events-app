'use client'
import { Card, Flex, Select, List, Avatar, Input, Button } from 'antd'
import MessageBlock from './MessageBlock'
import React, { useEffect, useState } from 'react'

type ConversationItem = {
    id: string;
    userId: string;
    name: string;
    avatar: string | null;
    lastMessage: string;
    lastMessageAt: string;
};

const MyMessagesClient = () => {
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [messageList, setMessageList] = useState<any[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState('');
    const [message, setMessage] = useState('');
    const [conversations, setConversations] = useState<ConversationItem[]>([]);

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
                setMessageList((prev) => [data, ...prev]);
            }
            setMessage('');
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div style={{ padding: 24 }}>
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
                <Flex gap="middle" style={{ minHeight: 'calc(100vh - 300px)' }}>
                    <List
                        style={{ width: "30%" }}
                        size='small'
                        itemLayout="horizontal"
                        header="Conversations"
                        dataSource={conversations}
                        renderItem={(item: ConversationItem) => (
                            <List.Item style={{ cursor: 'pointer' }} onClick={() => onSelectConversation(item.id)}>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.avatar || undefined} />}
                                    title={item.name}
                                    description={item.lastMessage}
                                />
                            </List.Item>
                        )}
                    />
                    <div style={{ flex: 1, padding: 16, width: "70%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div className="message-top" style={{
                            height: '100%'
                        }}>
                            <MessageBlock selected={selectedConversationId} messages={messageList} />
                        </div>
                        <div className="message-bottom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Input
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onPressEnter={handleSendMessage}
                            />
                            <Button className='mt-2' type="primary" onClick={handleSendMessage}>
                                Send
                            </Button>
                        </div>
                    </div>
                </Flex>
            </Card>
        </div >
    )
}

export default MyMessagesClient