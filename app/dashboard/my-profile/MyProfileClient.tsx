"use client";

import useUser from "@/lib/useUser";

import {
  Avatar,
  Card,
  Descriptions,
  Spin,
  Alert,
  Typography,
  Divider,
  theme,
  Button,
  Input,
  Upload,
  message,
  Row,
  Col,
  Grid
} from "antd";
import { useState, useCallback, useEffect } from "react";
import { EditOutlined } from "@ant-design/icons";
import uploadAvatar from "@/lib/uploadAvatar";

const { useBreakpoint } = Grid;


const MyProfileClient = () => {
  const { user, error, isLoading, mutate } = useUser();
  const { token } = theme.useToken();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  const breakpoint = useBreakpoint();
  const descriptionLayout = breakpoint.lg ? "horizontal" : "vertical";




  /** Handle profile field edits - TODO: implement actual save logic */
  const onEditProfile = useCallback((key: string, value: string) => {
    console.log("Editing profile field:", { key, value });
    // TODO: Add API call to update user profile
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" description={(error as Error).message || String(error)} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="warning" />
      </div>
    );
  }

  /** Handle avatar file selection and upload */
  const handleAvatarUpload = async (uploadFile: { file: File }): Promise<void> => {
    const success = await uploadAvatar(uploadFile.file);
    if (success) {
      messageApi.success("Avatar updated successfully");
      // Refresh user data to reflect new avatar
      await mutate("/api/user");
    } else {
      messageApi.error("Failed to upload avatar");
    }
  };

  const startEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditedValue(currentValue ?? "");
  };

  const saveEdit = (key: string) => {
    onEditProfile(key, editedValue);
    setEditingKey(null);
  };

  return (
    <Card
      style={{ borderRadius: 16, background: token.colorBgContainer }}
    >
      {contextHolder}
      <Row style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Col style={{ position: "relative", cursor: "pointer" }} className="avatar-container">
          <Avatar size={96} src={user.profilePictureUrl || undefined}>
            {!user.profilePictureUrl && user.name ? user.name.charAt(0) : ""}
          </Avatar>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              transition: "opacity 0.18s ease",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.45)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <Upload
              name="avatar"
              accept="image/*"
              className="avatar-uploader"
              customRequest={handleAvatarUpload}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
            >
              <EditOutlined style={{ fontSize: 22, color: "#fff" }} />
            </Upload>
          </div>
        </Col>
        <div>
          <Typography.Title style={{ marginBottom: 4 }}>{user.name}</Typography.Title>
          <Typography.Text type="secondary">{user.email}</Typography.Text>
        </div>
      </Row>

      <Divider />

      <Descriptions
        column={1}
        bordered
        layout={descriptionLayout}
      >
        {[
          { label: "Phone", key: "phoneNumber", raw: user.phoneNumber || "" },
          { label: "Email", key: "email", raw: user.email || "" },
        ].map((f) => (
          <Descriptions.Item key={f.key} label={f.label}>
            <Row>
              <Col style={{ flex: 1 }}>
                {editingKey === f.key ? (
                  <Input
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    onPressEnter={() => saveEdit(f.key)}
                    onBlur={() => saveEdit(f.key)}
                    autoFocus
                  />
                ) : (
                  <span>
                    {f.key === "createdAt" || f.key === "updatedAt"
                      ? f.raw
                        ? new Date(f.raw).toLocaleString()
                        : "-"
                      : f.raw || "-"}
                  </span>
                )}
              </Col>
              <Col>
                <Button
                  type="link"
                  onClick={() => {
                    if (editingKey === f.key) {
                      saveEdit(f.key);
                    } else {
                      startEdit(f.key, f.raw);
                    }
                  }}
                >
                  {editingKey === f.key ? "Save" : "Edit"}
                </Button>
              </Col>
            </Row>
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  );
};

export default MyProfileClient;
