// 사용자 관리 관련 타입 정의

/**
 * 서비스 가입 정보
 */
export interface ServiceSubscription {
  serviceId: string;
  serviceName: string;
  subscribedAt: string;
  status: 'active' | 'suspended' | 'expired';
  roles: string[];  // 해당 서비스에서의 역할
  metadata?: Record<string, unknown>;  // 서비스별 추가 정보
}

/**
 * 사용자 유형 정의 (user_type_definitions 테이블)
 * API Response: GET /v1/management/user-types
 */
export interface UserTypeDefinition {
  type_id: string;                      // Primary Key (예: ADMIN, EAL_DOCTOR 등)
  display_name: string;                 // 표시명 (예: 시스템 관리자, ECG Assist Lite 서비스 소속 의사)
  description: string;                  // 설명
  is_active: boolean;                   // 활성 여부
  is_system_type: boolean;              // 시스템 기본 타입 여부
  display_order: number;                // 표시 순서
  default_template_names: string[];     // 기본 권한 템플릿 이름 목록
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  // UI에서 사용하는 camelCase 별칭 (optional)
  typeId?: string;
  displayName?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * 사용자 유형 (동적으로 관리됨)
 */
export type UserType = string;

/**
 * 플랫폼 사용자 API 응답
 * API Response: GET /v1/management/users
 */
export interface PlatformUserResponse {
  id: string;
  username: string;
  user_type: string;
  enabled: boolean;
  account_non_locked: boolean;
  account_non_expired: boolean;
  credentials_non_expired: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email_address: string;
  email_verified: boolean;
  phone_number?: string;
  birth_date?: string;
  zip_code?: string;
  address?: string;
  address_detail?: string;
  is_anonymous: boolean;
  has_profile: boolean;
}

/**
 * 플랫폼 사용자 (UI 전용)
 */
export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  status: 'active' | 'inactive' | 'suspended';
  userType: UserType;  // 사용자 유형 (User Type 기반 기본 역할 결정)
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;

  // 역할 및 권한
  platformRoles: string[];  // 플랫폼 레벨 역할 (ADMIN, USER 등)

  // 서비스 가입 정보
  serviceSubscriptions: ServiceSubscription[];

  // 추가 프로필 정보
  profileImage?: string;
  department?: string;
  position?: string;

  // API 응답 추가 필드
  username?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  birthDate?: string;
  zipCode?: string;
  address?: string;
  addressDetail?: string;
  isAnonymous?: boolean;
  hasProfile?: boolean;

  metadata?: Record<string, unknown>;
}

/**
 * 서비스 스코프 정의 (service_scopes 테이블)
 * API Response: GET /v1/management/services
 */
export interface ServiceScope {
  id: number;                           // Primary Key
  service_id: string;                   // 서비스 ID (unique)
  service_name?: string;                // 서비스 이름 (UI에서 사용)
  description: string;                  // 서비스 설명
  bit_position: number;                 // 비트 위치 (unique)
  is_active: boolean;                   // 활성 여부
  created_at: string;                   // 생성일시
  updated_at?: string;                  // 수정일시
  deleted_at?: string;                  // 삭제일시 (소프트 삭제)
}

/**
 * 플랫폼 서비스 정의 (레거시 - 향후 ServiceScope로 대체 예정)
 */
export interface PlatformService {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;

  // 서비스 메타데이터
  version?: string;
  endpoint?: string;
  icon?: string;

  // 가입자 통계
  subscriberCount: number;
  activeSubscriberCount: number;

  // 역할 정의
  availableRoles: ServiceRole[];
  defaultRole: string;  // 가입 시 기본 할당 역할

  // 설정
  requiresApproval: boolean;  // 가입 승인 필요 여부
  maxSubscribers?: number;  // 최대 가입자 수
  metadata?: Record<string, unknown>;
}

/**
 * 서비스별 역할 정의 (레거시)
 */
export interface ServiceRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

/**
 * 부모 역할 정보 (GlobalRole의 중첩 객체)
 */
export interface ParentRoleInfo {
  role_id: string;
  display_name: string;
  authority_level: number;
}

/**
 * 글로벌 역할 정의 (global_roles 테이블)
 * API Response: GET /v1/management/roles/global
 */
