import { Button, Form, Input, Modal, Upload, Progress } from 'antd';
import { useState } from 'react';

interface AddVideoModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AddVideoModal = ({ open, setOpen }: AddVideoModalProps) => {
    const [form] = Form.useForm();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const onFinish = (values: { video: File; title: string; description: string }) => {
        console.log('Form values:', values);
        setOpen(false);
    };

    const handleBeforeUpload = async (file: File) => {
        try {
            setIsUploading(true);
            setUploadProgress(0);
            const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            // Extract filename without extension and get file extension
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

            const filename = encodeURIComponent(nameWithoutExt);
            const filetype = encodeURIComponent(fileExtension);
            const res = await fetch(`/api/video-upload/start?filename=${filename}&filetype=${filetype}&parts=${totalChunks}`);
            const data = (await res.json()) as { error?: string; urls?: string[], uploadID?: string };
            const { urls, uploadID } = data;
            if (!res.ok || !urls || data.error) {
                throw new Error(data?.error || 'Failed to get upload URL');
            }
            const etagPart: ({ etag: string, partNumber: number })[] = [];
            console.log(totalChunks)
            for (let i = 0; i < totalChunks; i++) {

                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);
                const putRes = await fetch(urls[i], {
                    method: 'PUT',
                    body: chunk,
                });
                const etag = putRes.headers.get('Etag');
                console.log(etag, i)
                if (etag) {
                    etagPart.push({ etag, partNumber: i + 1 });
                } else {
                    throw new Error('Failed to upload file to S3');
                }
                if (!putRes.ok) {
                    throw new Error('Failed to upload file to S3');
                }
                // Update progress after each chunk uploads
                let currentProgress = Math.round((i / totalChunks) * 100);
                const nextProgress = Math.round(((i + 1) / totalChunks) * 100);
                while (currentProgress < nextProgress) {
                    setUploadProgress(currentProgress);
                    await new Promise(resolve => setTimeout(resolve, 8));
                    currentProgress++;
                }
            }


            const completeRes = await fetch('/api/video-upload/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uploadID,
                    etagPart,
                    filename: nameWithoutExt,
                    filetype: fileExtension,
                }),
            });


            if (!completeRes.ok) {
                throw new Error('Failed to complete upload');
            }

            console.log(completeRes);
            setUploadProgress(100);
        }
        catch (err) {
            console.log(err)
            setUploadProgress(0);
        }
        finally {
            setIsUploading(false);
        }
    }

    return (
        <Modal
            title="Upload Video"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                {isUploading && (
                    <div style={{ marginBottom: 16 }}>
                        <Progress
                            type="circle"
                            percent={uploadProgress}
                            format={(percent) => `${percent}%`}
                        />
                        <p style={{ marginTop: 8, textAlign: 'center', color: '#666' }}>
                            Uploading... {uploadProgress}%
                        </p>
                    </div>
                )}
                <Form.Item name="video" label="Video" required>
                    <Upload
                        listType="picture"
                        accept=".mp4"
                        beforeUpload={(file) => {
                            handleBeforeUpload(file);
                            return false;
                        }}
                        maxCount={1}>
                        <Button>Select Video</Button>
                    </Upload>
                </Form.Item>
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input type="text" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Upload
                    </Button>
                </Form.Item>
            </Form>

        </Modal>
    );
};

export default AddVideoModal