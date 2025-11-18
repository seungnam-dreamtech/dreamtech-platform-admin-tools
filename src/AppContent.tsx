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
import AuthorityTemplates from './pages/settings/AuthorityTemplates';
import CommonCodes from './pages/settings/CommonCodes';
import Tasks from './pages/scheduler/Tasks';
import Schedules from './pages/scheduler/Schedules';
import PushTokens from './pages/notifications/PushTokens';
import UserEmails from './pages/notifications/UserEmails';
import NotificationHistory from './pages/notifications/NotificationHistory';
import SendNotification from './pages/notifications/SendNotification';
import AuditLogs from './pages/audit/AuditLogs';

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
          {/* 스케쥴러 관리 */}
          <Route path="scheduler/tasks" element={<Tasks />} />
          <Route path="scheduler/schedules" element={<Schedules />} />
          <Route path={ROUTES.SCHEDULER.slice(1)} element={<Tasks />} />
          {/* 알림 서비스 */}
          <Route path="notifications/send" element={<SendNotification />} />
          <Route path="notifications/push-tokens" element={<PushTokens />} />
          <Route path="notifications/emails" element={<UserEmails />} />
          <Route path="notifications/history" element={<NotificationHistory />} />
          <Route path={ROUTES.NOTIFICATIONS.slice(1)} element={<SendNotification />} />
          {/* 모니터링 & 감사 */}
          <Route path="audit/logs" element={<AuditLogs />} />
          <Route path={ROUTES.MONITORING.slice(1)} element={<div>모니터링 페이지 (구현 예정)</div>} />
          {/* 권한 & 역할 관리 */}
          <Route path="access/permissions" element={<PermissionManagement />} />
          <Route path="access/roles" element={<RoleManagement />} />
          <Route path="access/templates" element={<AuthorityTemplates />} />

          {/* 시스템 설정 */}
          <Route path="system/services" element={<PlatformServices />} />
          <Route path="system/user-types" element={<UserTypes />} />
          <Route path="system/codes" element={<CommonCodes />} />

          {/* 레거시 경로 리다이렉트 (하위 호환성) */}
          <Route path={ROUTES.SETTINGS.slice(1)} element={<PlatformServices />} />
          <Route path="settings/services" element={<PlatformServices />} />
          <Route path="settings/permissions" element={<PermissionManagement />} />
          <Route path="settings/roles" element={<RoleManagement />} />
          <Route path="settings/user-types" element={<UserTypes />} />
          <Route path="settings/templates" element={<AuthorityTemplates />} />
          <Route path="settings/codes" element={<CommonCodes />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      )}
    </Routes>
  );
};

export default AppContent;
