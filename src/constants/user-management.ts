// 사용자 관리 상수 및 Mock 데이터 (AuthX 아키텍처 기반)

import type {
  PlatformUser,
  PlatformService,
  OAuthClient,
  PlatformRole,
  ServiceRole,
  AuthorityTemplate,
  UserTypeDefinition,
} from '../types/user-management';

// ==================== 사용자 유형 정의 (user_type_definitions 테이블 기반) ====================

/**
 * Mock User Type Definitions - 실제 DB 데이터 기반
 */
export const MOCK_USER_TYPE_DEFINITIONS: UserTypeDefinition[] = [
  {
    typeId: 'USER',
    displayName: '일반 사용자',
    description: '기본 플랫폼 사용자',
    isActive: true,
    isSystemType: true,
    displayOrder: 90,
    createdAt: '2025-08-05T07:28:01.078772Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'PLATFORM_ADMIN',
    displayName: '플랫폼 관리자',
    description: '플랫폼 전체를 관리하는 최고 관리자',
    isActive: true,
    isSystemType: true,
    displayOrder: 80,
    createdAt: '2025-08-05T07:28:01.183225Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'ADMIN',
    displayName: '시스템 관리자',
    description: '시스템 전반을 관리하는 관리자',
    isActive: true,
    isSystemType: true,
    displayOrder: 70,
    createdAt: '2025-08-05T07:28:01.117937Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'SERVICE_MANAGER',
    displayName: '서비스 관리자',
    description: '시스템 서비스를 관리하는 관리자',
    isActive: true,
    isSystemType: true,
    displayOrder: 60,
    createdAt: '2025-08-05T07:28:01.150286Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'EAL_TECHNICIAN',
    displayName: 'ECG Assist Lite 서비스 소속 분석 전문가',
    description: 'ECG Assist Lite 서비스의 ECG 분석 전문가',
    isActive: true,
    isSystemType: true,
    displayOrder: 40,
    createdAt: '2025-08-05T07:28:01.315650Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'EAL_DOCTOR',
    displayName: 'ECG Assist Lite 서비스 소속 의사',
    description: 'ECG Assist Lite 서비스의 의사',
    isActive: true,
    isSystemType: true,
    displayOrder: 30,
    createdAt: '2025-08-05T07:28:01.283081Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'EAL_MANAGER',
    displayName: 'ECG Assist Lite 서비스 책임자',
    description: 'ECG Assist Lite 서비스의 중간 관리자',
    isActive: true,
    isSystemType: true,
    displayOrder: 20,
    createdAt: '2025-08-05T07:28:01.249603Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'EAL_ADMIN',
    displayName: 'ECG Assist Lite 서비스 관리자',
    description: 'ECG Assist Lite 서비스의 관리자.',
    isActive: true,
    isSystemType: true,
    displayOrder: 10,
    createdAt: '2025-08-05T07:28:01.216173Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
  {
    typeId: 'EAL_CLINICIAN',
    displayName: 'ECG Assist Lite 서비스 소속 분석 담당자',
    description: 'ECG Assist Lite 서비스의 ECG 분석 담당자',
    isActive: true,
    isSystemType: true,
    displayOrder: 50,
    createdAt: '2025-08-05T07:28:01.348012Z',
    createdBy: 'SYSTEM_MIGRATION',
  },
];

/**
 * 활성화된 User Type만 필터링 (displayOrder 순으로 정렬)
 */
export const ACTIVE_USER_TYPES = MOCK_USER_TYPE_DEFINITIONS
  .filter(type => type.isActive)
  .sort((a, b) => a.displayOrder - b.displayOrder);

/**
 * User Type 선택 옵션 (Ant Design Select용)
 */
export const USER_TYPE_OPTIONS = ACTIVE_USER_TYPES.map(type => ({
  label: type.displayName,
  value: type.typeId,
  description: type.description,
}));

/**
 * 하위 호환성을 위한 USER_TYPES alias
 * @deprecated USER_TYPE_OPTIONS를 사용하세요
 */
export const USER_TYPES = USER_TYPE_OPTIONS;

// ==================== 플랫폼 역할 정의 ====================

export const PLATFORM_ROLES: PlatformRole[] = [
  {
    id: 'platform-admin',
    name: 'PLATFORM_ADMIN',
    displayName: '플랫폼 관리자',
    description: '플랫폼 전체에 대한 최고 관리 권한',
    permissions: ['*:*'],
    isSystem: true,
  },
  {
    id: 'platform-operator',
    name: 'PLATFORM_OPERATOR',
    displayName: '플랫폼 운영자',
    description: '플랫폼 운영 및 모니터링 권한',
    permissions: ['platform:read', 'platform:monitor', 'service:read'],
    isSystem: true,
  },
  {
    id: 'admin',
    name: 'ADMIN',
    displayName: '관리자',
    description: '시스템 관리자',
    permissions: ['user:manage', 'service:manage'],
    isSystem: true,
  },
  {
    id: 'doctor',
    name: 'DOCTOR',
    displayName: '의사',
    description: '진단 의사 기본 역할',
    permissions: ['patient:read', 'diagnosis:write'],
    isSystem: true,
  },
  {
    id: 'patient',
    name: 'PATIENT',
    displayName: '환자',
    description: '환자 기본 역할',
    permissions: ['profile:read', 'profile:update'],
    isSystem: true,
  },
];

// ==================== 서비스별 역할 정의 ====================

export const SERVICE_ROLES: Record<string, ServiceRole[]> = {
  'auth': [
    {
      id: 'auth-admin',
      name: 'AUTH_ADMIN',
      displayName: '인증 관리자',
      description: '인증 서비스 전체 관리 권한',
      permissions: ['auth:*'],
      isDefault: false,
    },
    {
      id: 'auth-user',
      name: 'AUTH_USER',
      displayName: '인증 사용자',
      description: '기본 인증 사용자 권한',
      permissions: ['auth:read', 'auth:self'],
      isDefault: true,
    },
  ],
  'healthcare': [
    {
      id: 'healthcare-admin',
      name: 'HEALTHCARE_ADMIN',
      displayName: '의료 서비스 관리자',
      description: '의료 서비스 전체 관리 권한',
      permissions: ['healthcare:*'],
      isDefault: false,
    },
    {
      id: 'healthcare-viewer',
      name: 'HEALTHCARE_VIEWER',
      displayName: '의료 정보 조회자',
      description: '의료 정보 조회 권한',
      permissions: ['patient:read', 'diagnosis:read'],
      isDefault: false,
    },
    {
      id: 'prescription-writer',
      name: 'PRESCRIPTION_WRITER',
      displayName: '처방전 작성자',
      description: '처방전 작성 및 수정 권한',
      permissions: ['prescription:create', 'prescription:update', 'prescription:read'],
      isDefault: false,
    },
    {
      id: 'healthcare-patient',
      name: 'HEALTHCARE_PATIENT',
      displayName: '의료 서비스 환자',
      description: '환자 본인 정보 조회 권한',
      permissions: ['patient:read:self'],
      isDefault: true,
    },
  ],
  'notification': [
    {
      id: 'notification-admin',
      name: 'NOTIFICATION_ADMIN',
      displayName: '알림 관리자',
      description: '알림 서비스 전체 관리 권한',
      permissions: ['notification:*'],
      isDefault: false,
    },
    {
      id: 'notification-sender',
      name: 'NOTIFICATION_SENDER',
      displayName: '알림 발송자',
      description: '알림 발송 권한',
      permissions: ['notification:send', 'notification:template:manage'],
      isDefault: false,
    },
    {
      id: 'notification-subscriber',
      name: 'NOTIFICATION_SUBSCRIBER',
      displayName: '알림 구독자',
      description: '알림 수신 권한',
      permissions: ['notification:receive', 'notification:read'],
      isDefault: true,
    },
  ],
  'schedule': [
    {
      id: 'schedule-admin',
      name: 'SCHEDULE_ADMIN',
      displayName: '스케줄 관리자',
      description: '스케줄 서비스 전체 관리 권한',
      permissions: ['schedule:*'],
      isDefault: false,
    },
    {
      id: 'schedule-manager',
      name: 'SCHEDULE_MANAGER',
      displayName: '스케줄 매니저',
      description: '스케줄 생성 및 관리 권한',
      permissions: ['schedule:create', 'schedule:update', 'schedule:delete', 'schedule:read'],
      isDefault: false,
    },
    {
      id: 'schedule-viewer',
      name: 'SCHEDULE_VIEWER',
      displayName: '스케줄 조회자',
      description: '스케줄 조회 권한',
      permissions: ['schedule:read'],
      isDefault: true,
    },
  ],
};

// ==================== Mock 플랫폼 서비스 ====================

export const MOCK_SERVICES: PlatformService[] = [
  {
    id: 'auth',
    name: 'auth',
    displayName: 'Authentication Service',
    description: 'OAuth2/OpenID Connect 기반 인증 및 권한 관리 서비스',
    status: 'active',
    version: '1.5.0',
    endpoint: 'https://api.cadiacinsight.com/auth',
    icon: '🔐',
    subscriberCount: 203,
    activeSubscriberCount: 198,
    availableRoles: SERVICE_ROLES['auth'],
    defaultRole: 'AUTH_USER',
    requiresApproval: false,
    createdAt: '2023-11-01T09:00:00Z',
    updatedAt: '2025-01-09T10:45:00Z',
  },
  {
    id: 'healthcare',
    name: 'healthcare',
    displayName: 'Healthcare Service',
    description: 'AI 기반 ECG 분석 및 의료 데이터 관리 서비스',
    status: 'active',
    version: '2.1.0',
    endpoint: 'https://api.cadiacinsight.com/healthcare',
    icon: '💓',
    subscriberCount: 142,
    activeSubscriberCount: 128,
    availableRoles: SERVICE_ROLES['healthcare'],
    defaultRole: 'HEALTHCARE_PATIENT',
    requiresApproval: true,
    maxSubscribers: 500,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2025-01-05T14:30:00Z',
  },
  {
    id: 'notification',
    name: 'notification',
    displayName: 'Notification Service',
    description: '통합 알림 발송 및 관리 서비스 (Email, SMS, Push)',
    status: 'active',
    version: '1.3.2',
    endpoint: 'https://api.cadiacinsight.com/notification',
    icon: '🔔',
    subscriberCount: 89,
    activeSubscriberCount: 85,
    availableRoles: SERVICE_ROLES['notification'],
    defaultRole: 'NOTIFICATION_SUBSCRIBER',
    requiresApproval: false,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2025-01-08T11:15:00Z',
  },
  {
    id: 'schedule',
    name: 'schedule',
    displayName: 'Scheduling Service',
    description: '작업 스케줄링 및 배치 처리 서비스',
    status: 'active',
    version: '1.2.0',
    endpoint: 'https://api.cadiacinsight.com/schedule',
    icon: '📅',
    subscriberCount: 56,
    activeSubscriberCount: 52,
    availableRoles: SERVICE_ROLES['schedule'],
    defaultRole: 'SCHEDULE_VIEWER',
    requiresApproval: false,
    createdAt: '2024-04-10T08:00:00Z',
    updatedAt: '2025-01-07T16:20:00Z',
  },
];

// ==================== 서비스 비트마스크 헬퍼 ====================

export const SERVICE_BIT_MAPPING: Record<string, number> = {
  'auth': 1,           // 0001
  'healthcare': 2,     // 0010
  'notification': 4,   // 0100
  'schedule': 8,       // 1000
};

export function calculateServiceBitmask(serviceIds: string[]): number {
  return serviceIds.reduce((mask, serviceId) => {
    return mask | (SERVICE_BIT_MAPPING[serviceId] || 0);
  }, 0);
}

export function getServicesFromBitmask(bitmask: number): string[] {
  return Object.entries(SERVICE_BIT_MAPPING)
    .filter(([, bit]) => (bitmask & bit) !== 0)
    .map(([serviceId]) => serviceId);
}

// ==================== Mock 사용자 데이터 ====================

export const MOCK_USERS: PlatformUser[] = [
  {
    id: '0197e37f-c0f5-78b4-a705-b01f8fe6844e',
    email: 'snk81@idreamtech.co.kr',
    name: '신남기',
    phoneNumber: '+82-10-1234-5678',
    status: 'active',
    userType: 'PLATFORM_ADMIN',
    platformRoles: ['PLATFORM_ADMIN'],
    department: '개발팀',
    position: 'CTO',
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2023-11-01T09:00:00Z',
        status: 'active',
        roles: ['AUTH_ADMIN'],
      },
      {
        serviceId: 'healthcare',
        serviceName: 'Healthcare Service',
        subscribedAt: '2024-01-15T09:00:00Z',
        status: 'active',
        roles: ['HEALTHCARE_ADMIN'],
      },
      {
        serviceId: 'notification',
        serviceName: 'Notification Service',
        subscribedAt: '2024-03-20T10:00:00Z',
        status: 'active',
        roles: ['NOTIFICATION_ADMIN'],
      },
      {
        serviceId: 'schedule',
        serviceName: 'Scheduling Service',
        subscribedAt: '2024-04-10T08:00:00Z',
        status: 'active',
        roles: ['SCHEDULE_ADMIN'],
      },
    ],
    createdAt: '2023-11-01T09:00:00Z',
    updatedAt: '2025-01-09T14:30:00Z',
    lastLoginAt: '2025-01-10T08:45:00Z',
  },
  {
    id: 'user-002',
    email: 'admin@dreamtech.com',
    name: '김관리',
    phoneNumber: '+82-10-2345-6789',
    status: 'active',
    userType: 'ADMIN',
    platformRoles: ['ADMIN'],
    department: '운영팀',
    position: '시스템 관리자',
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2024-01-20T10:00:00Z',
        status: 'active',
        roles: ['AUTH_USER'],
      },
      {
        serviceId: 'healthcare',
        serviceName: 'Healthcare Service',
        subscribedAt: '2024-02-01T10:00:00Z',
        status: 'active',
        roles: ['HEALTHCARE_VIEWER'],
      },
      {
        serviceId: 'notification',
        serviceName: 'Notification Service',
        subscribedAt: '2024-03-21T11:00:00Z',
        status: 'active',
        roles: ['NOTIFICATION_SENDER'],
      },
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2025-01-08T15:20:00Z',
    lastLoginAt: '2025-01-10T09:15:00Z',
  },
  {
    id: 'user-003',
    email: 'doctor@hospital.com',
    name: '김의사',
    phoneNumber: '+82-10-3456-7890',
    status: 'active',
    userType: 'DOCTOR',
    platformRoles: ['DOCTOR'],
    department: '심장내과',
    position: '전문의',
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2024-02-15T14:00:00Z',
        status: 'active',
        roles: ['AUTH_USER'],
      },
      {
        serviceId: 'healthcare',
        serviceName: 'Healthcare Service',
        subscribedAt: '2024-02-15T14:30:00Z',
        status: 'active',
        roles: ['HEALTHCARE_VIEWER', 'PRESCRIPTION_WRITER'],
      },
      {
        serviceId: 'schedule',
        serviceName: 'Scheduling Service',
        subscribedAt: '2024-04-12T09:00:00Z',
        status: 'active',
        roles: ['SCHEDULE_VIEWER'],
      },
    ],
    createdAt: '2024-02-15T14:00:00Z',
    updatedAt: '2025-01-05T11:30:00Z',
    lastLoginAt: '2025-01-09T16:20:00Z',
  },
  {
    id: 'user-004',
    email: 'patient@example.com',
    name: '박환자',
    phoneNumber: '+82-10-4567-8901',
    status: 'active',
    userType: 'PATIENT',
    platformRoles: ['PATIENT'],
    department: undefined,
    position: undefined,
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2024-03-01T09:30:00Z',
        status: 'active',
        roles: ['AUTH_USER'],
      },
      {
        serviceId: 'healthcare',
        serviceName: 'Healthcare Service',
        subscribedAt: '2024-03-01T10:00:00Z',
        status: 'active',
        roles: ['HEALTHCARE_PATIENT'],
      },
      {
        serviceId: 'notification',
        serviceName: 'Notification Service',
        subscribedAt: '2024-03-22T10:00:00Z',
        status: 'active',
        roles: ['NOTIFICATION_SUBSCRIBER'],
      },
    ],
    createdAt: '2024-03-01T09:30:00Z',
    updatedAt: '2025-01-07T14:15:00Z',
    lastLoginAt: '2025-01-10T07:50:00Z',
  },
  {
    id: 'user-005',
    email: 'doctor2@hospital.com',
    name: '이의사',
    phoneNumber: '+82-10-5678-9012',
    status: 'active',
    userType: 'DOCTOR',
    platformRoles: ['DOCTOR'],
    department: '응급의학과',
    position: '전문의',
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2024-04-01T10:00:00Z',
        status: 'active',
        roles: ['AUTH_USER'],
      },
      {
        serviceId: 'healthcare',
        serviceName: 'Healthcare Service',
        subscribedAt: '2024-04-01T10:30:00Z',
        status: 'active',
        roles: ['HEALTHCARE_VIEWER'],
      },
      {
        serviceId: 'notification',
        serviceName: 'Notification Service',
        subscribedAt: '2024-04-02T09:00:00Z',
        status: 'active',
        roles: ['NOTIFICATION_SUBSCRIBER'],
      },
    ],
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2025-01-06T13:45:00Z',
    lastLoginAt: '2025-01-10T09:30:00Z',
  },
  {
    id: 'user-006',
    email: 'suspended@example.com',
    name: '정정지',
    phoneNumber: '+82-10-6789-0123',
    status: 'suspended',
    userType: 'PATIENT',
    platformRoles: ['PATIENT'],
    department: undefined,
    position: undefined,
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2024-05-01T09:00:00Z',
        status: 'suspended',
        roles: ['AUTH_USER'],
      },
      {
        serviceId: 'healthcare',
        serviceName: 'Healthcare Service',
        subscribedAt: '2024-05-01T10:00:00Z',
        status: 'suspended',
        roles: ['HEALTHCARE_PATIENT'],
      },
    ],
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-12-15T16:00:00Z',
    lastLoginAt: '2024-12-10T11:20:00Z',
  },
  {
    id: 'user-007',
    email: 'operator@dreamtech.com',
    name: '강운영',
    phoneNumber: '+82-10-7890-1234',
    status: 'active',
    userType: 'ADMIN',
    platformRoles: ['PLATFORM_OPERATOR'],
    department: '서비스팀',
    position: '서비스 매니저',
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2024-01-25T10:00:00Z',
        status: 'active',
        roles: ['AUTH_USER'],
      },
      {
        serviceId: 'notification',
        serviceName: 'Notification Service',
        subscribedAt: '2024-03-23T10:00:00Z',
        status: 'active',
        roles: ['NOTIFICATION_SENDER'],
      },
      {
        serviceId: 'schedule',
        serviceName: 'Scheduling Service',
        subscribedAt: '2024-04-16T10:00:00Z',
        status: 'active',
        roles: ['SCHEDULE_MANAGER'],
      },
    ],
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2025-01-08T12:30:00Z',
    lastLoginAt: '2025-01-10T08:20:00Z',
  },
  {
    id: 'user-008',
    email: 'researcher@university.edu',
    name: '연구원',
    phoneNumber: '+82-10-8901-2345',
    status: 'active',
    userType: 'DOCTOR',
    platformRoles: ['DOCTOR'],
    department: '의과대학',
    position: '박사과정',
    serviceSubscriptions: [
      {
        serviceId: 'auth',
        serviceName: 'Authentication Service',
        subscribedAt: '2024-06-01T09:00:00Z',
        status: 'active',
        roles: ['AUTH_USER'],
      },
      {
        serviceId: 'healthcare',
        serviceName: 'Healthcare Service',
        subscribedAt: '2024-06-01T10:00:00Z',
        status: 'active',
        roles: ['HEALTHCARE_VIEWER'],
      },
    ],
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2025-01-04T10:15:00Z',
    lastLoginAt: '2025-01-09T14:30:00Z',
  },
];

