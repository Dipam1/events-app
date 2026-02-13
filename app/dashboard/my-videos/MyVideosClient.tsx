'use client'
import AddVideoModal from "@/components/AddVideoModal";
import { PlusOutlined } from "@ant-design/icons";

import { Button, Card, Flex, theme } from "antd"
import { useState } from "react";

const MyVideosClient = () => {
    const { token } = theme.useToken();
    const [showModal, setShowModal] = useState(false);



    return (
        <div style={{ padding: 24 }}>
            <AddVideoModal open={showModal} setOpen={setShowModal} />
            <Card
                title="My Videos"
                style={{ marginBottom: 24 }}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>
                        Upload Video
                    </Button>
                }
            >
                <Flex align="center" gap="small">

                </Flex>
            </Card>
        </div >
    )
}

export default MyVideosClient