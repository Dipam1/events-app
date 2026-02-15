'use client'
import AddVideoModal from "@/components/AddVideoModal";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty } from "antd"
import { useState } from "react";

const MyVideosClient = () => {
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
                <Empty 
                    description="No videos uploaded yet"
                    style={{ padding: '40px 0' }}
                >
                    <Button type="primary" onClick={() => setShowModal(true)}>
                        Upload Your First Video
                    </Button>
                </Empty>
            </Card>
        </div >
    )
}

export default MyVideosClient