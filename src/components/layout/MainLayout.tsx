import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, theme, App } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  MonitorOutlined,
  ScheduleOutlined,
  NotificationOutlined,
  ApiOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Main layout component for the admin interface
// 관리자 인터페이스를 위한 메인 레이아웃 컴포넌트
const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: '사용자 관리',
      children: [
        {
          key: ROUTES.USERS,
          label: '플랫폼 사용자',
        },
        {
          key: '/users/oauth-clients',
          label: 'OAuth 클라이언트',
        },
      ],
    },
    {
      key: 'access-control',
      icon: <SafetyOutlined />,
      label: '권한 & 역할',
      children: [
        {
          key: '/access/permissions',
          label: '권한 정의',
        },
        {
          key: '/access/roles',
          label: '역할 관리',
        },
        {
          key: '/access/templates',
          label: '권한 템플릿',
        },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '시스템 설정',
      children: [
        {
          key: '/system/services',
          label: '서비스 스코프',
        },
        {
          key: '/system/user-types',
          label: '사용자 유형',
        },
      ],
    },
    {
      key: ROUTES.SERVICES,
      icon: <ApiOutlined />,
      label: 'API Gateway',
    },
    {
      key: ROUTES.SCHEDULER,
      icon: <ScheduleOutlined />,
      label: '스케줄링',
    },
    {
      key: ROUTES.NOTIFICATIONS,
      icon: <NotificationOutlined />,
      label: '알림 관리',
    },
    {
      key: ROUTES.MONITORING,
      icon: <MonitorOutlined />,
      label: '모니터링',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = async ({ key }: { key: string }) => {
    switch (key) {
      case 'logout':
        try {
          await logout();
          message.success('로그아웃되었습니다.');
        } catch (error) {
          console.error('Logout error:', error);
          message.error('로그아웃 중 오류가 발생했습니다.');
        }
        break;
      case 'profile':
        // Navigate to profile
        // 프로필로 이동
        console.log('Profile clicked');
        break;
      default:
        break;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{
          padding: '16px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {collapsed ? 'DT' : 'DreamTech Admin'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 16px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: '18px', cursor: 'pointer' }
            })}
          </div>
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <Text style={{ marginLeft: 8 }}>{user?.profile?.name || user?.profile?.preferred_username || '사용자'}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{
          margin: '16px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;