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
    type_id: 'USER',
    display_name: '일반 사용자',
    description: '기본 플랫폼 사용자',
    is_active: true,
    is_system_type: true,
    display_order: 90,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'PLATFORM_ADMIN',
    display_name: '플랫폼 관리자',
    description: '플랫폼 전체를 관리하는 최고 관리자',
    is_active: true,
    is_system_type: true,
    display_order: 80,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'ADMIN',
    display_name: '시스템 관리자',
    description: '시스템 전반을 관리하는 관리자',
    is_active: true,
    is_system_type: true,
    display_order: 70,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'SERVICE_MANAGER',
    display_name: '서비스 관리자',
    description: '시스템 서비스를 관리하는 관리자',
    is_active: true,
    is_system_type: true,
    display_order: 60,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'EAL_TECHNICIAN',
    display_name: 'ECG Assist Lite 서비스 소속 분석 전문가',
    description: 'ECG Assist Lite 서비스의 ECG 분석 전문가',
    is_active: true,
    is_system_type: true,
    display_order: 40,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'EAL_DOCTOR',
    display_name: 'ECG Assist Lite 서비스 소속 의사',
    description: 'ECG Assist Lite 서비스의 의사',
    is_active: true,
    is_system_type: true,
    display_order: 30,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'EAL_MANAGER',
    display_name: 'ECG Assist Lite 서비스 책임자',
    description: 'ECG Assist Lite 서비스의 중간 관리자',
    is_active: true,
    is_system_type: true,
    display_order: 20,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'EAL_ADMIN',
    display_name: 'ECG Assist Lite 서비스 관리자',
    description: 'ECG Assist Lite 서비스의 관리자.',
    is_active: true,
    is_system_type: true,
    display_order: 10,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
  {
    type_id: 'EAL_CLINICIAN',
    display_name: 'ECG Assist Lite 서비스 소속 분석 담당자',
    description: 'ECG Assist Lite 서비스의 ECG 분석 담당자',
    is_active: true,
    is_system_type: true,
    display_order: 50,
    created_by: 'SYSTEM_MIGRATION',
    created_at: "2025-08-05T07:28:01Z",
    default_template_names: [],
  },
];

/**
 * 활성화된 User Type만 필터링 (display_order 순으로 정렬)
 */
export const ACTIVE_USER_TYPES = MOCK_USER_TYPE_DEFINITIONS
  .filter(type => type.is_active)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

/**
 * User Type 선택 옵션 (Ant Design Select용)
 */
