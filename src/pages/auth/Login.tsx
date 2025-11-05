import React from 'react';
import { Card, Typography, Button, Space, App, Spin } from 'antd';
import { UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';

const { Title, Text } = Typography;

// Login page component - OIDC authentication
// 로그인 페이지 컴포넌트 - OIDC 인증
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { login, isLoading, isAuthenticated, error } = useAuth();

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 로그인 에러가 있으면 메시지 표시
  React.useEffect(() => {
    if (error) {
      void message.error(`로그인 오류: ${error}`);
    }
  }, [error, message]);

  const handleOIDCLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      void message.error('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Spin spinning={isLoading}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <UserOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Title level={2}>DreamTech Admin</Title>
              <Text type="secondary">플랫폼 관리 도구에 로그인하세요</Text>
            </div>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                block
                icon={<LoginOutlined />}
                onClick={handleOIDCLogin}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? '로그인 처리 중...' : 'OIDC로 로그인'}
              </Button>
            </Space>
          </Space>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              로그인하면 서비스 약관 및 개인정보 보호정책에 동의하는 것입니다.
            </Text>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;