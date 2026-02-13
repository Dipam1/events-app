"use client";

import React from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Button,
    Select,
    message,
    theme,
    Divider,
    Typography,
    Upload,
} from "antd";
import { Flex } from "antd";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Dragger } = Upload;

interface AddEventModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function slugifyTitle(title = "") {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export default function AddEventModal({ open, setOpen }: AddEventModalProps) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [images, setImages] = React.useState<any[]>([]);
    const [uploadedImages, setUploadedImages] = React.useState<any[]>([]);
    const { token } = theme.useToken();


    // Upload handlers extracted so you can add additional logic easily
    const handleBeforeUpload = async (file: any) => {
        const uid = file.uid ?? `uid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setImages((prev) => [...prev, { ...file, uid }]);

        try {
            const filename = encodeURIComponent(file.name);
            const type = encodeURIComponent(file.type || "application/octet-stream");
            const res = await fetch(`/api/event-image-upload?filename=${filename}&type=${type}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to get upload URL");
            }

            const { url: uploadUrl, cleanUrl, key, contentType } = data;
            const putRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": contentType || file.type || "application/octet-stream",
                },
                body: file,
            });

            if (!putRes.ok) {
                throw new Error("Failed to upload file to S3");
            }

            setUploadedImages((prev) => [...prev, { uid, key, url: cleanUrl, name: file.name }]);
            messageApi.success(`${file.name} uploaded`);
        } catch (err: any) {
            setImages((prev) => prev.filter((f) => f.uid !== uid && f.name !== file.name));
            messageApi.error(err?.message || "Upload failed");
        }

        return false;
    };

    const handleRemove = async (file: any) => {
        setImages((prev) => prev.filter((f) => f.uid !== file.uid && f.name !== file.name));

        const found = uploadedImages.find((u) => u.uid === file.uid || u.name === file.name);
        if (found) {
            try {
                const res = await fetch("/api/event-image-upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: found.key }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.error || "Failed to delete image");
                }
                messageApi.success(`${found.name} deleted`);
            } catch (err: any) {
                messageApi.error(err?.message || "Failed to delete image");
            }

            setUploadedImages((prev) => prev.filter((u) => u.key !== found.key));
        }

        return true;
    };


    const onFinish = async (values: any) => {
        try {
            // Build slug from title + datetime to ensure uniqueness
            const base = slugifyTitle(values.title || "event");
            const datetimeSuffix = new Date().toISOString().replace(/[:.]/g, "-");
            const slug = `${base}-${datetimeSuffix}`;

            const payload = {
                slug,
                title: values.title,
                description: values.description,
                startDateTime: values.startDateTime?.toISOString?.(),
                endDateTime: values.endDateTime?.toISOString?.(),
                locationAddress: values.locationAddress,
                locationCity: values.locationCity,
                locationZip: values.locationZip,
                totalTickets: values.totalTickets,
                price: values.price,
                type: values.type,
                imageUrls: uploadedImages.map((img) => img.key),
                tags: values.tags || [],
            };

            const res = await fetch("/api/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                messageApi.success(data.message || "Event created successfully");
                form.resetFields();
                setOpen(false);
            } else {
                messageApi.error(data.message || "Failed to create event");
            }
        } catch (err: any) {
            messageApi.error(err?.message || "Something went wrong");
        }
    };

    return (
        <Modal
            centered
            title="Create New Event"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
            destroyOnHidden
        >
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Flex vertical gap={12} style={{ width: "100%" }}>
                    <div>
                        <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Title</Text>
                        <Form.Item name="title" rules={[{ required: true, message: "Title is required" }]}>
                            <Input size="large" placeholder="Event title" style={{ borderRadius: 12 }} />
                        </Form.Item>
                    </div>

                    <div>
                        <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Description</Text>
                        <Form.Item name="description" rules={[{ required: true, message: "Description is required" }]}>
                            <TextArea rows={4} placeholder="Event description" style={{ borderRadius: 12 }} />
                        </Form.Item>
                    </div>

                    <div>
                        <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Start / End</Text>
                        <Flex style={{ display: "flex", gap: 12 }}>
                            <Form.Item
                                name="startDateTime"
                                dependencies={["endDateTime"]}
                                rules={[
                                    { required: true, message: "Start date is required" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const end = getFieldValue("endDateTime");
                                            if (end && value && value.isAfter && value.isAfter(end)) {
                                                return Promise.reject(new Error("Start date cannot be after end date"));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                                style={{ flex: 1 }}
                            >
                                <DatePicker showTime style={{ width: "100%", borderRadius: 12 }} />
                            </Form.Item>
                            <Form.Item
                                name="endDateTime"
                                dependencies={["startDateTime"]}
                                rules={[
                                    { required: true, message: "End date is required" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const start = getFieldValue("startDateTime");
                                            if (start && value && value.isBefore && value.isBefore(start)) {
                                                return Promise.reject(new Error("End date cannot be before start date"));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                                style={{ flex: 1 }}
                            >
                                <DatePicker showTime style={{ width: "100%", borderRadius: 12 }} />
                            </Form.Item>
                        </Flex>
                    </div>

                    <div>
                        <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Address</Text>
                        <Form.Item name="locationAddress" rules={[{ required: true, message: "Address is required" }]}>
                            <Input size="large" placeholder="Street address" style={{ borderRadius: 12 }} />
                        </Form.Item>
                    </div>

                    <Flex style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>City</Text>
                            <Form.Item name="locationCity" rules={[{ required: true }]}>
                                <Input size="large" placeholder="City" style={{ borderRadius: 12 }} />
                            </Form.Item>
                        </div>
                        <div style={{ width: 160 }}>
                            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>ZIP</Text>
                            <Form.Item name="locationZip" rules={[{ required: true }]}>
                                <Input size="large" placeholder="ZIP" style={{ borderRadius: 12 }} />
                            </Form.Item>
                        </div>
                    </Flex>

                    <Flex style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Total tickets</Text>
                            <Form.Item name="totalTickets" rules={[{ required: true }]}>
                                <InputNumber size="large" style={{ width: "100%", borderRadius: 12 }} min={0} />
                            </Form.Item>
                        </div>
                        <div style={{ width: 160 }}>
                            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Price</Text>
                            <Form.Item name="price" rules={[{ required: true }]}>
                                <InputNumber size="large" style={{ width: "100%", borderRadius: 12 }} min={0} step={0.01} />
                            </Form.Item>
                        </div>
                    </Flex>

                    <div>
                        <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Type</Text>
                        <Form.Item name="type">
                            <Input size="large" placeholder="Type (e.g. Concert, Conference)" style={{ borderRadius: 12 }} />
                        </Form.Item>
                    </div>

                    <div>
                        <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Images</Text>
                        <Form.Item>
                            <Upload
                                multiple
                                beforeUpload={handleBeforeUpload}
                                onRemove={handleRemove}
                                fileList={images.map((f, idx) => {
                                    const uid = f.uid ?? `file-${idx}`;
                                    const uploaded = uploadedImages.find((u) => u.uid === uid || u.name === f.name);
                                    return {
                                        uid,
                                        name: f.name,
                                        status: "done",
                                        url: uploaded?.url,
                                    };
                                })}
                                listType="picture"
                            >
                                <Button style={{ borderRadius: 12 }}>Select images</Button>
                            </Upload>
                        </Form.Item>
                    </div>

                    <div>
                        <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Tags</Text>
                        <Form.Item name="tags">
                            <Select mode="tags" placeholder="Tags" style={{ width: "100%" }} />
                        </Form.Item>
                    </div>

                    <Button type="primary" size="large" htmlType="submit" style={{ height: 48, borderRadius: 12, background: token.colorPrimary }}>
                        Create event
                    </Button>

                    <Divider style={{ margin: 8 }} />
                </Flex>
            </Form>
        </Modal>
    );
}