// ==================== Mock OAuth 클라이언트 ====================

export const MOCK_OAUTH_CLIENTS: OAuthClient[] = [
  {
    id: 'client-001',
    clientId: 'platform-admin-client',
    clientSecret: '••••••••••••',
    clientName: 'Platform Admin Console',
    clientType: 'management',
    authorityTypes: [
      { userType: 'PLATFORM_ADMIN', isDefault: false },
      { userType: 'ADMIN', isDefault: true },
      { userType: 'DOCTOR', isDefault: false },
      { userType: 'PATIENT', isDefault: false },
    ],
    redirectUris: [
      'http://localhost:5173/auth/callback',
      'https://admin.cadiacinsight.com/auth/callback',
    ],
    postLogoutRedirectUris: [
      'http://localhost:5173',
      'https://admin.cadiacinsight.com',
    ],
    scopes: ['openid', 'profile', 'email', 'address', 'phone'],
    grantTypes: ['authorization_code', 'refresh_token'],
    responseTypes: ['code'],
    requirePkce: true,
    accessTokenValidity: 3600,
    refreshTokenValidity: 86400,
    idTokenValidity: 3600,
    enabled: true,
    createdAt: '2023-11-01T09:00:00Z',
    updatedAt: '2025-01-05T14:00:00Z',
  },
  {
    id: 'client-002',
    clientId: 'healthcare-client',
    clientSecret: '••••••••••••',
    clientName: 'Healthcare Web Application',
    clientType: 'web',
    authorityTypes: [
      { userType: 'DOCTOR', isDefault: false },
      { userType: 'PATIENT', isDefault: true },
    ],
    redirectUris: [
      'https://healthcare.cadiacinsight.com/callback',
      'http://localhost:3000/callback',
    ],
    postLogoutRedirectUris: [
      'https://healthcare.cadiacinsight.com',
      'http://localhost:3000',
    ],
    scopes: ['openid', 'profile', 'email', 'healthcare', 'patient:read', 'patient:write'],
    grantTypes: ['authorization_code', 'refresh_token'],
    responseTypes: ['code'],
    requirePkce: true,
    accessTokenValidity: 7200,
    refreshTokenValidity: 604800,
    idTokenValidity: 7200,
    enabled: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-20T11:30:00Z',
  },
  {
    id: 'client-003',
    clientId: 'notification-service-client',
    clientSecret: '••••••••••••',
    clientName: 'Notification Service Client',
    clientType: 'service',
    authorityTypes: [],  // Service 클라이언트는 User 생성 불가
    redirectUris: [],
    scopes: ['notification:send', 'notification:manage'],
    grantTypes: ['client_credentials'],
    requirePkce: false,
    accessTokenValidity: 3600,
    enabled: true,
    createdAt: '2024-03-20T11:00:00Z',
    updatedAt: '2024-12-15T09:20:00Z',
  },
  {
    id: 'client-004',
    clientId: 'mobile-app-client',
    clientSecret: '••••••••••••',
    clientName: 'DreamTech Mobile App',
    clientType: 'mobile',
    authorityTypes: [
      { userType: 'PATIENT', isDefault: true },
      { userType: 'DOCTOR', isDefault: false },
    ],
    redirectUris: ['dreamtech://callback', 'com.dreamtech.app://callback'],
    postLogoutRedirectUris: ['dreamtech://logout'],
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    grantTypes: ['authorization_code', 'refresh_token'],
    responseTypes: ['code'],
    requirePkce: true,
    requireAuthTime: true,
    accessTokenValidity: 1800,
    refreshTokenValidity: 2592000,
    idTokenValidity: 1800,
    enabled: true,
    createdAt: '2024-05-10T10:00:00Z',
    updatedAt: '2025-01-02T15:45:00Z',
  },
  {
    id: 'client-005',
    clientId: 'schedule-batch-client',
    clientSecret: '••••••••••••',
    clientName: 'Scheduling Batch Job',
    clientType: 'service',
    authorityTypes: [],  // Service 클라이언트는 User 생성 불가
    redirectUris: [],
    scopes: ['schedule:execute', 'schedule:manage'],
    grantTypes: ['client_credentials'],
    requirePkce: false,
    accessTokenValidity: 7200,
    enabled: true,
    createdAt: '2024-04-10T09:00:00Z',
    updatedAt: '2024-11-20T10:15:00Z',
  },
  {
    id: 'client-006',
    clientId: 'disabled-test-client',
    clientSecret: '••••••••••••',
    clientName: 'Disabled Test Client',
    clientType: 'application',
    authorityTypes: [
      { userType: 'PATIENT', isDefault: true },
    ],
    redirectUris: ['http://localhost:8080/callback'],
    scopes: ['openid'],
    grantTypes: ['authorization_code'],
    requirePkce: true,
    enabled: false,
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2024-10-01T16:00:00Z',
  },
];

