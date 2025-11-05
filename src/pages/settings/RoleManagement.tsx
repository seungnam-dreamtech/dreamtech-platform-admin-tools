// 역할 관리 페이지 (Global Roles + Service Roles 통합)

import { useState, useEffect } from 'react';
import { Tabs, Space } from 'antd';
import { GlobalOutlined, ApiOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import GlobalRolesTab from '../../components/settings/GlobalRolesTab';
import ServiceRolesTab from '../../components/settings/ServiceRolesTab';

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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            역할 관리 (Role Management)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            플랫폼의 글로벌 역할과 서비스별 역할을 관리합니다
          </span>
        </div>
      </div>

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
    </Space>
  );
}