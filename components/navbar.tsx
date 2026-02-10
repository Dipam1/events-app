'use client';

import { Layout, Menu, Button, theme, Flex, Avatar, Dropdown } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useThemeContext } from '@/app/providers';
import ThemeToggler from './themeToggleButton';
import { useSession, signOut } from 'next-auth/react';
import { UserOutlined } from '@ant-design/icons';
const { Header } = Layout;


export default function Navbar() {

  const items = [
    {
      key: '1',
      label: <Link href="/dashboard/my-profile">My Profile</Link>,
    },
    {
      key: '2',
      label: <Link href="/dashboard/my-events">My Events</Link>,
    },
    {
      key: '3',
      label: <Button type="primary" onClick={() => signOut({ redirect: false })}>
        Logout
      </Button>
    }]

  const { data: session, status } = useSession();
  const pathname = usePathname()
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const themeContext = useThemeContext();
  const { mode } = themeContext;


  const menuItems = [
    {
      key: '/',
      label: <Link href="/">Home</Link>,
    },
    {
      key: '/events',
      label: <Link href="/events">Events</Link>,
    },
    {
      key: '/about',
      label: <Link href="/about">About</Link>,
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: colorBgContainer, // Use theme background
        height: "70px",
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxShadow: ' 0 2px 4px rgba(0, 0, 0, 0.1), 0 25px 50px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Flex align="center" gap="small">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            style={{ filter: mode === 'dark' ? 'invert(1)' : 'none' }}
          />
        </Link>
      </Flex>

      <Menu
        mode="horizontal"
        selectedKeys={[pathname]}
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 0,
          justifyContent: 'center',
          borderBottom: 'none',
          background: 'transparent'
        }}
      />

      <ThemeToggler />
      <Flex align="center" gap="small" style={{ justifyContent: 'flex-end' }}>
        {(!isAuthPage && !session) && (
          <Link href="/login">
            <Button type="primary">Sign In</Button>
          </Link>
        )}

        {session && (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Avatar
              src={session.user?.image}
              icon={!session.user?.image && <UserOutlined />}
              style={{ cursor: 'pointer', border: `1px solid ${mode === 'dark' ? '#333' : '#eee'}` }}
            />
          </Dropdown>
        )}
      </Flex>
    </Header>
  );
}
