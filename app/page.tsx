"use client";

import "./globals.css";
import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Form,
  Input,
  Layout,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
  theme,
  Timeline,
  Typography,
  Modal,
} from "antd";
import Image from "next/image";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  StarFilled,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const Page = () => {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const { token } = theme.useToken();

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: token.colorBgLayout,
      }}
    >
      <Header
        style={{
          background: "transparent",
          padding: "24px 6vw 0",
        }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col>
            <Space size="middle" align="center">
              <Badge color="#4f46e5" text="Dipum" />
              <Text style={{ fontSize: 18, fontWeight: 600, color: token.colorText }}>
                Event Studio
              </Text>
              <Tag color="geekblue">2026</Tag>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <Button type="text">Browse</Button>
              <Button type="text">Pricing</Button>
              <Button type="text">Support</Button>
              <Button type="primary">Create event</Button>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: "24px 6vw 64px" }}>
        <Space orientation="vertical" size={48} style={{ width: "100%" }}>
          <Card
            style={{
              borderRadius: 24,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
              boxShadow: token.boxShadowTertiary,
            }}
            styles={{ body: { padding: "40px" } }}
          >
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12}>
                <Space orientation="vertical" size={24} style={{ width: "100%" }}>
                  <Tag color="blue" icon={<CalendarOutlined />}>Mega week</Tag>
                  <Title level={1} style={{ margin: 0, fontSize: 46 }}>
                    Plan, launch, and fill every seat for your next event.
                  </Title>
                  <Paragraph
                    style={{ fontSize: 16, color: token.colorTextSecondary }}
                  >
                    Dipum Event Studio blends discovery, ticketing, and community
                    into one platform. Build an experience people remember,
                    backed by real-time insights and smart automation.
                  </Paragraph>
                  <Space size="middle" wrap>
                    <Button
                      type="primary"
                      size="large"
                      icon={<RocketOutlined />}
                      onClick={() => setRsvpOpen(true)}
                    >
                      RSVP now
                    </Button>
                    <Button size="large" icon={<PlayCircleOutlined />}>
                      Watch the intro
                    </Button>
                    <Tag color="gold">Early access</Tag>
                  </Space>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic title="Active events" value={428} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Avg. fill" value={92} suffix="%" />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Cities" value={31} />
                    </Col>
                  </Row>
                  <Progress
                    percent={78}
                    showInfo={false}
                    strokeColor={token.colorPrimary}
                  />
                  <Text type="secondary" style={{ color: token.colorTextSecondary }}>
                    4,200 attendees already confirmed this week.
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  variant="borderless"
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: token.boxShadowSecondary,
                  }}
                  styles={{ body: { padding: 0 } }}
                >
                  <Carousel autoplay dots>
                    <div style={{ width: "100%" }}>
                      <Image
                        src="https://picsum.photos/seed/dipum-hero-1/900/700"
                        alt="Event crowd"
                        width={900}
                        height={380}
                        style={{ width: "100%", height: 380, objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ width: "100%" }}>
                      <Image
                        src="https://picsum.photos/seed/dipum-hero-2/900/700"
                        alt="Conference hall"
                        width={900}
                        height={380}
                        style={{ width: "100%", height: 380, objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ width: "100%" }}>
                      <Image
                        src="https://picsum.photos/seed/dipum-hero-3/900/700"
                        alt="Workshop session"
                        width={900}
                        height={380}
                        style={{ width: "100%", height: 380, objectFit: "cover" }}
                      />
                    </div>
                  </Carousel>
                </Card>
              </Col>
            </Row>
          </Card>

          <Row gutter={[24, 24]}>
            {[
              {
                title: "Smart curation",
                icon: <CompassOutlined />,
                text: "Personalized recommendations for every audience segment.",
              },
              {
                title: "Lightning check-ins",
                icon: <ThunderboltOutlined />,
                text: "QR-based entry and live attendance heatmaps.",
              },
              {
                title: "Trusted community",
                icon: <CheckCircleOutlined />,
                text: "Verified hosts and secure payments with instant payouts.",
              },
            ].map((item) => (
              <Col xs={24} md={8} key={item.title}>
                <Card
                  style={{
                    borderRadius: 18,
                    height: "100%",
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Space orientation="vertical" size={12}>
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: token.colorPrimaryBg,
                        color: token.colorPrimary,
                      }}
                      icon={item.icon}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                      {item.title}
                    </Title>
                    <Text type="secondary" style={{ color: token.colorTextSecondary }}>
                      {item.text}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            style={{
              borderRadius: 20,
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            styles={{ body: { padding: 32 } }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={16}>
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    Find your next experience
                  </Title>
                  <Text type="secondary" style={{ color: token.colorTextSecondary }}>
                    Filter by city, theme, and date. Your next favorite event is
                    one click away.
                  </Text>
                  <Form layout="vertical">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Form.Item label="City">
                          <Select
                            defaultValue="New York"
                            options={[
                              { value: "New York", label: "New York" },
                              { value: "London", label: "London" },
                              { value: "Berlin", label: "Berlin" },
                              { value: "Singapore", label: "Singapore" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label="Category">
                          <Select
                            defaultValue="Tech"
                            options={[
                              { value: "Tech", label: "Tech" },
                              { value: "Music", label: "Music" },
                              { value: "Design", label: "Design" },
                              { value: "Wellness", label: "Wellness" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label="Date">
                          <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Space>
                      <Button type="primary">Search events</Button>
                      <Button type="default">View calendar</Button>
                    </Space>
                  </Form>
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  style={{
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${token.colorPrimaryText}, ${token.colorPrimary})`,
                    color: token.colorTextLightSolid,
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Space orientation="vertical" size={12}>
                    <Text style={{ color: token.colorTextLightSolid }}>
                      Featured host
                    </Text>
                    <Title level={4} style={{ margin: 0, color: token.colorTextLightSolid }}>
                      Metro Labs Summit
                    </Title>
                    <Text style={{ color: token.colorTextLightSolid }}>
                      18 speakers, 12 workshops, live demos.
                    </Text>
                    <Button type="primary">Reserve seat</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card
            style={{
              borderRadius: 20,
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            styles={{ body: { padding: 32 } }}
          >
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              <Row align="middle" justify="space-between" gutter={[16, 16]}>
                <Col>
                  <Title level={3} style={{ margin: 0 }}>
                    Trending events
                  </Title>
                  <Text type="secondary" style={{ color: token.colorTextSecondary }}>
                    Curated by popularity and momentum this week.
                  </Text>
                </Col>
                <Col>
                  <Space>
                    <Button type="default">See all</Button>
                    <Button type="primary">Create event</Button>
                  </Space>
                </Col>
              </Row>
              <Tabs
                defaultActiveKey="tech"
                items={[
                  {
                    key: "tech",
                    label: "Tech",
                    children: (
                      <Row gutter={[16, 16]}>
                        {[
                          "Product Launch",
                          "AI Leadership",
                          "Cloud Builders",
                        ].map((title, index) => (
                          <Col xs={24} md={8} key={title}>
                            <Card
                              hoverable
                              cover={
                                <Image
                                  src={`https://picsum.photos/seed/tech-${index}/600/420`}
                                  alt={title}
                                  width={600}
                                  height={200}
                                  style={{ height: 200, objectFit: "cover", width: "100%" }}
                                />
                              }
                              style={{
                                borderRadius: 16,
                                overflow: "hidden",
                                background: token.colorBgContainer,
                                border: `1px solid ${token.colorBorderSecondary}`,
                              }}
                            >
                              <Space orientation="vertical" size={8}>
                                <Title level={5} style={{ margin: 0 }}>
                                  {title}
                                </Title>
                                <Text type="secondary">
                                  1,200 seats · Fri 8:00 PM
                                </Text>
                                <Space>
                                  <Tag color="blue">Hybrid</Tag>
                                  <Tag color="cyan">Featured</Tag>
                                </Space>
                                <Button type="link">View details</Button>
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ),
                  },
                  {
                    key: "music",
                    label: "Music",
                    children: (
                      <Row gutter={[16, 16]}>
                        {["Night Pulse", "City Beats", "Neon Stage"].map(
                          (title, index) => (
                            <Col xs={24} md={8} key={title}>
                              <Card
                                hoverable
                                cover={
                                  <Image
                                    src={`https://picsum.photos/seed/music-${index}/600/420`}
                                    alt={title}
                                    width={600}
                                    height={200}
                                    style={{ height: 200, objectFit: "cover", width: "100%" }}
                                  />
                                }
                                style={{
                                  borderRadius: 16,
                                  overflow: "hidden",
                                  background: token.colorBgContainer,
                                  border: `1px solid ${token.colorBorderSecondary}`,
                                }}
                              >
                                <Space orientation="vertical" size={8}>
                                  <Title level={5} style={{ margin: 0 }}>
                                    {title}
                                  </Title>
                                  <Text type="secondary">
                                    850 seats · Sat 9:30 PM
                                  </Text>
                                  <Space>
                                    <Tag color="magenta">Live</Tag>
                                    <Tag color="purple">VIP</Tag>
                                  </Space>
                                  <Button type="link">View details</Button>
                                </Space>
                              </Card>
                            </Col>
                          )
                        )}
                      </Row>
                    ),
                  },
                  {
                    key: "wellness",
                    label: "Wellness",
                    children: (
                      <Row gutter={[16, 16]}>
                        {["Morning Flow", "Mindful Reset", "Glow Retreat"].map(
                          (title, index) => (
                            <Col xs={24} md={8} key={title}>
                              <Card
                                hoverable
                                cover={
                                  <Image
                                    src={`https://picsum.photos/seed/well-${index}/600/420`}
                                    alt={title}
                                    width={600}
                                    height={200}
                                    style={{ height: 200, objectFit: "cover", width: "100%" }}
                                  />
                                }
                                style={{
                                  borderRadius: 16,
                                  overflow: "hidden",
                                  background: token.colorBgContainer,
                                  border: `1px solid ${token.colorBorderSecondary}`,
                                }}
                              >
                                <Space orientation="vertical" size={8}>
                                  <Title level={5} style={{ margin: 0 }}>
                                    {title}
                                  </Title>
                                  <Text type="secondary">
                                    400 seats · Sun 7:00 AM
                                  </Text>
                                  <Space>
                                    <Tag color="green">Outdoor</Tag>
                                    <Tag color="lime">New</Tag>
                                  </Space>
                                  <Button type="link">View details</Button>
                                </Space>
                              </Card>
                            </Col>
                          )
                        )}
                      </Row>
                    ),
                  },
                ]}
              />
            </Space>
          </Card>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={14}>
              <Card
                style={{
                  borderRadius: 20,
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
                styles={{ body: { padding: 32 } }}
              >
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    Live pulse
                  </Title>
                  <Text type="secondary">
                    Track how attendees engage before doors even open.
                  </Text>
                  <Row gutter={[16, 16]}>
                    {[
                      { title: "Check-ins ready", value: 86 },
                      { title: "Speakers confirmed", value: 11 },
                      { title: "Team tasks done", value: 74 },
                    ].map((stat) => (
                      <Col xs={24} md={8} key={stat.title}>
                        <Card
                          style={{
                            borderRadius: 16,
                            background: token.colorFillQuaternary,
                            border: `1px solid ${token.colorBorderSecondary}`,
                          }}
                          styles={{ body: { padding: 16 } }}
                        >
                          <Text type="secondary">{stat.title}</Text>
                          <Progress
                            percent={stat.value}
                            strokeColor={token.colorPrimary}
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <Timeline
                    items={[
                      {
                        color: "green",
                        content: "Venue locked in · 3 hours ago",
                      },
                      {
                        color: "blue",
                        content: "Lineup announced · yesterday",
                      },
                      {
                        color: "gray",
                        content: "RSVPs at 92% capacity",
                      },
                    ]}
                  />
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={10}>
              <Card
                style={{
                  borderRadius: 20,
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
                styles={{ body: { padding: 32 } }}
              >
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    Community voices
                  </Title>
                  <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                    {[
                      {
                        name: "Aisha Karim",
                        role: "Experience Director",
                        note: "Sold out in 48 hours with the new invite flow.",
                      },
                      {
                        name: "Leo Park",
                        role: "Founder",
                        note: "The insights dashboard is a game changer.",
                      },
                      {
                        name: "Morgan Lee",
                        role: "Producer",
                        note: "Check-in speed doubled and guests loved it.",
                      },
                    ].map((item) => (
                      <Card
                        key={item.name}
                        style={{
                          borderRadius: 16,
                          background: token.colorBgContainer,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                        styles={{ body: { padding: 16 } }}
                      >
                        <Space align="start" size={16}>
                          <Avatar icon={<UserOutlined />} />
                          <Space orientation="vertical" size={6}>
                            <Space>
                              <Text strong>{item.name}</Text>
                              <Tag color="gold">
                                <StarFilled /> 4.9
                              </Tag>
                            </Space>
                            <Text type="secondary">{item.role}</Text>
                            <Text>{item.note}</Text>
                          </Space>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>

          <Card
            style={{
              borderRadius: 20,
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            styles={{ body: { padding: 32 } }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={12}>
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    Frequently asked
                  </Title>
                  <Text type="secondary" style={{ color: token.colorTextSecondary }}>
                    Everything you need to know about hosting with Dipum.
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Collapse
                  accordion
                  items={[
                    {
                      key: "1",
                      label: "Can I host both online and in-person events?",
                      children:
                        "Yes. Create hybrid events with integrated streaming and venue check-ins.",
                    },
                    {
                      key: "2",
                      label: "How fast do payouts arrive?",
                      children:
                        "Payouts start within 24 hours after event completion.",
                    },
                    {
                      key: "3",
                      label: "Do you support team collaboration?",
                      children:
                        "Invite co-hosts, assign tasks, and sync run-of-show timelines.",
                    },
                  ]}
                />
              </Col>
            </Row>
          </Card>

          <Card
            style={{
              borderRadius: 24,
              background: `linear-gradient(120deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            styles={{ body: { padding: 40 } }}
          >
            <Row align="middle" justify="space-between" gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Space orientation="vertical" size={16}>
                  <Title level={2} style={{ margin: 0, color: token.colorTextLightSolid }}>
                    Ready to launch your next unforgettable event?
                  </Title>
                  <Text style={{ color: token.colorTextLightSolid }}>
                    Bring your community together with immersive stages, instant
                    check-ins, and real-time insights.
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  <Button type="primary" size="large" block>
                    Start building
                  </Button>
                  <Button size="large" block>
                    Talk to sales
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Space>
      </Content>

      <Divider style={{ margin: 0 }} />

      <Footer
        style={{
          background: token.colorBgLayout,
          padding: "32px 6vw",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[24, 24]} align="middle" justify="space-between">
          <Col>
            <Space orientation="vertical" size={6}>
              <Text strong>Dipum Event Studio</Text>
              <Text type="secondary">
                Crafted for creators, founders, and community builders.
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">support@dipum.io</Text>
              <Tag color="blue">@dipum.events</Tag>
            </Space>
          </Col>
        </Row>
      </Footer>

      <Modal
        title="Reserve your seat"
        open={rsvpOpen}
        onCancel={() => setRsvpOpen(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Full name" required>
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input type="email" placeholder="you@email.com" />
          </Form.Item>
          <Form.Item label="Event" required>
            <Select
              defaultValue="Skyline Summit"
              options={[
                { value: "Skyline Summit", label: "Skyline Summit" },
                { value: "Night Garden", label: "Night Garden" },
                { value: "Future Makers", label: "Future Makers" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Ticket type" required>
            <Select
              defaultValue="General"
              options={[
                { value: "General", label: "General" },
                { value: "VIP", label: "VIP" },
                { value: "Student", label: "Student" },
              ]}
            />
          </Form.Item>
          <Button type="primary" block onClick={() => setRsvpOpen(false)}>
            Confirm RSVP
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Page;
