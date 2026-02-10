'use client'
import { Button, Card, Divider, Flex, Form, Input, Radio, Tooltip, Typography, message, theme } from 'antd'
import { useSession } from 'next-auth/react';
import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'USER' | 'ORGANIZER';
}

const SignupPage = () => {
  const { Title, Text } = Typography
  const { token } = theme.useToken()

  const router = useRouter();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();


  const { data: session } = useSession();
  if (session) {
    messageApi.success("You are already logged in.");
    router.push('/')
  }

  const submitForm = async () => {
    let shouldRedirect = false;
    try {
      const formData = new FormData();
      formData.append('name', form.getFieldValue('name'));
      formData.append('email', form.getFieldValue('email'));
      formData.append('password', form.getFieldValue('password'));
      formData.append('phoneNumber', form.getFieldValue('phoneNumber'));
      formData.append('role', form.getFieldValue('role'));

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json();
      if (data.success) {
        messageApi.success(data.message || "Please login to continue");
        shouldRedirect = true;
      } else {
        messageApi.error(data.message || "Something went wrong");
      }
    } catch (error) {
      messageApi.error((error as Error).message || "Something went wrong");
    }

    if (shouldRedirect) {
      redirect('/login');
    }
  }

  return (
    <Flex

      vertical
      align="center"
      justify="center"
      style={{
        background: token.colorBgLayout,
        color: token.colorText,
        minHeight: 'calc(100vh - 70px)',
        padding: '24px 24px 64px',
      }}
    >{contextHolder}
      <Flex
        vertical
        align="center"
        gap={40}
        style={{ width: '100%', maxWidth: 960 }}
      >
        <header style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
          <Title level={2}>
            Create your account
          </Title>
          <Text type="secondary">
            Join Dipum Event to host or attend unforgettable moments.
          </Text>
        </header>

        <Flex align="center" justify="center" style={{ width: '100%' }}>
          <Card
            styles={{
              body: { padding: 32 },
              header: { borderBottom: 0 },
            }}
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: token.boxShadowTertiary,
              borderRadius: 20,
              width: '100%',
              maxWidth: 520,
            }}
          >
            <Form<SignupFormData> onFinish={submitForm} form={form}>

              <Flex vertical gap={18}>
                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                    }}
                  >
                    Dipum Event
                  </Text>
                  <Title level={3} style={{ marginBottom: 0, marginTop: 8 }}>
                    Sign up
                  </Title>
                </div>

                <Flex vertical gap={1}>
                  <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>
                    Name
                  </Text>
                  <Form.Item rules={[{ required: true, message: "Required Field." }]} name="name">
                    <Input
                      size="large"
                      placeholder="Full name"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                  <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>
                    Email
                  </Text>
                  <Form.Item rules={[{ required: true, message: "Required Field." }]} name="email">
                    <Input
                      size="large"
                      placeholder="you@example.com"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                  <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>
                    Password
                  </Text>
                  <Form.Item rules={[{ required: true, message: "Required Field." }]} name="password">
                    <Input.Password
                      size="large"
                      placeholder="Create a strong password"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                  <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>
                    Phone number
                  </Text>
                  <Form.Item rules={[{ required: true, message: "Required Field." }]} name="phoneNumber">
                    <Input
                      size="large"
                      placeholder="+1 (555) 000-0000"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                  <Text style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>
                    Role
                  </Text>
                  <Form.Item rules={[{ required: true, message: "Required Field." }]} name="role">
                    <Radio.Group
                      style={{ display: 'flex', gap: 16 }}
                    >
                      <Tooltip
                        title="Organizer accounts require verification."
                        placement="right"
                      >
                        <Radio value="USER">User</Radio>
                        <Radio value="ORGANIZER">Organizer</Radio>
                      </Tooltip>
                    </Radio.Group>
                  </Form.Item>
                </Flex>

                <Button
                  size="large"
                  type="primary"
                  style={{ height: 48, borderRadius: 12 }}
                  htmlType="submit"
                >
                  Create account
                </Button>

                <Divider style={{ margin: '8px 0' }} />

                <Text type="secondary" style={{ textAlign: 'center', fontSize: 14 }}>
                  Already have an account? <Link href="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                </Text>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </Flex >
    </Flex >
  )
}

export default SignupPage