export const USER_TYPE_OPTIONS = ACTIVE_USER_TYPES.map(type => ({
  label: type.display_name,
  value: type.type_id,
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
    client_id: 'platform-admin-client',
    client_secret: '••••••••••••',
    client_name: 'Platform Admin Console',
    client_type: 'management',
    authority_types: [
      { user_type: 'PLATFORM_ADMIN', is_default: false },
      { user_type: 'ADMIN', is_default: true },
      { user_type: 'DOCTOR', is_default: false },
      { user_type: 'PATIENT', is_default: false },
    ],
    redirect_uris: [
      'http://localhost:5173/auth/callback',
      'https://admin.cadiacinsight.com/auth/callback',
    ],
    post_logout_redirect_uris: [
      'http://localhost:5173',
      'https://admin.cadiacinsight.com',
    ],
    scopes: ['openid', 'profile', 'email', 'address', 'phone'],
    authorization_grant_types: ['authorization_code', 'refresh_token'],
    client_authentication_methods: ['CLIENT_SECRET_BASIC'],
    reuse_refresh_tokens: true,
    use_public_client: false,
    client_id_issued_at: '2024-01-05T09:00:00Z',
    updated_at: '2025-01-05T14:00:00Z',
  },
  {
    id: 'client-002',
    client_id: 'healthcare-client',
    client_secret: '••••••••••••',
    client_name: 'Healthcare Web Application',
    client_type: 'web',
    authority_types: [
      { user_type: 'DOCTOR', is_default: false },
      { user_type: 'PATIENT', is_default: true },
    ],
    redirect_uris: [
      'https://healthcare.cadiacinsight.com/callback',
      'http://localhost:3000/callback',
    ],
    post_logout_redirect_uris: [
      'https://healthcare.cadiacinsight.com',
      'http://localhost:3000',
    ],
    scopes: ['openid', 'profile', 'email', 'healthcare', 'patient:read', 'patient:write'],
    authorization_grant_types: ['authorization_code', 'refresh_token'],
    client_authentication_methods: ['CLIENT_SECRET_BASIC'],
    reuse_refresh_tokens: true,
    use_public_client: false,
    client_id_issued_at: '2024-08-10T10:00:00Z',
    updated_at: '2024-12-20T11:30:00Z',
  },
  {
    id: 'client-003',
    client_id: 'notification-service-client',
    client_secret: '••••••••••••',
    client_name: 'Notification Service Client',
    client_type: 'service',
    authority_types: [],  // Service 클라이언트는 User 생성 불가
    redirect_uris: [],
    scopes: ['notification:send', 'notification:manage'],
    authorization_grant_types: ['client_credentials'],
    client_authentication_methods: ['CLIENT_SECRET_BASIC'],
    reuse_refresh_tokens: false,
    use_public_client: false,
    client_id_issued_at: '2024-06-15T08:00:00Z',
    updated_at: '2024-12-15T09:20:00Z',
  },
  {
    id: 'client-004',
    client_id: 'mobile-app-client',
    client_secret: '••••••••••••',
    client_name: 'DreamTech Mobile App',
    client_type: 'mobile',
    authority_types: [
      { user_type: 'PATIENT', is_default: true },
      { user_type: 'DOCTOR', is_default: false },
    ],
    redirect_uris: ['dreamtech://callback', 'com.dreamtech.app://callback'],
    post_logout_redirect_uris: ['dreamtech://logout'],
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    authorization_grant_types: ['authorization_code', 'refresh_token'],
    client_authentication_methods: ['CLIENT_SECRET_POST'],
    reuse_refresh_tokens: true,
    use_public_client: true,
    client_id_issued_at: '2024-09-01T11:00:00Z',
    updated_at: '2025-01-02T15:45:00Z',
  },
  {
    id: 'client-005',
    client_id: 'schedule-batch-client',
    client_secret: '••••••••••••',
    client_name: 'Scheduling Batch Job',
    client_type: 'service',
    authority_types: [],  // Service 클라이언트는 User 생성 불가
    redirect_uris: [],
    scopes: ['schedule:execute', 'schedule:manage'],
    authorization_grant_types: ['client_credentials'],
    client_authentication_methods: ['CLIENT_SECRET_BASIC'],
    reuse_refresh_tokens: false,
    use_public_client: false,
    client_id_issued_at: '2024-05-20T09:00:00Z',
    updated_at: '2024-11-20T10:15:00Z',
  },
  {
    id: 'client-006',
    client_id: 'disabled-test-client',
    client_secret: '••••••••••••',
    client_name: 'Disabled Test Client',
    client_type: 'application',
    authority_types: [
      { user_type: 'PATIENT', is_default: true },
    ],
    redirect_uris: ['http://localhost:8080/callback'],
    scopes: ['openid'],
    authorization_grant_types: ['authorization_code'],
    client_authentication_methods: ['CLIENT_SECRET_BASIC'],
    reuse_refresh_tokens: true,
    use_public_client: false,
    client_id_issued_at: '2024-03-01T14:00:00Z',
    updated_at: '2024-10-01T16:00:00Z',
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
    id: 1,
    name: '의료진 기본 권한',
    description: '의사를 위한 기본 권한 템플릿 - 진단 및 처방 권한 포함',
    user_type: 'DOCTOR',
    is_default: true,
    roles: ['DOCTOR'],
    permissions: ['patient:read', 'diagnosis:write', 'prescription:create'],
    serviceScopeIds: ['auth', 'healthcare', 'schedule'],
    // priority 제거됨
    updated_at: '2025-01-05T10:30:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
  {
    id: 2,
    name: '전문의 고급 권한',
    description: '전문의를 위한 확장 권한 - 모든 의료 서비스 접근 가능',
    user_type: 'DOCTOR',
    is_default: false,
    roles: ['DOCTOR'],
    permissions: ['patient:*', 'diagnosis:*', 'prescription:*', 'schedule:manage'],
    serviceScopeIds: ['auth', 'healthcare', 'notification', 'schedule'],
    // priority 제거됨
    updated_at: '2025-01-08T14:20:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
  {
    id: 3,
    name: '연구원 권한',
    description: '의료 연구원을 위한 조회 전용 권한',
    user_type: 'DOCTOR',
    is_default: false,
    roles: ['DOCTOR'],
    permissions: ['patient:read', 'diagnosis:read'],
    serviceScopeIds: ['auth', 'healthcare'],
    // priority 제거됨
    updated_at: '2024-12-20T09:15:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
  {
    id: 4,
    name: '환자 기본 권한',
    description: '환자를 위한 기본 권한 - 본인 정보 조회 및 알림 수신',
    user_type: 'PATIENT',
    is_default: true,
    roles: ['PATIENT'],
    permissions: ['profile:read', 'profile:update', 'patient:read:self', 'notification:receive'],
    serviceScopeIds: ['auth', 'healthcare', 'notification'],
    // priority 제거됨
    updated_at: '2025-01-06T11:00:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
  {
    id: 5,
    name: '시스템 관리자 표준 권한',
    description: '시스템 관리자를 위한 표준 권한 - 사용자 및 서비스 관리',
    user_type: 'ADMIN',
    is_default: true,
    roles: ['ADMIN'],
    permissions: ['user:manage', 'service:manage', 'platform:read', 'platform:monitor'],
    serviceScopeIds: ['auth', 'healthcare', 'notification', 'schedule'],
    // priority 제거됨
    updated_at: '2025-01-09T15:30:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
  {
    id: 6,
    name: '운영자 권한',
    description: '서비스 운영을 위한 모니터링 및 알림 발송 권한',
    user_type: 'ADMIN',
    is_default: false,
    roles: ['PLATFORM_OPERATOR'],
    permissions: ['platform:read', 'platform:monitor', 'service:read', 'notification:send'],
    serviceScopeIds: ['auth', 'notification', 'schedule'],
    // priority 제거됨
    updated_at: '2024-12-28T13:45:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
  {
    id: 7,
    name: '플랫폼 관리자 전체 권한',
    description: '플랫폼 관리자를 위한 전체 시스템 권한',
    user_type: 'PLATFORM_ADMIN',
    is_default: true,
    roles: ['PLATFORM_ADMIN'],
    permissions: ['*:*'],
    serviceScopeIds: ['auth', 'healthcare', 'notification', 'schedule'],
    // priority 제거됨
    updated_at: '2025-01-10T08:00:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
  {
    id: 8,
    name: '인턴 의사 권한',
    description: '인턴 의사를 위한 제한된 권한 - 조회 전용 및 감독 필요',
    user_type: 'DOCTOR',
    is_default: false,
    roles: ['DOCTOR'],
    permissions: ['patient:read', 'diagnosis:read', 'schedule:read'],
    serviceScopeIds: ['auth', 'healthcare', 'schedule'],
    // priority 제거됨
    updated_at: '2024-11-15T10:20:00Z',
    is_active: true,
    global_roles: [],
    service_roles: [],
    created_by: "SYSTEM",
    created_at: "2024-01-15T09:00:00Z",
    // appliedUserCount 제거됨
  },
];