export interface GlobalRole {
  role_id: string;                      // Primary Key (예: PLATFORM_ADMIN, SERVICE_ADMIN)
  display_name: string;                 // 표시명
  description: string | null;           // 설명
  authority_level: number;              // 권한 레벨 (1-100, 낮을수록 높은 권한)
  parent_role?: ParentRoleInfo | null;  // 부모 역할 정보 (객체 형태)
  parent_role_id?: string;              // 부모 역할 ID (폼 제출용, 선택적)
  is_system_role: boolean;              // 시스템 기본 역할 여부 (삭제 불가)
  is_active: boolean;                   // 활성 여부
  permissions: string[];                // 권한 목록 (예: ['user:manage', 'hospital:admin'])
  created_at: string;                   // 생성일시
  created_by: string | null;            // 생성자
  updated_at?: string | null;           // 수정일시
  updated_by?: string | null;           // 수정자
}

/**
 * 서비스 역할 정의 (service_roles 테이블)
 * API Response: GET /v1/management/roles/services
 * Composite PK: (role_name, service_id)
 */
export interface ServiceRoleDefinition {
  role_name: string;                    // 역할명 (예: DOCTOR, ADMIN)
  service_id: string;                   // 서비스 ID (예: ecg-analysis, auth)
  display_name: string;                 // 표시명
  description: string;                  // 설명
  is_system_role: boolean;              // 시스템 기본 역할 여부 (삭제 불가)
  is_active: boolean;                   // 활성 여부
  permissions: string[];                // 권한 목록
  created_at: string;                   // 생성일시
  created_by: string;                   // 생성자
  updated_at?: string;                  // 수정일시
  updated_by?: string;                  // 수정자
}

/**
 * OAuth2/OIDC 클라이언트 타입 (UI 분류용, 백엔드에는 없음)
 */
export type ClientType = 'application' | 'management' | 'mobile' | 'web' | 'service';

/**
 * 클라이언트 권한 유형 (클라이언트가 생성 가능한 User Type)
 * API: GET /v1/management/clients/{clientId}/allowed-user-types
 */
export interface ClientAuthorityType {
  user_type: string;          // User Type ID (예: DOCTOR, PATIENT)
  is_default: boolean;        // 회원가입 시 기본 User Type 여부
  // UI에서 사용하는 camelCase 별칭 (optional)
  userType?: string;
  isDefault?: boolean;
}

/**
 * OAuth2/OIDC 클라이언트
 * API Response: GET /v1/management/clients
 */
export interface OAuthClient {
  id: string;                                      // Primary Key
  client_id: string;                               // OAuth Client ID (unique)
  client_name: string;                             // 클라이언트 이름
  client_secret?: string;                          // 보안상 조회 시 마스킹 (********)

  // OAuth2 Redirect URIs
  redirect_uris: string[];                         // 리다이렉트 URI 목록
  post_logout_redirect_uris?: string[];            // 로그아웃 후 리다이렉트 URI

  // Scopes & Grant Types
  scopes: string[];                                // 스코프 목록 (예: openid, profile, email)
  authorization_grant_types: string[];             // Grant Type (예: AUTHORIZATION_CODE, REFRESH_TOKEN)
  client_authentication_methods: string[];         // 인증 방식 (예: CLIENT_SECRET_BASIC, CLIENT_SECRET_POST)

  // 토큰 유효기간 (문자열 형식: "1H", "24H", "5M")
  access_token_time_to_live?: string;              // Access Token 유효기간
  refresh_token_time_to_live?: string;             // Refresh Token 유효기간
  authorize_code_time_to_live?: string;            // Authorization Code 유효기간
  device_code_time_to_live?: string;               // Device Code 유효기간

  // 클라이언트 설정
  reuse_refresh_tokens: boolean;                   // Refresh Token 재사용 여부
  use_public_client: boolean;                      // PKCE를 사용하는 Public Client 여부
  use_authorization_consent?: boolean;             // 사용자 동의 화면 사용 여부
  use_external_login?: boolean;                    // 외부 로그인 페이지 사용 여부
  external_login_page_url?: string;                // 외부 로그인 페이지 URL

  // 시스템 정보
  client_id_issued_at: string;                     // 클라이언트 생성일시
  client_secret_expires_at?: string | null;        // 클라이언트 비밀키 만료일시
  updated_at?: string | null;                      // 수정일시
  deleted_at?: string | null;                      // 삭제일시 (소프트 삭제, null이면 활성)

