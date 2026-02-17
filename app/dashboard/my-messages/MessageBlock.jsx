"use client";

import { Empty, List, Avatar, Typography } from "antd";

const MessageBlock = ({ selected, messages }) => {
  if (!selected) {
    return <Empty description="Select a user to send a message." />;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return <Empty description="No messages yet. Start the conversation." />;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={messages}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={item?.sender?.profilePictureUrl} />}
            title={item?.sender?.name || "Unknown"}
            description={
              <Typography.Text>
                {item?.content}
              </Typography.Text>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default MessageBlock;
