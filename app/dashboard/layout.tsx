"use client";

import { Layout, Menu, theme, Typography } from 'antd'
import { Content, Header } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Title } = Typography;

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
    const { token } = theme.useToken();
    const router = useRouter();
    const pathname = usePathname();

    const currentTab = pathname.split('/').pop() || 'my-profile';

    const dashboardMenuChange = (key: string) => {
        router.push(`/dashboard/${key}`);
    }


    const menuItems = [
        {
            key: 'my-profile',
            icon: <UserOutlined />,
            label: 'Profile Information',
        },
        {
            key: 'my-events',
            icon: <CalendarOutlined />,
            label: 'My Events',
        },
    ];

    return (
        <Layout style={{ height: 'calc(100vh - 70px)', background: token.colorBgLayout, overflow: 'hidden' }}>
            <Sider collapsible width="250px" style={{ background: token.colorBgContainer }}>
                <Title level={5} className='text-center my-3'>Options</Title>
                <Menu
                    mode="inline"
                    selectedKeys={[currentTab]}
                    onClick={({ key }) => dashboardMenuChange(key)}
                    items={menuItems}
                    style={{ height: '100%', borderRight: 0 }}
                />
            </Sider>
            <Layout style={{ padding: '24px' }}>
                <Content style={{
                    background: token.colorBgContainer,
                    padding: 24,
                    borderRadius: token.borderRadiusLG
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default ProfileLayout