// Common types used throughout the application
// 애플리케이션 전체에서 사용되는 공통 타입

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  lastLogin?: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Authentication types
// 인증 관련 타입
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Service management types
// 서비스 관리 관련 타입
export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  lastHealthCheck: Date;
}

export interface ScheduledJob {
  id: string;
  name: string;
  cronExpression: string;
  status: 'active' | 'inactive';
  nextRun: Date;
  lastRun?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push';
  template: string;
  variables: string[];
}