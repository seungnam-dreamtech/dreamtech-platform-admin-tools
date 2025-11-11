// 사용자 관리 서비스 (AuthX API 연동)
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  PlatformUser,
  PlatformService,
  OAuthClient,
  UserFormData,
  ServiceSubscriptionChange,
  UserSearchFilter,
  ServiceSearchFilter,
} from '../types/user-management';

import {
  MOCK_USERS,
  MOCK_SERVICES,
  calculateServiceBitmask,
} from '../constants/user-management';

import { getAuthHeaders } from '../utils/authUtils';

// API 기본 설정
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_AUTHORITY || 'https://api.cadiacinsight.com';

class UserManagementService {
  private getAuthHeaders() {
    return getAuthHeaders();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${AUTH_BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers);
    const authHeaders = this.getAuthHeaders();

    console.log('📤 API Request:', {
      url,
      method: options.method || 'GET',
      hasAuthHeader: !!authHeaders['Authorization'],
      authHeaderPreview: authHeaders['Authorization'] ? `${authHeaders['Authorization'].substring(0, 30)}...` : 'none',
    });

    for (const [key, value] of Object.entries(authHeaders)) {
      headers.set(key, value);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📥 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const text = await response.text();
      if (!text) {
        // 빈 응답 처리: endpoint에 따라 적절한 기본값 반환
        if (endpoint.includes('/roles/') || endpoint.includes('/services') || endpoint.includes('/user-types')) {
          return [] as T; // 목록 조회 API는 빈 배열 반환
        }
        return {} as T;
      }

      const parsed = JSON.parse(text);

      // API 응답이 { data: [...], success: true } 형태의 래퍼인 경우 data 추출
      if (parsed && typeof parsed === 'object' && 'data' in parsed) {
        console.log('📦 Unwrapping API response wrapper, returning data field');
        return parsed.data as T;
      }

      return parsed;

    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ==================== 플랫폼 사용자 관리 ====================

  /**
   * 전체 사용자 목록 조회
   * 실제 API: GET /v1/management/users
   */
  async getUsers(filter?: UserSearchFilter): Promise<PlatformUser[]> {
    console.log('🔍 Mock: Getting users with filter:', filter);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformUser[]>('/v1/management/users', {
    //   method: 'GET',
    //   body: JSON.stringify(filter),
    // });

    // Mock 데이터 필터링
    let filtered = [...MOCK_USERS];

    if (filter?.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      );
    }

    if (filter?.platformRoles && filter.platformRoles.length > 0) {
      filtered = filtered.filter(user =>
        user.platformRoles.some(role => filter.platformRoles?.includes(role))
      );
    }

    if (filter?.serviceIds && filter.serviceIds.length > 0) {
      filtered = filtered.filter(user =>
        user.serviceSubscriptions.some(sub => filter.serviceIds?.includes(sub.serviceId))
      );
    }

    if (filter?.status && filter.status.length > 0) {
      filtered = filtered.filter(user => filter.status?.includes(user.status));
    }

    return filtered;
  }

  /**
   * 특정 사용자 조회
   * 실제 API: GET /v1/management/users/{userId}
   */
  async getUser(userId: string): Promise<PlatformUser> {
    console.log('🔍 Mock: Getting user:', userId);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformUser>(`/v1/management/users/${userId}`);

    const user = MOCK_USERS.find(u => u.id === userId || u.email === userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  }

  /**
   * 사용자 생성
   * 실제 API: POST /v1/users
   */
  async createUser(userData: UserFormData): Promise<PlatformUser> {
    console.log('➕ Mock: Creating user:', userData);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformUser>('/v1/users', {
    //   method: 'POST',
    //   body: JSON.stringify(userData),
    // });

    // Mock 사용자 생성
    const newUser: PlatformUser = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      status: userData.status,
      userType: 'PATIENT', // UserType은 회원가입 시 결정됨
      platformRoles: userData.platformRoles,
      department: userData.department,
      position: userData.position,
      serviceSubscriptions: userData.serviceSubscriptions.map(sub => ({
        serviceId: sub.serviceId,
        serviceName: MOCK_SERVICES.find(s => s.id === sub.serviceId)?.displayName || sub.serviceId,
        subscribedAt: new Date().toISOString(),
        status: 'active',
        roles: sub.roles,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);
    return newUser;
  }

  /**
   * 사용자 정보 수정
   * 실제 API: PUT /v1/management/users/{userId}
   */
  async updateUser(userId: string, userData: Partial<UserFormData>): Promise<PlatformUser> {
    console.log('✏️ Mock: Updating user:', userId, userData);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformUser>(`/v1/management/users/${userId}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(userData),
    // });

    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedUser: PlatformUser = {
      ...MOCK_USERS[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    } as PlatformUser;

    MOCK_USERS[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * 사용자 삭제
   * 실제 API: DELETE /v1/management/users/{userId}
   */
  async deleteUser(userId: string): Promise<void> {
    console.log('🗑️ Mock: Deleting user:', userId);

    // TODO: 실제 API 연동 시
    // return this.request<void>(`/v1/management/users/${userId}`, {
    //   method: 'DELETE',
    // });

    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      MOCK_USERS.splice(userIndex, 1);
    }
  }

  // ==================== 서비스 가입 관리 ====================

  /**
   * 사용자 서비스 가입/해지/수정
   * 실제 API: POST /v1/management/users/{userId}/services
   */
  async updateUserServices(change: ServiceSubscriptionChange): Promise<PlatformUser> {
    console.log('🔄 Mock: Updating user services:', change);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformUser>(`/v1/management/users/${change.userId}/services`, {
    //   method: 'POST',
    //   body: JSON.stringify(change),
    // });

    const user = await this.getUser(change.userId);
    const service = MOCK_SERVICES.find(s => s.id === change.serviceId);

    if (!service) {
      throw new Error(`Service not found: ${change.serviceId}`);
    }

    if (change.action === 'subscribe') {
      // 서비스 가입
      const existing = user.serviceSubscriptions.find(s => s.serviceId === change.serviceId);
      if (!existing) {
        user.serviceSubscriptions.push({
          serviceId: change.serviceId,
          serviceName: service.displayName,
          subscribedAt: new Date().toISOString(),
          status: 'active',
          roles: change.roles || [service.defaultRole],
          metadata: change.metadata,
        });
      }
    } else if (change.action === 'unsubscribe') {
      // 서비스 해지
      user.serviceSubscriptions = user.serviceSubscriptions.filter(
        s => s.serviceId !== change.serviceId
      );
    } else if (change.action === 'update') {
      // 서비스 역할 업데이트
      const subscription = user.serviceSubscriptions.find(s => s.serviceId === change.serviceId);
      if (subscription && change.roles) {
        subscription.roles = change.roles;
      }
    }

    user.updatedAt = new Date().toISOString();
    return this.updateUser(user.id, user);
  }

  /**
   * 특정 서비스의 가입자 목록 조회
   * 실제 API: GET /v1/management/services/{serviceId}/subscribers
   */
  async getServiceSubscribers(serviceId: string): Promise<PlatformUser[]> {
    console.log('🔍 Mock: Getting service subscribers:', serviceId);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformUser[]>(`/v1/management/services/${serviceId}/subscribers`);

    return MOCK_USERS.filter(user =>
      user.serviceSubscriptions.some(sub => sub.serviceId === serviceId)
    );
  }

  // ==================== 플랫폼 서비스 관리 ====================

  /**
   * 전체 서비스 목록 조회
   * 실제 API: GET /v1/management/services
   */
  async getServices(filter?: ServiceSearchFilter): Promise<PlatformService[]> {
    console.log('🔍 Mock: Getting services with filter:', filter);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformService[]>('/v1/management/services', {
    //   method: 'GET',
    //   body: JSON.stringify(filter),
    // });

    let filtered = [...MOCK_SERVICES];

    if (filter?.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filtered = filtered.filter(service =>
        service.displayName.toLowerCase().includes(keyword) ||
        service.description.toLowerCase().includes(keyword)
      );
    }

    if (filter?.status && filter.status.length > 0) {
      filtered = filtered.filter(service => filter.status?.includes(service.status));
    }

    return filtered;
  }

  /**
   * 특정 서비스 조회
   * 실제 API: GET /v1/management/services/{serviceId}
   */
  async getService(serviceId: string): Promise<PlatformService> {
    console.log('🔍 Mock: Getting service:', serviceId);

    // TODO: 실제 API 연동 시
    // return this.request<PlatformService>(`/v1/management/services/${serviceId}`);

    const service = MOCK_SERVICES.find(s => s.id === serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    return service;
  }

  // ==================== OAuth2/OIDC 클라이언트 관리 ====================

  /**
   * 전체 클라이언트 목록 조회
   * 실제 API: GET /v1/management/clients
   * Query Parameters: includeDeleted (optional)
   */
  async getClients(params?: { includeDeleted?: boolean }): Promise<OAuthClient[]> {
    console.log('🔍 Getting OAuth clients', params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.includeDeleted) {
        queryParams.append('includeDeleted', 'true');
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return this.request<OAuthClient[]>(`/v1/management/clients${queryString}`);
    } catch (error) {
      console.error('Failed to fetch OAuth clients:', error);
      throw error;
    }
  }

  /**
   * 특정 클라이언트 조회
   * 실제 API: GET /v1/management/clients/{clientId}
   */
  async getClient(clientId: string): Promise<OAuthClient> {
    console.log('🔍 Getting OAuth client:', clientId);

    try {
      return this.request<OAuthClient>(`/v1/management/clients/${clientId}`);
    } catch (error) {
      console.error('Failed to fetch OAuth client:', error);
      throw error;
    }
  }

  /**
   * 클라이언트 생성
   * 실제 API: POST /v1/management/clients
   */
  async createClient(
    data: import('../types/user-management').ClientCreateRequest
  ): Promise<OAuthClient> {
    console.log('➕ Creating OAuth client:', data);

    try {
      return this.request<OAuthClient>('/v1/management/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to create OAuth client:', error);
      throw error;
    }
  }

  /**
   * 클라이언트 정보 수정
   * 실제 API: PUT /v1/management/clients/{clientId}
   */
  async updateClient(
    clientId: string,
    data: import('../types/user-management').ClientUpdateRequest
  ): Promise<OAuthClient> {
    console.log('✏️ Updating OAuth client:', clientId, data);

    try {
      return this.request<OAuthClient>(`/v1/management/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to update OAuth client:', error);
      throw error;
    }
  }

  /**
   * 클라이언트 삭제 (소프트 삭제)
   * 실제 API: DELETE /v1/management/clients/{clientId}
   * deleted_at 필드가 설정됨
   */
  async deleteClient(clientId: string): Promise<void> {
    console.log('🗑️ Deleting OAuth client (soft delete):', clientId);

    try {
      return this.request<void>(`/v1/management/clients/${clientId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete OAuth client:', error);
      throw error;
    }
  }

  /**
   * 클라이언트 비밀키 재생성
   * 실제 API: POST /v1/management/clients/{clientId}/regenerate-secret
   */
  async regenerateClientSecret(clientId: string): Promise<{ client_secret: string }> {
    console.log('🔑 Regenerating client secret:', clientId);

    try {
      return this.request<{ client_secret: string }>(
        `/v1/management/clients/${clientId}/regenerate-secret`,
        { method: 'POST' }
      );
    } catch (error) {
      console.error('Failed to regenerate client secret:', error);
      throw error;
    }
  }

  /**
   * 클라이언트의 허용된 User Type 목록 조회
   * 실제 API: GET /v1/management/clients/{clientId}/allowed-user-types
   */
  async getAllowedUserTypes(clientId: string): Promise<import('../types/user-management').ClientAuthorityType[]> {
    console.log('🔍 Getting allowed user types for client:', clientId);

    try {
      return this.request<import('../types/user-management').ClientAuthorityType[]>(
        `/v1/management/clients/${clientId}/allowed-user-types`
      );
    } catch (error) {
      console.error('Failed to fetch allowed user types:', error);
      throw error;
    }
  }

  /**
   * 클라이언트에 허용된 User Type 추가
   * 실제 API: POST /v1/management/clients/{clientId}/allowed-user-types
   */
  async addAllowedUserType(
    clientId: string,
    data: import('../types/user-management').AllowedUserTypeRequest
  ): Promise<import('../types/user-management').ClientAuthorityType> {
    console.log('➕ Adding allowed user type:', clientId, data);

    try {
      return this.request<import('../types/user-management').ClientAuthorityType>(
        `/v1/management/clients/${clientId}/allowed-user-types`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to add allowed user type:', error);
      throw error;
    }
  }

  /**
   * 클라이언트의 허용된 User Type 제거
   * 실제 API: DELETE /v1/management/clients/{clientId}/allowed-user-types/{userType}
   */
  async removeAllowedUserType(clientId: string, userType: string): Promise<void> {
    console.log('🗑️ Removing allowed user type:', clientId, userType);

    try {
      return this.request<void>(
        `/v1/management/clients/${clientId}/allowed-user-types/${userType}`,
        { method: 'DELETE' }
      );
    } catch (error) {
      console.error('Failed to remove allowed user type:', error);
      throw error;
    }
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 사용자의 서비스 비트마스크 계산
   */
  calculateUserServiceBitmask(user: PlatformUser): {
    registrationMask: number;
    activationMask: number;
  } {
    const registeredServiceIds = user.serviceSubscriptions.map(s => s.serviceId);
    const activeServiceIds = user.serviceSubscriptions
      .filter(s => s.status === 'active')
      .map(s => s.serviceId);

    return {
      registrationMask: calculateServiceBitmask(registeredServiceIds),
      activationMask: calculateServiceBitmask(activeServiceIds),
    };
  }

  /**
   * 사용자의 모든 권한 취합 (AuthX 권한 해결 로직 시뮬레이션)
   */
  resolveUserAuthorities(user: PlatformUser): {
    roles: string[];
    permissions: string[];
    serviceScopes: string[];
  } {
    // 1. User Type 기반 기본 역할 (우선순위: 90)
    const roles = [...user.platformRoles];

    // 2. 서비스별 역할 추가
    user.serviceSubscriptions.forEach(sub => {
      roles.push(...sub.roles);
    });

    // 3. 권한은 역할로부터 도출 (실제로는 서버에서 처리)
    const permissions: string[] = [];

    // 4. 서비스 스코프
    const serviceScopes = user.serviceSubscriptions
      .filter(sub => sub.status === 'active')
      .map(sub => sub.serviceId);

    return {
      roles: [...new Set(roles)], // 중복 제거
      permissions: [...new Set(permissions)],
      serviceScopes,
    };
  }

  // ==================== User Type Definitions 관리 ====================

  /**
   * User Type Definitions 목록 조회
   * 실제 API: GET /v1/management/user-types
   */
  async getUserTypeDefinitions(): Promise<import('../types/user-management').UserTypeDefinition[]> {
    console.log('🔍 Getting user type definitions');

    try {
      return this.request<import('../types/user-management').UserTypeDefinition[]>(
        '/v1/management/user-types'
      );
    } catch (error) {
      console.error('Failed to fetch user type definitions:', error);
      throw error;
    }
  }

  /**
   * User Type Definition 생성
   * 실제 API: POST /v1/management/user-types
   */
  async createUserTypeDefinition(
    data: Omit<import('../types/user-management').UserTypeDefinition, 'created_at' | 'updated_at'>
  ): Promise<import('../types/user-management').UserTypeDefinition> {
    console.log('➕ Creating user type definition:', data);

    try {
      return this.request<import('../types/user-management').UserTypeDefinition>(
        '/v1/management/user-types',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to create user type definition:', error);
      throw error;
    }
  }

  /**
   * User Type Definition 수정
   * 실제 API: PUT /v1/management/user-types/{typeId}
   */
  async updateUserTypeDefinition(
    typeId: string,
    data: Partial<Omit<import('../types/user-management').UserTypeDefinition, 'type_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'>>
  ): Promise<import('../types/user-management').UserTypeDefinition> {
    console.log('✏️ Updating user type definition:', typeId, data);

    try {
      return this.request<import('../types/user-management').UserTypeDefinition>(
        `/v1/management/user-types/${typeId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to update user type definition:', error);
      throw error;
    }
  }

  /**
   * User Type Definition 활성화/비활성화
   * 실제 API: PATCH /v1/management/user-types/{typeId}/activation
   */
  async toggleUserTypeActivation(
    typeId: string,
    isActive: boolean
  ): Promise<import('../types/user-management').UserTypeDefinition> {
    console.log('🔄 Toggling user type activation:', typeId, isActive);

    try {
      return this.request<import('../types/user-management').UserTypeDefinition>(
        `/v1/management/user-types/${typeId}/activation`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: isActive }),
        }
      );
    } catch (error) {
      console.error('Failed to toggle user type activation:', error);
      throw error;
    }
  }

  /**
   * User Type Definition 삭제
   * 실제 API: DELETE /v1/management/user-types/{typeId}
   */
  async deleteUserTypeDefinition(typeId: string): Promise<void> {
    console.log('🗑️ Deleting user type definition:', typeId);

    try {
      return this.request<void>(`/v1/management/user-types/${typeId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete user type definition:', error);
      throw error;
    }
  }

  // ==================== Service Scopes 관리 ====================

  /**
   * Service Scopes 목록 조회
   * 실제 API: GET /v1/management/services
   */
  async getServiceScopes(): Promise<import('../types/user-management').ServiceScope[]> {
    console.log('🔍 Getting service scopes');

    try {
      return this.request<import('../types/user-management').ServiceScope[]>(
        '/v1/management/services'
      );
    } catch (error) {
      console.error('Failed to fetch service scopes:', error);
      throw error;
    }
  }

  /**
   * 특정 Service Scope 조회
   * 실제 API: GET /v1/management/services/{serviceId}
   */
  async getServiceScope(serviceId: string): Promise<import('../types/user-management').ServiceScope> {
    console.log('🔍 Getting service scope:', serviceId);

    try {
      return this.request<import('../types/user-management').ServiceScope>(
        `/v1/management/services/${serviceId}`
      );
    } catch (error) {
      console.error('Failed to fetch service scope:', error);
      throw error;
    }
  }

  /**
   * Service Scope 생성
   * 실제 API: POST /v1/management/services
   */
  async createServiceScope(
    data: { service_id: string; description: string }
  ): Promise<import('../types/user-management').ServiceScope> {
    console.log('➕ Creating service scope:', data);

    try {
      return this.request<import('../types/user-management').ServiceScope>(
        '/v1/management/services',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to create service scope:', error);
      throw error;
    }
  }

  /**
   * Service Scope 수정
   * 실제 API: PUT /v1/management/services/{serviceId}
   */
  async updateServiceScope(
    serviceId: string,
    data: { description?: string; is_active?: boolean }
  ): Promise<import('../types/user-management').ServiceScope> {
    console.log('✏️ Updating service scope:', serviceId, data);

    try {
      return this.request<import('../types/user-management').ServiceScope>(
        `/v1/management/services/${serviceId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to update service scope:', error);
      throw error;
    }
  }

  // ==================== Global Roles 관리 ====================

  /**
   * Global Roles 목록 조회
   * 실제 API: GET /v1/management/roles/global
   */
  async getGlobalRoles(): Promise<import('../types/user-management').GlobalRole[]> {
    console.log('🔍 Getting global roles');

    try {
      return this.request<import('../types/user-management').GlobalRole[]>(
        '/v1/management/roles/global'
      );
    } catch (error) {
      console.error('Failed to fetch global roles:', error);
      throw error;
    }
  }

  /**
   * Global Role 생성
   * 실제 API: POST /v1/management/roles/global
   */
  async createGlobalRole(
    data: {
      role_id: string;
      display_name: string;
      description: string;
      authority_level: number;
      permissions: string[];
      parent_role_id?: string;
    }
  ): Promise<import('../types/user-management').GlobalRole> {
    console.log('➕ Creating global role:', data);

    try {
      return this.request<import('../types/user-management').GlobalRole>(
        '/v1/management/roles/global',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to create global role:', error);
      throw error;
    }
  }

  /**
   * Global Role 수정
   * 실제 API: PUT /v1/management/roles/global/{roleId}
   */
  async updateGlobalRole(
    roleId: string,
    data: {
      display_name?: string;
      description?: string;
      authority_level?: number;
      permissions?: string[];
      parent_role_id?: string;
    }
  ): Promise<import('../types/user-management').GlobalRole> {
    console.log('✏️ Updating global role:', roleId, data);

    try {
      return this.request<import('../types/user-management').GlobalRole>(
        `/v1/management/roles/global/${roleId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to update global role:', error);
      throw error;
    }
  }

  /**
   * Global Role 활성화/비활성화
   * 실제 API: PATCH /v1/management/roles/global/{roleId}/activation
   */
  async toggleGlobalRoleActivation(
    roleId: string,
    isActive: boolean
  ): Promise<import('../types/user-management').GlobalRole> {
    console.log('🔄 Toggling global role activation:', roleId, isActive);

    try {
      return this.request<import('../types/user-management').GlobalRole>(
        `/v1/management/roles/global/${roleId}/activation`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: isActive }),
        }
      );
    } catch (error) {
      console.error('Failed to toggle global role activation:', error);
      throw error;
    }
  }

  /**
   * Global Role 삭제
   * 실제 API: DELETE /v1/management/roles/global/{roleId}
   */
  async deleteGlobalRole(roleId: string): Promise<void> {
    console.log('🗑️ Deleting global role:', roleId);

    try {
      return this.request<void>(`/v1/management/roles/global/${roleId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete global role:', error);
      throw error;
    }
  }

  // ==================== Service Roles 관리 ====================

  /**
   * 전체 Service Roles 목록 조회
   * 실제 API: GET /v1/management/roles/services
   */
  async getServiceRoles(): Promise<import('../types/user-management').ServiceRoleDefinition[]> {
    console.log('🔍 Getting all service roles');

    try {
      return this.request<import('../types/user-management').ServiceRoleDefinition[]>(
        '/v1/management/roles/services'
      );
    } catch (error) {
      console.error('Failed to fetch service roles:', error);
      throw error;
    }
  }

  /**
   * 특정 서비스의 Service Roles 조회
   * 실제 API: GET /v1/management/roles/services/{serviceId}
   */
  async getServiceRolesByService(
    serviceId: string
  ): Promise<import('../types/user-management').ServiceRoleDefinition[]> {
    console.log('🔍 Getting service roles for service:', serviceId);

    try {
      return this.request<import('../types/user-management').ServiceRoleDefinition[]>(
        `/v1/management/roles/services/${serviceId}`
      );
    } catch (error) {
      console.error('Failed to fetch service roles for service:', error);
      throw error;
    }
  }

  /**
   * Service Role 생성
   * 실제 API: POST /v1/management/roles/services/{serviceId}
   */
  async createServiceRole(
    serviceId: string,
    data: {
      role_name: string;
      display_name: string;
      description: string;
      permissions: string[];
    }
  ): Promise<import('../types/user-management').ServiceRoleDefinition> {
    console.log('➕ Creating service role:', serviceId, data);

    try {
      return this.request<import('../types/user-management').ServiceRoleDefinition>(
        `/v1/management/roles/services/${serviceId}`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to create service role:', error);
      throw error;
    }
  }

  /**
   * Service Role 수정
   * 실제 API: PUT /v1/management/roles/services/{serviceId}/{roleName}
   */
  async updateServiceRole(
    serviceId: string,
    roleName: string,
    data: {
      display_name?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<import('../types/user-management').ServiceRoleDefinition> {
    console.log('✏️ Updating service role:', serviceId, roleName, data);

    try {
      return this.request<import('../types/user-management').ServiceRoleDefinition>(
        `/v1/management/roles/services/${serviceId}/${roleName}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to update service role:', error);
      throw error;
    }
  }

  /**
   * Service Role 활성화/비활성화
   * 실제 API: PATCH /v1/management/roles/services/{serviceId}/{roleName}/activation
   */
  async toggleServiceRoleActivation(
    serviceId: string,
    roleName: string,
    isActive: boolean
  ): Promise<import('../types/user-management').ServiceRoleDefinition> {
    console.log('🔄 Toggling service role activation:', serviceId, roleName, isActive);

    try {
      return this.request<import('../types/user-management').ServiceRoleDefinition>(
        `/v1/management/roles/services/${serviceId}/${roleName}/activation`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: isActive }),
        }
      );
    } catch (error) {
      console.error('Failed to toggle service role activation:', error);
      throw error;
    }
  }

  /**
   * Service Role 삭제
   * 실제 API: DELETE /v1/management/roles/services/{serviceId}/{roleName}
   */
  async deleteServiceRole(serviceId: string, roleName: string): Promise<void> {
    console.log('🗑️ Deleting service role:', serviceId, roleName);

    try {
      return this.request<void>(`/v1/management/roles/services/${serviceId}/${roleName}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete service role:', error);
      throw error;
    }
  }

  // ==================== Permission Definitions 관리 ====================

  /**
   * 전체 권한 목록 조회
   * 실제 API: GET /v1/management/permissions
   */
  async getPermissions(
    filter?: import('../types/user-management').PermissionSearchFilter
  ): Promise<import('../types/user-management').PermissionDefinition[]> {
    console.log('🔍 Getting permissions with filter:', filter);

    try {
      const params = new URLSearchParams();
      if (filter?.keyword) params.append('keyword', filter.keyword);
      if (filter?.service_id) params.append('service_id', filter.service_id);
      if (filter?.category) params.append('category', filter.category);
      if (filter?.resource) params.append('resource', filter.resource);
      if (filter?.is_active !== undefined)
        params.append('is_active', filter.is_active.toString());

      const queryString = params.toString() ? `?${params.toString()}` : '';
      return this.request<import('../types/user-management').PermissionDefinition[]>(
        `/v1/management/permissions${queryString}`
      );
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      throw error;
    }
  }

  /**
   * 서비스별 그룹화된 권한 조회
   * 실제 API: GET /v1/management/permissions/grouped-by-service
   */
  async getGroupedPermissions(): Promise<
    import('../types/user-management').GroupedPermissions[]
  > {
    console.log('🔍 Getting grouped permissions by service');

    try {
      return this.request<import('../types/user-management').GroupedPermissions[]>(
        '/v1/management/permissions/grouped-by-service'
      );
    } catch (error) {
      console.error('Failed to fetch grouped permissions:', error);
      throw error;
    }
  }

  /**
   * 특정 서비스의 권한 조회
   * 실제 API: GET /v1/management/permissions/services/{serviceId}
   */
  async getPermissionsByService(
    serviceId: string
  ): Promise<import('../types/user-management').PermissionDefinition[]> {
    console.log('🔍 Getting permissions for service:', serviceId);

    try {
      return this.request<import('../types/user-management').PermissionDefinition[]>(
        `/v1/management/permissions/services/${serviceId}`
      );
    } catch (error) {
      console.error('Failed to fetch permissions for service:', error);
      throw error;
    }
  }

  /**
   * 권한 생성
   * 실제 API: POST /v1/management/permissions
   */
  async createPermission(
    data: import('../types/user-management').PermissionCreateRequest
  ): Promise<import('../types/user-management').PermissionDefinition> {
    console.log('➕ Creating permission:', data);

    try {
      return this.request<import('../types/user-management').PermissionDefinition>(
        '/v1/management/permissions',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to create permission:', error);
      throw error;
    }
  }

  /**
   * 권한 수정
   * 실제 API: PUT /v1/management/permissions/{id}
   */
  async updatePermission(
    id: number,
    data: import('../types/user-management').PermissionUpdateRequest
  ): Promise<import('../types/user-management').PermissionDefinition> {
    console.log('✏️ Updating permission:', id, data);

    try {
      return this.request<import('../types/user-management').PermissionDefinition>(
        `/v1/management/permissions/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to update permission:', error);
      throw error;
    }
  }

  /**
   * 권한 활성화/비활성화
   * 실제 API: PATCH /v1/management/permissions/{id}/activation
   */
  async togglePermissionActivation(
    id: number,
    isActive: boolean
  ): Promise<import('../types/user-management').PermissionDefinition> {
    console.log('🔄 Toggling permission activation:', id, isActive);

    try {
      return this.request<import('../types/user-management').PermissionDefinition>(
        `/v1/management/permissions/${id}/activation`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: isActive }),
        }
      );
    } catch (error) {
      console.error('Failed to toggle permission activation:', error);
      throw error;
    }
  }

  /**
   * 권한 삭제
   * 실제 API: DELETE /v1/management/permissions/{id}
   */
  async deletePermission(id: number): Promise<void> {
    console.log('🗑️ Deleting permission:', id);

    try {
      return this.request<void>(`/v1/management/permissions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete permission:', error);
      throw error;
    }
  }

  // ==================== Permission Templates 관리 ====================

  /**
   * Permission Templates 목록 조회 (페이징)
   * 실제 API: GET /v1/management/permission-templates
   * Query Parameters: category (optional), isActive (optional), page, size
   */
  async getPermissionTemplates(params?: {
    category?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Promise<import('../types/user-management').PageResponse<import('../types/user-management').PermissionTemplate>> {
    console.log('🔍 Getting permission templates', params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return this.request<import('../types/user-management').PageResponse<import('../types/user-management').PermissionTemplate>>(
        `/v1/management/permission-templates${queryString}`
      );
    } catch (error) {
      console.error('Failed to fetch permission templates:', error);
      throw error;
    }
  }

  /**
   * 특정 Permission Template 조회
   * 실제 API: GET /v1/management/permission-templates/{templateId}
   */
  async getPermissionTemplate(
    templateId: number
  ): Promise<import('../types/user-management').PermissionTemplate> {
    console.log('🔍 Getting permission template:', templateId);

    try {
      return this.request<import('../types/user-management').PermissionTemplate>(
        `/v1/management/permission-templates/${templateId}`
      );
    } catch (error) {
      console.error('Failed to fetch permission template:', error);
      throw error;
    }
  }

  /**
   * Permission Template 생성
   * 실제 API: POST /v1/management/permission-templates
   */
  async createPermissionTemplate(
    data: import('../types/user-management').TemplateCreateRequest
  ): Promise<import('../types/user-management').PermissionTemplate> {
    console.log('➕ Creating permission template:', data);

    try {
      return this.request<import('../types/user-management').PermissionTemplate>(
        '/v1/management/permission-templates',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to create permission template:', error);
      throw error;
    }
  }

  /**
   * Permission Template 수정
   * 실제 API: PUT /v1/management/permission-templates/{templateId}
   */
  async updatePermissionTemplate(
    templateId: number,
    data: import('../types/user-management').TemplateUpdateRequest
  ): Promise<import('../types/user-management').PermissionTemplate> {
    console.log('✏️ Updating permission template:', templateId, data);

    try {
      return this.request<import('../types/user-management').PermissionTemplate>(
        `/v1/management/permission-templates/${templateId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('Failed to update permission template:', error);
      throw error;
    }
  }

  /**
   * Permission Template 삭제 (비활성화)
   * 실제 API: DELETE /v1/management/permission-templates/{templateId}
   */
  async deletePermissionTemplate(templateId: number): Promise<void> {
    console.log('🗑️ Deleting permission template:', templateId);

    try {
      return this.request<void>(`/v1/management/permission-templates/${templateId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete permission template:', error);
      throw error;
    }
  }

  /**
   * Permission Template 활성화/비활성화
   * 실제 API: PATCH /v1/management/permission-templates/{templateId}/activation
   */
  async togglePermissionTemplateActivation(
    templateId: number,
    isActive: boolean
  ): Promise<import('../types/user-management').PermissionTemplate> {
    console.log('🔄 Toggling permission template activation:', templateId, isActive);

    try {
      return this.request<import('../types/user-management').PermissionTemplate>(
        `/v1/management/permission-templates/${templateId}/activation`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: isActive }),
        }
      );
    } catch (error) {
      console.error('Failed to toggle permission template activation:', error);
      throw error;
    }
  }

  // ========== DEPRECATED: Authority Templates (하위 호환성) ==========
  /** @deprecated Use getPermissionTemplates instead */
  async getAuthorityTemplates() {
    console.warn('⚠️ getAuthorityTemplates is deprecated. Use getPermissionTemplates instead.');
    const result = await this.getPermissionTemplates();
    return result.content;
  }

  /** @deprecated Use getPermissionTemplate instead */
  async getAuthorityTemplate(templateId: number) {
    console.warn('⚠️ getAuthorityTemplate is deprecated. Use getPermissionTemplate instead.');
    return this.getPermissionTemplate(templateId);
  }

  /** @deprecated Use createPermissionTemplate instead */
  async createAuthorityTemplate(data: any) {
    console.warn('⚠️ createAuthorityTemplate is deprecated. Use createPermissionTemplate instead.');
    return this.createPermissionTemplate(data);
  }

  /** @deprecated Use updatePermissionTemplate instead */
  async updateAuthorityTemplate(templateId: number, data: any) {
    console.warn('⚠️ updateAuthorityTemplate is deprecated. Use updatePermissionTemplate instead.');
    return this.updatePermissionTemplate(templateId, data);
  }

  /** @deprecated Use deletePermissionTemplate instead */
  async deleteAuthorityTemplate(templateId: number) {
    console.warn('⚠️ deleteAuthorityTemplate is deprecated. Use deletePermissionTemplate instead.');
    return this.deletePermissionTemplate(templateId);
  }
}

export const userManagementService = new UserManagementService();