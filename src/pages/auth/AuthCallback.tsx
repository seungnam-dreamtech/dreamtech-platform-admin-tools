// OIDC 인증 콜백 페이지

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CircularProgress, Alert, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, handleAuthCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 인증 상태가 true가 되면 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !isProcessing) {
      console.log('🎉 AuthCallback: Authentication state changed to true, redirecting to dashboard');
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, isProcessing, navigate]);

  // 초기 콜백 처리
  useEffect(() => {
    let cancelled = false;

    const processCallback = async () => {
      try {
        // URL에서 authorization code 확인
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          throw new Error(`인증 오류: ${errorParam}`);
        }

        if (!code) {
          throw new Error('Authorization code가 없습니다.');
        }

        console.log('🔄 AuthCallback: Processing authorization code...');
        setIsProcessing(true);

        // AuthContext의 handleAuthCallback 사용 (단일 UserManager 인스턴스 사용)
        const user = await handleAuthCallback();

        // 컴포넌트가 언마운트되었으면 상태 업데이트 하지 않음
        if (cancelled) return;

        if (user) {
          console.log('🎉 AuthCallback: Authentication successful', {
            user: user.profile,
            isExpired: user.expired,
            accessToken: user.access_token ? 'present' : 'missing'
          });

          // URL에서 code와 state 파라미터 제거
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);

          // AuthContext가 이미 사용자 상태를 업데이트했으므로 추가 작업 불필요
        } else {
          throw new Error('No user returned from authentication');
        }
      } catch (error) {
        if (cancelled) return;

        console.error('Authentication callback error:', error);
        setError(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.');

        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          if (!cancelled) {
            navigate(ROUTES.LOGIN, { replace: true });
          }
        }, 3000);
      } finally {
        if (!cancelled) {
          setIsProcessing(false);
        }
      }
    };

    processCallback();

    // Cleanup 함수
    return () => {
      cancelled = true;
    };
  }, [navigate, location.search, handleAuthCallback]);

  if (error) {
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
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              로그인 실패
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
          <Typography variant="body2" color="textSecondary">
            잠시 후 로그인 페이지로 이동합니다...
          </Typography>
        </Card>
      </Box>
    );
  }

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
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={48} />
        </Box>
        <Typography variant="body2" color="textSecondary">
          {isProcessing ? '로그인 처리 중...' : '인증 완료, 대시보드로 이동 중...'}
        </Typography>
      </Card>
    </Box>
  );
};

export default AuthCallback;