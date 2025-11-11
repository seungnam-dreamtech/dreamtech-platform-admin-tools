// 사용자 관리 컴포넌트 테스트 페이지

import { useState } from 'react';
import { Card, CardContent, Button, Stack, Typography, Box } from '@mui/material';
import { UserDetailModal } from '../../components/user-management/UserDetailModal';
import { MOCK_USERS } from '../../constants/user-management';

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
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        사용자 관리 컴포넌트 테스트
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            테스트 시나리오
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            이 페이지는 사용자 관리 컴포넌트들을 테스트하기 위한 페이지입니다.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleAddUser}>
              신규 사용자 추가 테스트
            </Button>
            <Button variant="outlined" onClick={handleEditUser}>
              기존 사용자 수정 테스트 (신남기)
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            컴포넌트 구조
          </Typography>
          <Typography variant="body2" component="div">
            <strong>UserDetailModal</strong>
            <ul>
              <li><strong>기본 정보 탭:</strong> UserFormFields 컴포넌트 사용</li>
              <li><strong>서비스 가입 탭:</strong> ServiceSubscriptionManager 컴포넌트 (Transfer 스타일)</li>
              <li><strong>역할 및 권한 탭:</strong> RoleManager 컴포넌트 (플랫폼 역할 + 서비스별 역할)</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            AuthX 아키텍처 적용
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li><strong>User Type 기반 기본 역할:</strong> DOCTOR, PATIENT, ADMIN, PLATFORM_ADMIN</li>
              <li><strong>서비스 가입 관리:</strong> 비트마스크 기반 등록/활성화 상태</li>
              <li><strong>권한 해결 우선순위:</strong> User Type → Template → Individual</li>
              <li><strong>서비스별 역할:</strong> 각 서비스마다 독립적인 역할 계층 (ADMIN → MANAGER → VIEWER)</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <UserDetailModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        user={selectedUser}
      />
    </Box>
  );
}