// ==================== 상수 ====================

export const USER_STATUS_OPTIONS = [
  { label: '활성', value: 'active', color: 'green' },
  { label: '비활성', value: 'inactive', color: 'gray' },
  { label: '정지됨', value: 'suspended', color: 'red' },
] as const;

export const SERVICE_STATUS_OPTIONS = [
  { label: '운영중', value: 'active', color: 'green' },
  { label: '중지됨', value: 'inactive', color: 'gray' },
  { label: '점검중', value: 'maintenance', color: 'orange' },
] as const;

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { label: '활성', value: 'active', color: 'green' },
  { label: '정지됨', value: 'suspended', color: 'red' },
  { label: '만료됨', value: 'expired', color: 'gray' },
] as const;

export const CLIENT_TYPE_OPTIONS = [
  { label: '애플리케이션', value: 'application' },
  { label: '관리 콘솔', value: 'management' },
  { label: '모바일', value: 'mobile' },
  { label: '웹', value: 'web' },
  { label: '서비스', value: 'service' },
] as const;

export const GRANT_TYPE_OPTIONS = [
  { label: 'Authorization Code', value: 'authorization_code' },
  { label: 'Client Credentials', value: 'client_credentials' },
  { label: 'Refresh Token', value: 'refresh_token' },
  { label: 'Password', value: 'password' },
  { label: 'Implicit', value: 'implicit' },
] as const;