  // UI 전용 필드 (백엔드에 없음, 선택적)
  client_type?: ClientType;                        // 클라이언트 타입 (UI 분류용)
  authority_types?: ClientAuthorityType[];         // 허용된 User Type (별도 API로 조회)

  // UI에서 사용하는 camelCase 별칭 (optional)
  clientId?: string;
  clientName?: string;
}

/**
 * 플랫폼 역할 정의
 */
export interface PlatformRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;  // 시스템 기본 역할 여부 (삭제 불가)
}

/**
 * 사용자 추가/수정 폼 데이터
 */
export interface UserFormData {
  email: string;
  password?: string;
  name: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  platformRoles: string[];
  serviceSubscriptions: Array<{
    serviceId: string;
    roles: string[];
  }>;
  status: 'active' | 'inactive' | 'suspended';
  userType?: string;
}

/**
 * 클라이언트 생성 요청
 * API Request: POST /v1/management/clients
 */
export interface ClientCreateRequest {
  client_id: string;                               // Client ID (unique)
  client_name: string;                             // 클라이언트 이름
  client_secret?: string;                          // 클라이언트 비밀키 (선택적)
  redirect_uris: string[];                         // 리다이렉트 URI
  post_logout_redirect_uris?: string[];            // 로그아웃 후 리다이렉트 URI
  scopes: string[];                                // 스코프 목록
  authorization_grant_types: string[];             // Grant Type 목록
  client_authentication_methods: string[];         // 인증 방식
  access_token_time_to_live?: string;              // Access Token 유효기간 (예: "1H")
  refresh_token_time_to_live?: string;             // Refresh Token 유효기간
  authorize_code_time_to_live?: string;            // Authorization Code 유효기간
  device_code_time_to_live?: string;               // Device Code 유효기간
  reuse_refresh_tokens?: boolean;                  // Refresh Token 재사용 여부
  use_public_client?: boolean;                     // Public Client 여부 (PKCE)
  use_authorization_consent?: boolean;             // 사용자 동의 화면 사용 여부
  use_external_login?: boolean;                    // 외부 로그인 사용 여부
  external_login_page_url?: string;                // 외부 로그인 페이지 URL
}

/**
 * 클라이언트 수정 요청
 * API Request: PUT /v1/management/clients/{clientId}
 */
export interface ClientUpdateRequest {
  client_name?: string;
  redirect_uris?: string[];
  post_logout_redirect_uris?: string[];
  scopes?: string[];
  authorization_grant_types?: string[];
  client_authentication_methods?: string[];
  access_token_time_to_live?: string;
  refresh_token_time_to_live?: string;
  authorize_code_time_to_live?: string;
  device_code_time_to_live?: string;
  reuse_refresh_tokens?: boolean;
  use_public_client?: boolean;
  use_authorization_consent?: boolean;
  use_external_login?: boolean;
  external_login_page_url?: string;
}

/**
 * 허용된 User Type 추가 요청
 * API Request: POST /v1/management/clients/{clientId}/allowed-user-types
 */
export interface AllowedUserTypeRequest {
  user_type: string;        // User Type ID
  is_default: boolean;      // 기본 User Type 여부
}

/**
 * 클라이언트 폼 데이터 (UI 전용, 레거시)
 * @deprecated ClientCreateRequest 사용 권장
 */
export interface ClientFormData {
  clientName: string;
  clientType?: ClientType;                         // UI 분류용 (백엔드에 없음)
  authorityTypes?: ClientAuthorityType[];          // 생성 가능한 User Type 목록
  redirectUris: string[];
  postLogoutRedirectUris?: string[];
  scopes: string[];
  grantTypes: string[];
  requirePkce?: boolean;
  enabled?: boolean;                               // deleted_at으로 판단
}

/**
 * 서비스 가입 변경 요청
 */
