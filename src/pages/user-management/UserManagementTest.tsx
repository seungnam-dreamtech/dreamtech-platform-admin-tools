// 사용자 관리 컴포넌트 테스트 페이지

import { useState } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { UserDetailModal } from '../../components/user-management/UserDetailModal';
import { MOCK_USERS } from '../../constants/user-management';

const { Title, Paragraph } = Typography;

export default function UserManagementTest() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditUser = () => {
    // 첫 번째 Mock 사용자로 테스트
    setSelectedUser(MOCK_USERS[0]);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    console.log('사용자 저장 성공!');
    setModalOpen(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>사용자 관리 컴포넌트 테스트</Title>

      <Card title="테스트 시나리오" style={{ marginBottom: 24 }}>
        <Paragraph>
          이 페이지는 사용자 관리 컴포넌트들을 테스트하기 위한 페이지입니다.
        </Paragraph>

        <Space>
          <Button type="primary" onClick={handleAddUser}>
            신규 사용자 추가 테스트
          </Button>
          <Button onClick={handleEditUser}>
            기존 사용자 수정 테스트 (신남기)
          </Button>
        </Space>
      </Card>

      <Card title="컴포넌트 구조" style={{ marginBottom: 24 }}>
        <Paragraph>
          <strong>UserDetailModal</strong>
          <ul>
            <li><strong>기본 정보 탭:</strong> UserFormFields 컴포넌트 사용</li>
            <li><strong>서비스 가입 탭:</strong> ServiceSubscriptionManager 컴포넌트 (Transfer 스타일)</li>
            <li><strong>역할 및 권한 탭:</strong> RoleManager 컴포넌트 (플랫폼 역할 + 서비스별 역할)</li>
          </ul>
        </Paragraph>
      </Card>

      <Card title="AuthX 아키텍처 적용">
        <Paragraph>
          <ul>
            <li><strong>User Type 기반 기본 역할:</strong> DOCTOR, PATIENT, ADMIN, PLATFORM_ADMIN</li>
            <li><strong>서비스 가입 관리:</strong> 비트마스크 기반 등록/활성화 상태</li>
            <li><strong>권한 해결 우선순위:</strong> User Type → Template → Individual</li>
            <li><strong>서비스별 역할:</strong> 각 서비스마다 독립적인 역할 계층 (ADMIN → MANAGER → VIEWER)</li>
          </ul>
        </Paragraph>
      </Card>

      <UserDetailModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        user={selectedUser}
      />
    </div>
  );
}