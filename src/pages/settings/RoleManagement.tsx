// 역할 관리 페이지 (Global Roles + Service Roles 통합)

import { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Alert } from 'antd';
import { GlobalOutlined, ApiOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import GlobalRolesTab from '../../components/settings/GlobalRolesTab';
import ServiceRolesTab from '../../components/settings/ServiceRolesTab';

const { Title, Text } = Typography;

export default function RoleManagement() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('global');

  // URL 경로에 따라 초기 탭 설정 (기본값: global)
  useEffect(() => {
    // /access/roles 경로에서는 기본적으로 글로벌 역할 탭을 표시
    // 사용자가 탭을 변경하지 않는 한 글로벌 역할이 기본값
    if (location.pathname.includes('/access/roles') || location.pathname.includes('/settings/roles')) {
      // 별도 처리 없이 기본값 'global' 유지
    }
  }, [location.pathname]);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 페이지 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            역할 관리 (Role Management)
          </Title>
          <Text type="secondary">
            플랫폼의 글로벌 역할과 서비스별 역할을 관리합니다
          </Text>
        </div>

        {/* 안내 메시지 */}
        <Alert
          message="역할 관리 시스템"
          description={
            <div>
              <p>AuthX 권한 시스템의 역할을 관리합니다.</p>
              <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                <li>
                  <strong>글로벌 역할(Global Roles)</strong>: 플랫폼 전체에 걸친 역할 (예: PLATFORM_ADMIN, SERVICE_ADMIN)
                </li>
                <li>
                  <strong>서비스 역할(Service Roles)</strong>: 특정 서비스에만 적용되는 역할 (예: ecg-analysis의 DOCTOR, TECHNICIAN)
                </li>
                <li>
                  <strong>권한 형식</strong>: resource:action (예: user:manage, hospital:admin, *:*)
                </li>
                <li>
                  <strong>권한 레벨</strong>: 1-100 범위, 낮을수록 높은 권한
                </li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Tabs for Global and Service Roles */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'global',
              label: (
                <span>
                  <GlobalOutlined />
                  글로벌 역할
                </span>
              ),
              children: <GlobalRolesTab />,
            },
            {
              key: 'service',
              label: (
                <span>
                  <ApiOutlined />
                  서비스 역할
                </span>
              ),
              children: <ServiceRolesTab />,
            },
          ]}
        />
      </Card>
    </div>
  );
}