export interface ServiceSubscriptionChange {
  userId: string;
  serviceId: string;
  action: 'subscribe' | 'unsubscribe' | 'update';
  roles?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * 사용자 검색 필터
 */
export interface UserSearchFilter {
  keyword?: string;  // 이름, 이메일 검색
  platformRoles?: string[];
  serviceIds?: string[];
  status?: Array<'active' | 'inactive' | 'suspended'>;
}

/**
 * 클라이언트 검색 필터
 */
export interface ClientSearchFilter {
  keyword?: string;  // 클라이언트명, 클라이언트ID 검색
  clientType?: ClientType;
  serviceId?: string;
  enabled?: boolean;
}

/**
 * 서비스 검색 필터
 */
export interface ServiceSearchFilter {
  keyword?: string;  // 서비스명, 설명 검색
  status?: Array<'active' | 'inactive' | 'maintenance'>;
}

/**
 * 글로벌 역할 정보 (Permission Template에서 사용)
 */
export interface GlobalRoleInfo {
  role_id: string;
  display_name: string;
  description?: string;
}

/**
 * 서비스 역할 정보 (Permission Template에서 사용)
 */
export interface ServiceRoleInfo {
  service_id: string;
  role_name: string;
  description?: string;
}

/**
 * 권한 템플릿 (API Response)
 * API Response: GET /v1/management/permission-templates
 */
export interface PermissionTemplate {
  id: number;  // integer
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  global_roles: GlobalRoleInfo[];
  service_roles: ServiceRoleInfo[];
  created_at: string;
  updated_at?: string;
  created_by: string;
  updated_by?: string;
  // AuthorityTemplates에서 사용하는 필드 (optional)
  user_type?: string;
  is_default?: boolean;
  statistics?: {
    applied_user_count?: number;
  };
  // UI에서 사용하는 추가 필드
  roles?: string[];
  permissions?: string[];
  serviceScopeIds?: string[];
}

/**
 * 권한 템플릿 생성 요청
 * API Request: POST /v1/management/permission-templates
 */
export interface TemplateCreateRequest {
  name: string;
  description?: string;
  category?: string;
  global_role_ids?: string[];
  service_role_ids?: string[];  // "serviceId:roleName" 형식
}

/**
 * 권한 템플릿 수정 요청
 * API Request: PUT /v1/management/permission-templates/{templateId}
 */
export interface TemplateUpdateRequest {
  name?: string;
  description?: string;
  category?: string;
  global_role_ids?: string[];
  service_role_ids?: string[];  // "serviceId:roleName" 형식
}

/**
 * 페이지 응답 (Spring Page)
 */
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ===== DEPRECATED: 기존 Authority Template 타입 (하위 호환성) =====
/** @deprecated Use PermissionTemplate instead */
export type AuthorityTemplate = PermissionTemplate;
/** @deprecated Use TemplateStatistics instead */
export interface TemplateStatistics {
  applied_user_count?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * 권한 정의 (permission_definitions 테이블)
 * API Response: GET /v1/management/permissions
 */
export interface PermissionDefinition {
  id: number;                           // Primary Key
  service_id: string;                   // 서비스 ID
  resource: string;                     // 리소스 (예: user, hospital)
  action: string;                       // 액션 (예: read, write, manage)
  permission_string: string;            // 권한 문자열 (예: user:manage)
  display_name: string;                 // 표시명
  description: string;                  // 설명
  category: string;                     // 카테고리 (예: 사용자 관리, 병원 관리)
  is_active: boolean;                   // 활성 여부
  is_system_permission: boolean;        // 시스템 기본 권한 여부
  created_at: string;                   // 생성일시
  created_by: string | null;            // 생성자
  updated_at?: string | null;           // 수정일시
  updated_by?: string | null;           // 수정자
}

/**
 * 서비스별 그룹화된 권한 응답
 * API Response: GET /v1/management/permissions/grouped-by-service
 */
export interface GroupedPermissions {
  service_id: string;
  service_name: string;
  permission_count: number;
  categories: {
    [category: string]: PermissionDefinition[];
  };
}

/**
 * 권한 정의 검색 필터
 */
export interface PermissionSearchFilter {
  keyword?: string;                     // 권한명, 설명 검색
  service_id?: string;                  // 서비스 ID 필터
  category?: string;                    // 카테고리 필터
  resource?: string;                    // 리소스 필터
  is_active?: boolean;                  // 활성 상태 필터
}

/**
 * 권한 정의 생성 요청
 */
export interface PermissionCreateRequest {
  service_id: string;
  resource: string;
  action: string;
  display_name: string;
  description: string;
  category: string;
}

/**
 * 권한 정의 수정 요청
 */
export interface PermissionUpdateRequest {
  display_name?: string;
  description?: string;
  category?: string;
}