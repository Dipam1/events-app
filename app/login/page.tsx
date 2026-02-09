'use client'
import { Button, Card, Divider, Flex, Form, Input, Typography, message, theme } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { Title, Text } = Typography
  const { token } = theme.useToken()
  const [form] = Form.useForm();
  const router = useRouter();

  const submitForm = async (formData: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        message.error("Invalid email or password");
      } else {
        message.success("Logged in successfully");
        router.push('/');
        router.refresh(); // Refresh to ensure session is updated
      }
    } catch (error) {
      message.error((error as Error).message || "Something went wrong");
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
        height: 'calc(100vh - 70px)',
        overflow: 'hidden',
        padding: '24px 24px 64px',
      }}
    >
      <Flex
        vertical
        align="center"
        gap={40}
        style={{ width: '100%', maxWidth: 960 }}
      >
        <header style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Welcome back
          </Title>
          <Text type="secondary">
            Sign in to manage your events and reservations.
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
              maxWidth: 420,
            }}
          >
            <Form<LoginFormData> onFinish={submitForm} form={form} layout="vertical">
              <Flex vertical gap={1}>
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
                  <Title level={3} style={{ marginBottom: 10, marginTop: 8 }}>
                    Login
                  </Title>
                </div>

                <Flex vertical>
                  <Text style={{ display: 'block', marginBottom: 2, fontSize: 14, fontWeight: 500 }}>
                    Email address
                  </Text>
                  <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}>
                    <Input
                      size="large"
                      placeholder="you@example.com"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                </Flex>
                <Flex vertical>
                  <Flex align="center" justify="space-between" style={{ marginBottom: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: 500 }}>
                      Password
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Forgot password?
                    </Text>
                  </Flex>
                  <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                    <Input.Password
                      size="large"
                      placeholder="••••••••"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                </Flex>

                <Button
                  size="large"
                  type="primary"
                  style={{ height: 48, borderRadius: 12 }}
                  htmlType="submit"
                >
                  Sign in
                </Button>

                <Divider style={{ margin: '8px 0' }}>or</Divider>

                {/* <Button size="large" style={{ height: 48, borderRadius: 12 }}>
                Continue with Google
              </Button> */}

                <Text type="secondary" style={{ textAlign: 'center', fontSize: 14 }}>
                  New here? <Link href="/signup" style={{ fontWeight: 600 }}>Create an account</Link>
                </Text>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default LoginPage