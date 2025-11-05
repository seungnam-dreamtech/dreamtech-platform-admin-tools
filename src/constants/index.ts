// Application constants
// 애플리케이션 상수

// API endpoints - these will be configured for the actual backend
// API 엔드포인트 - 실제 백엔드에 맞게 구성됩니다
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  SERVICES: '/api/services',
  SCHEDULER: '/api/scheduler',
  NOTIFICATIONS: '/api/notifications',
  GATEWAY: '/api/gateway',
} as const;

// Application routes
// 애플리케이션 라우트
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_SILENT_CALLBACK: '/auth/silent-callback',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  SERVICES: '/services',
  SCHEDULER: '/scheduler',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  MONITORING: '/monitoring',
} as const;

// OAuth2/OpenID configuration - to be configured with actual auth server
// OAuth2/OpenID 구성 - 실제 인증 서버에 맞게 구성됩니다
export const AUTH_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID || 'dreamtech-admin-ui',
  AUTHORITY: import.meta.env.VITE_AUTH_AUTHORITY || 'http://localhost:8080/auth',
  REDIRECT_URI: import.meta.env.VITE_AUTH_REDIRECT_URI || 'http://localhost:5173/callback',
  SCOPE: 'openid profile email',
  RESPONSE_TYPE: 'code',
} as const;

// UI constants
// UI 상수
export const THEME = {
  PRIMARY_COLOR: '#1890ff',
  SUCCESS_COLOR: '#52c41a',
  WARNING_COLOR: '#faad14',
  ERROR_COLOR: '#f5222d',
} as const;

export const PAGE_SIZES = [10, 20, 50, 100] as const;

// Service status indicators
// 서비스 상태 지시자
export const SERVICE_STATUS = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  DEGRADED: 'degraded',
} as const;

export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  PUSH: 'push',
} as const;