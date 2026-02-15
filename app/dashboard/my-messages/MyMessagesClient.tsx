'use client'
import { Card, Flex, Select, List, Avatar, Typography, Input, Button } from 'antd'
import MessageBlock from './MessageBlock'
import React, { useState } from 'react'

const SearchLogic: React.FC = () => {

    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

    const onChange = (value: string) => {
        console.log(`selected ${value}`);

        try {


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

    return (
        <Select
            showSearch={{ optionFilterProp: 'label', onSearch }}
            onChange={onChange}
            placeholder="Select a person"
            options={options}
            style={{ minWidth: 180 }}
        />
    )
}

const MyMessagesClient = () => {
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        console.log('Sending message:', message);
        // TODO: Implement actual send logic
        setMessage('');
    };

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="My Messages"
                extra={<SearchLogic />}
                style={{ borderRadius: 16 }}
            >
                <Flex gap="middle" style={{ minHeight: 'calc(100vh - 300px)' }}>
                    <List
                        style={{ width: "30%" }}
                        size='small'
                        itemLayout="horizontal"
                        header="Conversations"
                        dataSource={[]} // TODO: Connect to real conversation data
                        renderItem={(item: any) => (
                            <List.Item style={{ cursor: 'pointer' }}>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.avatar} />}
                                    title={item.name}
                                    description={item.lastMessage}
                                />
                            </List.Item>
                        )}
                    />
                    <div style={{ flex: 1, padding: 16, width: "70%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div className="message-top">
                            <MessageBlock />
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
        </div>
    )
}

export default MyMessagesClient