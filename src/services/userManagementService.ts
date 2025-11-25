// 사용자 관리 서비스 (AuthX API 연동)
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  PlatformUser,
  PlatformUserResponse,
  PlatformService,
  OAuthClient,
  UserFormData,
  ServiceSubscriptionChange,
  ServiceSubscription,
  UserServiceResponse,
  UserSearchFilter,
  ServiceSearchFilter,
  CodeGroup,
  Code,
  CreateCodeGroupRequest,
  UpdateCodeGroupRequest,
  CreateCodeRequest,
  UpdateCodeRequest,
} from '../types/user-management';

import {
  MOCK_USERS,
  MOCK_SERVICES,
  calculateServiceBitmask,
} from '../constants/user-management';

import { getAuthHeaders } from '../utils/authUtils';
import { adaptUserResponseArrayToUsers, adaptUserFormToApiRequest } from '../utils/userAdapters';

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
  async getUsers(
    filter?: UserSearchFilter,
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<PlatformUser>> {
    console.log('🔍 Getting users with filter:', filter, 'params:', params);

    try {
      // 페이징 파라미터 구성
      const queryParams: Record<string, string | string[]> = {};
      if (params?.page !== undefined) queryParams.page = String(params.page);
      if (params?.size !== undefined) queryParams.size = String(params.size);
      if (params?.sort) queryParams.sort = params.sort;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();

      const url = `/v1/management/users${queryString ? `?${queryString}` : ''}`;

      // 실제 API 연동 - 페이징된 응답
      const response = await this.request<import('../types/user-management').PageResponse<PlatformUserResponse>>(url);

      // API 응답의 content를 UI 타입으로 변환
      const users = adaptUserResponseArrayToUsers(response.content);

      // 페이징 응답 구조 유지
      return {
        ...response,
        content: users,
      };
    } catch (error) {
      console.error('Failed to fetch users from API:', error);
      throw error;
    }
  }

  /**
   * 특정 사용자 조회
   * 실제 API: GET /v1/management/users/{userId}
   */
  async getUser(userId: string): Promise<PlatformUser> {
    console.log('🔍 Getting user:', userId);

    try {
      const response = await this.request<PlatformUserResponse>(`/v1/management/users/${userId}`);
      const users = adaptUserResponseArrayToUsers([response]);
      return users[0];
    } catch (error) {
      console.error('Failed to fetch user from API:', error);
      throw error;
    }
  }

  /**
   * 사용자 서비스 가입 정보 조회
   * 실제 API: GET /v1/management/users/{userId}/services
   */
  async getUserServices(userId: string): Promise<ServiceSubscription[]> {
    try {
      const response = await this.request<UserServiceResponse[]>(`/v1/management/users/${userId}/services`);
      return response.map(service => ({
        serviceId: service.service_id,
        serviceName: service.service_name || service.service_id,
        subscribedAt: service.subscribed_at,
        status: service.status,
        roles: service.roles,
        metadata: service.metadata,
      }));
    } catch (error) {
      console.error('Failed to fetch user services from API:', error);
      throw error;
    }
  }

  /**
   * 사용자 생성
   * 실제 API: POST /v1/management/users
   */
  async createUser(userData: UserFormData): Promise<PlatformUser> {
    console.log('➕ Creating user:', userData);

    try {
      const requestData = adaptUserFormToApiRequest(userData);
      const response = await this.request<PlatformUserResponse>('/v1/management/users', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const users = adaptUserResponseArrayToUsers([response]);
      return users[0];
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 수정
   * 실제 API: PUT /v1/management/users/{userId}
   */
  async updateUser(userId: string, userData: Partial<UserFormData>): Promise<PlatformUser> {
    console.log('✏️ Updating user:', userId, userData);

    try {
      const requestData = adaptUserFormToApiRequest(userData as any);

      // 수정 시 비밀번호가 입력되지 않았으면 제거
      if (!userData.password) {
        delete requestData.password;
      }

      const response = await this.request<PlatformUserResponse>(
        `/v1/management/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestData),
        }
      );
      const users = adaptUserResponseArrayToUsers([response]);
      return users[0];
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * 사용자 삭제
   * 실제 API: DELETE /v1/management/users/{userId}
   */
  async deleteUser(userId: string): Promise<void> {
    console.log('🗑️ Deleting user:', userId);

    try {
      await this.request<void>(`/v1/management/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
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
   * Query Parameters: page, size, sort
   */
  async getClients(
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<OAuthClient>> {
    console.log('🔍 Getting OAuth clients with params:', params);

    try {
      const queryParams: Record<string, string | string[]> = {};
      if (params?.page !== undefined) queryParams.page = String(params.page);
      if (params?.size !== undefined) queryParams.size = String(params.size);
      if (params?.sort) queryParams.sort = params.sort;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();

      const url = `/v1/management/clients${queryString ? `?${queryString}` : ''}`;

      return this.request<import('../types/user-management').PageResponse<OAuthClient>>(url);
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
  async getUserTypeDefinitions(
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<import('../types/user-management').UserTypeDefinition>> {
    console.log('🔍 Getting user type definitions with params:', params);

    try {
      const queryParams: Record<string, string | string[]> = {};
      if (params?.page !== undefined) queryParams.page = String(params.page);
      if (params?.size !== undefined) queryParams.size = String(params.size);
      if (params?.sort) queryParams.sort = params.sort;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();

      const url = `/v1/management/user-types${queryString ? `?${queryString}` : ''}`;

      return this.request<import('../types/user-management').PageResponse<import('../types/user-management').UserTypeDefinition>>(
        url
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
  async getServiceScopes(
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<import('../types/user-management').ServiceScope>> {
    console.log('🔍 Getting service scopes with params:', params);

    try {
      const queryParams: Record<string, string | string[]> = {};
      if (params?.page !== undefined) queryParams.page = String(params.page);
      if (params?.size !== undefined) queryParams.size = String(params.size);
      if (params?.sort) queryParams.sort = params.sort;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();

      const url = `/v1/management/services${queryString ? `?${queryString}` : ''}`;

      return this.request<import('../types/user-management').PageResponse<import('../types/user-management').ServiceScope>>(
        url
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
  async getGlobalRoles(
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<import('../types/user-management').GlobalRole>> {
    console.log('🔍 Getting global roles with params:', params);

    try {
      const queryParams: Record<string, string | string[]> = {};
      if (params?.page !== undefined) queryParams.page = String(params.page);
      if (params?.size !== undefined) queryParams.size = String(params.size);
      if (params?.sort) queryParams.sort = params.sort;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();

      const url = `/v1/management/roles/global${queryString ? `?${queryString}` : ''}`;

      return this.request<import('../types/user-management').PageResponse<import('../types/user-management').GlobalRole>>(
        url
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
    serviceId: string,
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<import('../types/user-management').ServiceRoleDefinition>> {
    console.log('🔍 Getting service roles for service:', serviceId, 'with params:', params);

    try {
      const queryParams: Record<string, string | string[]> = {};
      if (params?.page !== undefined) queryParams.page = String(params.page);
      if (params?.size !== undefined) queryParams.size = String(params.size);
      if (params?.sort) queryParams.sort = params.sort;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();

      const url = `/v1/management/roles/services/${serviceId}${queryString ? `?${queryString}` : ''}`;

      return this.request<import('../types/user-management').PageResponse<import('../types/user-management').ServiceRoleDefinition>>(
        url
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
   * 전체 권한 목록 조회 (페이징 지원)
   * 실제 API: GET /v1/management/permissions
   */
  async getPermissions(
    filter?: import('../types/user-management').PermissionSearchFilter,
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<import('../types/user-management').PermissionDefinition>> {
    console.log('🔍 Getting permissions with filter:', filter, 'params:', params);

    try {
      const queryParams: Record<string, string | string[]> = {};

      // 필터 파라미터
      if (filter?.keyword) queryParams.keyword = filter.keyword;
      if (filter?.service_id) queryParams.service_id = filter.service_id;
      if (filter?.category) queryParams.category = filter.category;
      if (filter?.resource) queryParams.resource = filter.resource;
      if (filter?.is_active !== undefined) queryParams.is_active = filter.is_active.toString();

      // 페이징 파라미터
      if (params?.page !== undefined) queryParams.page = String(params.page);
      if (params?.size !== undefined) queryParams.size = String(params.size);
      if (params?.sort) queryParams.sort = params.sort;

      const queryString = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, value]) =>
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();

      const url = `/v1/management/permissions${queryString ? `?${queryString}` : ''}`;
      return this.request<import('../types/user-management').PageResponse<import('../types/user-management').PermissionDefinition>>(url);
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

  // ============================================
  // 공통 코드 관리 (Common Code Management)
  // ============================================

  /**
   * 코드 그룹 목록 조회 (페이징 지원)
   * GET /v1/management/codes/groups
   */
  async getCodeGroups(
    activeOnly: boolean = false,
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<CodeGroup>> {
    const queryParams: Record<string, string | string[]> = {};

    if (activeOnly) {
      queryParams.activeOnly = 'true';
    }

    // 페이징 파라미터
    if (params?.page !== undefined) queryParams.page = String(params.page);
    if (params?.size !== undefined) queryParams.size = String(params.size);
    if (params?.sort) queryParams.sort = params.sort;

    const queryString = new URLSearchParams(
      Object.entries(queryParams).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
      )
    ).toString();

    const url = `/v1/management/codes/groups${queryString ? `?${queryString}` : ''}`;
    return this.request<import('../types/user-management').PageResponse<CodeGroup>>(url);
  }

  /**
   * 특정 코드 그룹 조회
   * GET /v1/management/codes/groups/{groupId}
   */
  async getCodeGroup(groupId: string) {
    return this.request<CodeGroup>(`/v1/management/codes/groups/${groupId}`);
  }

  /**
   * 코드 그룹 생성
   * POST /v1/management/codes/groups
   */
  async createCodeGroup(data: CreateCodeGroupRequest) {
    return this.request<CodeGroup>('/v1/management/codes/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 코드 그룹 수정
   * PUT /v1/management/codes/groups/{groupId}
   */
  async updateCodeGroup(groupId: string, data: UpdateCodeGroupRequest) {
    return this.request<CodeGroup>(`/v1/management/codes/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 코드 그룹 삭제
   * DELETE /v1/management/codes/groups/{groupId}
   * ⚠️ 코드가 하나라도 있으면 삭제 불가
   */
  async deleteCodeGroup(groupId: string) {
    return this.request<void>(`/v1/management/codes/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 코드 그룹 활성화/비활성화
   * PATCH /v1/management/codes/groups/{groupId}/activation?isActive={isActive}
   */
  async toggleCodeGroupActivation(groupId: string, isActive: boolean) {
    return this.request<CodeGroup>(
      `/v1/management/codes/groups/${groupId}/activation?isActive=${isActive}`,
      {
        method: 'PATCH',
      }
    );
  }

  /**
   * 특정 그룹의 코드 목록 조회 (페이징 지원)
   * GET /v1/management/codes/groups/{groupId}/codes
   */
  async getCodesByGroup(
    groupId: string,
    activeOnly: boolean = true,
    params?: import('../types/user-management').PageParams
  ): Promise<import('../types/user-management').PageResponse<Code>> {
    const queryParams: Record<string, string | string[]> = {};

    if (activeOnly) {
      queryParams.activeOnly = 'true';
    }

    // 페이징 파라미터
    if (params?.page !== undefined) queryParams.page = String(params.page);
    if (params?.size !== undefined) queryParams.size = String(params.size);
    if (params?.sort) queryParams.sort = params.sort;

    const queryString = new URLSearchParams(
      Object.entries(queryParams).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
      )
    ).toString();

    const url = `/v1/management/codes/groups/${groupId}/codes${queryString ? `?${queryString}` : ''}`;
    return this.request<import('../types/user-management').PageResponse<Code>>(url);
  }

  /**
   * 특정 코드 조회
   * GET /v1/management/codes/groups/{groupId}/codes/{codeValue}
   */
  async getCode(groupId: string, codeValue: string) {
    return this.request<Code>(
      `/v1/management/codes/groups/${groupId}/codes/${codeValue}`
    );
  }

  /**
   * 코드 생성
   * POST /v1/management/codes/groups/{groupId}/codes
   */
  async createCode(groupId: string, data: CreateCodeRequest) {
    return this.request<Code>(`/v1/management/codes/groups/${groupId}/codes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 코드 수정
   * PUT /v1/management/codes/codes/{codeId}
   */
  async updateCode(codeId: number, data: UpdateCodeRequest) {
    return this.request<Code>(`/v1/management/codes/codes/${codeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 코드 삭제
   * DELETE /v1/management/codes/codes/{codeId}
   * ⚠️ 하위 코드가 있으면 삭제 불가
   */
  async deleteCode(codeId: number) {
    return this.request<void>(`/v1/management/codes/codes/${codeId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 코드 활성화/비활성화
   * PATCH /v1/management/codes/codes/{codeId}/activation?isActive={isActive}
   */
  async toggleCodeActivation(codeId: number, isActive: boolean) {
    return this.request<Code>(
      `/v1/management/codes/codes/${codeId}/activation?isActive=${isActive}`,
      {
        method: 'PATCH',
      }
    );
  }

  /**
   * 템플릿 카테고리 조회
   * GET /v1/management/codes/template-categories
   * (TEMPLATE_CATEGORY 그룹의 활성화된 코드)
   */
  async getTemplateCategories() {
    return this.request<Code[]>('/v1/management/codes/template-categories');
  }

  // ==================== 감사 로그 (Audit Logs) ====================

  /**
   * 모든 활성 감사 이벤트 조회
   * GET /v1/audit
   */
  async getAllAuditEvents(params?: {
    page?: number;
    size?: number;
  }): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting all audit events', params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const query = queryParams.toString();
      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit${query ? `?${query}` : ''}`
      );
    } catch (error) {
      console.error('Failed to get audit events:', error);
      throw error;
    }
  }

  /**
   * 감사 이벤트 동적 필터 검색
   * POST /v1/audit/search
   */
  async searchAuditEvents(
    filter: import('../types/user-management').AuditEventFilter,
    params?: { page?: number; size?: number }
  ): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Searching audit events with filter', filter, params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const query = queryParams.toString();
      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/search${query ? `?${query}` : ''}`,
        {
          method: 'POST',
          body: JSON.stringify(filter),
        }
      );
    } catch (error) {
      console.error('Failed to search audit events:', error);
      throw error;
    }
  }

  /**
   * 특정 감사 이벤트 조회
   * GET /v1/audit/{eventId}
   */
  async getAuditEvent(eventId: string): Promise<import('../types/user-management').AuditEvent> {
    console.log('🔍 Getting audit event:', eventId);

    try {
      return this.request<import('../types/user-management').AuditEvent>(`/v1/audit/${eventId}`);
    } catch (error) {
      console.error('Failed to get audit event:', error);
      throw error;
    }
  }

  /**
   * 사용자 활동 조회
   * GET /v1/audit/user/{actorId}
   */
  async getUserActivity(
    actorId: string,
    params?: { page?: number; size?: number }
  ): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting user activity:', actorId, params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const query = queryParams.toString();
      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/user/${actorId}${query ? `?${query}` : ''}`
      );
    } catch (error) {
      console.error('Failed to get user activity:', error);
      throw error;
    }
  }

  /**
   * 오늘의 감사 이벤트 조회
   * GET /v1/audit/today
   */
  async getTodayAuditEvents(params?: {
    page?: number;
    size?: number;
  }): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting today audit events', params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const query = queryParams.toString();
      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/today${query ? `?${query}` : ''}`
      );
    } catch (error) {
      console.error('Failed to get today audit events:', error);
      throw error;
    }
  }

  /**
   * 최근 N일 감사 이벤트 조회
   * GET /v1/audit/recent?days={days}
   */
  async getRecentAuditEvents(
    days: number = 7,
    params?: { page?: number; size?: number }
  ): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting recent audit events:', days, params);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('days', days.toString());
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/recent?${queryParams.toString()}`
      );
    } catch (error) {
      console.error('Failed to get recent audit events:', error);
      throw error;
    }
  }

  /**
   * 기간별 감사 이벤트 조회
   * GET /v1/audit/range?startTime={startTime}&endTime={endTime}
   */
  async getAuditEventsByTimeRange(
    startTime: string,
    endTime: string,
    params?: { page?: number; size?: number }
  ): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting audit events by time range:', startTime, endTime, params);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startTime', startTime);
      queryParams.append('endTime', endTime);
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/range?${queryParams.toString()}`
      );
    } catch (error) {
      console.error('Failed to get audit events by time range:', error);
      throw error;
    }
  }

  /**
   * 보안 이벤트 조회
   * GET /v1/audit/security/events
   */
  async getSecurityEvents(params?: {
    page?: number;
    size?: number;
  }): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting security events', params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const query = queryParams.toString();
      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/security/events${query ? `?${query}` : ''}`
      );
    } catch (error) {
      console.error('Failed to get security events:', error);
      throw error;
    }
  }

  /**
   * 중요 보안 이벤트 조회 (HIGH, CRITICAL)
   * GET /v1/audit/security/critical
   */
  async getCriticalSecurityEvents(params?: {
    page?: number;
    size?: number;
  }): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting critical security events', params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const query = queryParams.toString();
      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/security/critical${query ? `?${query}` : ''}`
      );
    } catch (error) {
      console.error('Failed to get critical security events:', error);
      throw error;
    }
  }

  /**
   * 실패 이벤트 조회
   * GET /v1/audit/security/failures
   */
  async getFailureEvents(params?: {
    page?: number;
    size?: number;
  }): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting failure events', params);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const query = queryParams.toString();
      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/security/failures${query ? `?${query}` : ''}`
      );
    } catch (error) {
      console.error('Failed to get failure events:', error);
      throw error;
    }
  }

  /**
   * 로그인 실패 이벤트 조회
   * GET /v1/audit/security/login-failures?hours={hours}
   */
  async getLoginFailures(
    hours: number = 24,
    params?: { page?: number; size?: number }
  ): Promise<import('../types/user-management').PageAuditEvent> {
    console.log('🔍 Getting login failures:', hours, params);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('hours', hours.toString());
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      return this.request<import('../types/user-management').PageAuditEvent>(
        `/v1/audit/security/login-failures?${queryParams.toString()}`
      );
    } catch (error) {
      console.error('Failed to get login failures:', error);
      throw error;
    }
  }

  /**
   * 보안 대시보드 데이터 조회
   * GET /v1/audit/security/dashboard?hours={hours}
   */
  async getSecurityDashboard(
    hours: number = 24
  ): Promise<import('../types/user-management').SecurityDashboardData> {
    console.log('🔍 Getting security dashboard:', hours);

    try {
      return this.request<import('../types/user-management').SecurityDashboardData>(
        `/v1/audit/security/dashboard?hours=${hours}`
      );
    } catch (error) {
      console.error('Failed to get security dashboard:', error);
      throw error;
    }
  }

  /**
   * 대상 변경 이력 조회
   * GET /v1/audit/target/{targetType}/{targetId}/history
   */
  async getTargetChangeHistory(
    targetType: import('../types/user-management').TargetType,
    targetId: string
  ): Promise<import('../types/user-management').AuditEvent[]> {
    console.log('🔍 Getting target change history:', targetType, targetId);

    try {
      return this.request<import('../types/user-management').AuditEvent[]>(
        `/v1/audit/target/${targetType}/${targetId}/history`
      );
    } catch (error) {
      console.error('Failed to get target change history:', error);
      throw error;
    }
  }

  /**
   * 이벤트 타입별 통계 조회
   * GET /v1/audit/statistics/event-types?startTime={startTime}&endTime={endTime}
   */
  async getEventTypeStatistics(
    startTime: string,
    endTime: string
  ): Promise<Record<string, number>> {
    console.log('🔍 Getting event type statistics:', startTime, endTime);

    try {
      return this.request<Record<string, number>>(
        `/v1/audit/statistics/event-types?startTime=${startTime}&endTime=${endTime}`
      );
    } catch (error) {
      console.error('Failed to get event type statistics:', error);
      throw error;
    }
  }

  /**
   * 보안 레벨별 통계 조회
   * GET /v1/audit/statistics/security-levels?startTime={startTime}&endTime={endTime}
   */
  async getSecurityLevelStatistics(
    startTime: string,
    endTime: string
  ): Promise<Record<string, number>> {
    console.log('🔍 Getting security level statistics:', startTime, endTime);

    try {
      return this.request<Record<string, number>>(
        `/v1/audit/statistics/security-levels?startTime=${startTime}&endTime=${endTime}`
      );
    } catch (error) {
      console.error('Failed to get security level statistics:', error);
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();