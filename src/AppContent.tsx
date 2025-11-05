import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import AuthCallback from './pages/auth/AuthCallback';
import SilentCallback from './pages/auth/SilentCallback';
import Dashboard from './pages/dashboard/Dashboard';
import GatewayRoutes from './pages/gateway/GatewayRoutes';
import PlatformUsers from './pages/user-management/PlatformUsers';
import OAuthClients from './pages/user-management/OAuthClients';
import PlatformServices from './pages/settings/PlatformServices';
import PermissionManagement from './pages/settings/PermissionManagement';
import RoleManagement from './pages/settings/RoleManagement';
import UserTypes from './pages/settings/UserTypes';
import PermissionTemplates from './pages/settings/PermissionTemplates';

// AppContent component that handles authentication-based routing
// 인증 기반 라우팅을 처리하는 AppContent 컴포넌트
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🚦 AppContent render:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    currentPath: window.location.pathname
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
      <Route path={ROUTES.AUTH_SILENT_CALLBACK} element={<SilentCallback />} />

      {/* Protected routes */}
      {isAuthenticated ? (
        <Route path="/*" element={<MainLayout />}>
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD.slice(1)} element={<Dashboard />} />
          <Route path={ROUTES.USERS.slice(1)} element={<PlatformUsers />} />
          <Route path="users/oauth-clients" element={<OAuthClients />} />
          <Route path={ROUTES.SERVICES.slice(1)} element={<GatewayRoutes />} />
          <Route path={ROUTES.SCHEDULER.slice(1)} element={<div>스케줄링 페이지 (구현 예정)</div>} />
          <Route path={ROUTES.NOTIFICATIONS.slice(1)} element={<div>알림 관리 페이지 (구현 예정)</div>} />
          <Route path={ROUTES.MONITORING.slice(1)} element={<div>모니터링 페이지 (구현 예정)</div>} />
          {/* 권한 & 역할 관리 */}
          <Route path="access/permissions" element={<PermissionManagement />} />
          <Route path="access/roles" element={<RoleManagement />} />
          <Route path="access/templates" element={<PermissionTemplates />} />

          {/* 시스템 설정 */}
          <Route path="system/services" element={<PlatformServices />} />
          <Route path="system/user-types" element={<UserTypes />} />

          {/* 레거시 경로 리다이렉트 (하위 호환성) */}
          <Route path={ROUTES.SETTINGS.slice(1)} element={<PlatformServices />} />
          <Route path="settings/services" element={<PlatformServices />} />
          <Route path="settings/permissions" element={<PermissionManagement />} />
          <Route path="settings/roles" element={<RoleManagement />} />
          <Route path="settings/user-types" element={<UserTypes />} />
          <Route path="settings/templates" element={<PermissionTemplates />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      )}
    </Routes>
  );
};

export default AppContent;
