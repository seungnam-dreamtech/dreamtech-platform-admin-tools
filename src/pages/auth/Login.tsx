import React from 'react';
import { Card, Typography, Button, Box, CircularProgress } from '@mui/material';
import { Person as PersonIcon, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import { useSnackbar } from '../../contexts/SnackbarContext';

// Login page component - OIDC authentication
// 로그인 페이지 컴포넌트 - OIDC 인증
const Login: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
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
      snackbar.error(`로그인 오류: ${error}`);
    }
  }, [error, snackbar]);

  const handleOIDCLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      snackbar.error('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card sx={{ width: 400, textAlign: 'center', p: 3 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              DreamTech Admin
            </Typography>
            <Typography variant="body2" color="textSecondary">
              플랫폼 관리 도구에 로그인하세요
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={handleOIDCLogin}
              disabled={isLoading}
            >
              {isLoading ? '로그인 처리 중...' : 'OIDC로 로그인'}
            </Button>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              로그인하면 서비스 약관 및 개인정보 보호정책에 동의하는 것입니다.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;