export const COMMON_SCOPES = [
  'openid',
  'profile',
  'email',
  'address',
  'phone',
  'offline_access',
] as const;

export const SERVICE_SCOPES = [
  'healthcare',
  'notification',
  'schedule',
  'auth',
] as const;

// ==================== Mock 권한 템플릿 ====================

export const MOCK_AUTHORITY_TEMPLATES: AuthorityTemplate[] = [
  {
    id: 'template-001',
    name: '의료진 기본 권한',
    description: '의사를 위한 기본 권한 템플릿 - 진단 및 처방 권한 포함',
    userType: 'DOCTOR',
    isDefault: true,
    roles: ['DOCTOR'],
    permissions: ['patient:read', 'diagnosis:write', 'prescription:create'],
    serviceScopeIds: ['auth', 'healthcare', 'schedule'],
    priority: 85,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2025-01-05T10:30:00Z',
    appliedUserCount: 45,
  },
  {
    id: 'template-002',
    name: '전문의 고급 권한',
    description: '전문의를 위한 확장 권한 - 모든 의료 서비스 접근 가능',
    userType: 'DOCTOR',
    isDefault: false,
    roles: ['DOCTOR'],
    permissions: ['patient:*', 'diagnosis:*', 'prescription:*', 'schedule:manage'],
    serviceScopeIds: ['auth', 'healthcare', 'notification', 'schedule'],
    priority: 85,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2025-01-08T14:20:00Z',
    appliedUserCount: 12,
  },
  {
    id: 'template-003',
    name: '연구원 권한',
    description: '의료 연구원을 위한 조회 전용 권한',
    userType: 'DOCTOR',
    isDefault: false,
    roles: ['DOCTOR'],
    permissions: ['patient:read', 'diagnosis:read'],
    serviceScopeIds: ['auth', 'healthcare'],
    priority: 85,
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-12-20T09:15:00Z',
    appliedUserCount: 8,
  },
  {
    id: 'template-004',
    name: '환자 기본 권한',
    description: '환자를 위한 기본 권한 - 본인 정보 조회 및 알림 수신',
    userType: 'PATIENT',
    isDefault: true,
    roles: ['PATIENT'],
    permissions: ['profile:read', 'profile:update', 'patient:read:self', 'notification:receive'],
    serviceScopeIds: ['auth', 'healthcare', 'notification'],
    priority: 85,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2025-01-06T11:00:00Z',
    appliedUserCount: 128,
  },
  {
    id: 'template-005',
    name: '시스템 관리자 표준 권한',
    description: '시스템 관리자를 위한 표준 권한 - 사용자 및 서비스 관리',
    userType: 'ADMIN',
    isDefault: true,
    roles: ['ADMIN'],
    permissions: ['user:manage', 'service:manage', 'platform:read', 'platform:monitor'],
    serviceScopeIds: ['auth', 'healthcare', 'notification', 'schedule'],
    priority: 85,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2025-01-09T15:30:00Z',
    appliedUserCount: 15,
  },
  {
    id: 'template-006',
    name: '운영자 권한',
    description: '서비스 운영을 위한 모니터링 및 알림 발송 권한',
    userType: 'ADMIN',
    isDefault: false,
    roles: ['PLATFORM_OPERATOR'],
    permissions: ['platform:read', 'platform:monitor', 'service:read', 'notification:send'],
    serviceScopeIds: ['auth', 'notification', 'schedule'],
    priority: 85,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-12-28T13:45:00Z',
    appliedUserCount: 6,
  },
  {
    id: 'template-007',
    name: '플랫폼 관리자 전체 권한',
    description: '플랫폼 관리자를 위한 전체 시스템 권한',
    userType: 'PLATFORM_ADMIN',
    isDefault: true,
    roles: ['PLATFORM_ADMIN'],
    permissions: ['*:*'],
    serviceScopeIds: ['auth', 'healthcare', 'notification', 'schedule'],
    priority: 85,
    createdAt: '2023-11-01T09:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z',
    appliedUserCount: 3,
  },
  {
    id: 'template-008',
    name: '인턴 의사 권한',
    description: '인턴 의사를 위한 제한된 권한 - 조회 전용 및 감독 필요',
    userType: 'DOCTOR',
    isDefault: false,
    roles: ['DOCTOR'],
    permissions: ['patient:read', 'diagnosis:read', 'schedule:read'],
    serviceScopeIds: ['auth', 'healthcare', 'schedule'],
    priority: 85,
    createdAt: '2024-04-01T09:00:00Z',
    updatedAt: '2024-11-15T10:20:00Z',
    appliedUserCount: 18,
  },
];