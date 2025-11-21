// 알림 서비스 (Notification API 연동)
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  TokenRegistrationRequest,
  TokenResponse,
  EmailRegistrationRequest,
  EmailResponse,
  PushNotificationRequest,
  PushNotificationResponse,
  EmailSendRequest,
  NotificationHistoryResponse,
  PlatformType,
  TokenManagementResponse,
  TokenUpdateRequest,
  EmailManagementResponse,
  EmailUpdateRequest,
  NotificationHistoryManagementResponse,
  NotificationStatus,
  NotificationType,
  PageResponse,
} from '../types/notification';

import { getAuthHeaders } from '../utils/authUtils';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY || 'https://api.cadiacinsight.com';

class NotificationService {
  private getAuthHeaders() {
    return getAuthHeaders();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers);
    const authHeaders = this.getAuthHeaders();

    console.log('📤 Notification API Request:', {
      url,
      method: options.method || 'GET',
      hasAuthHeader: !!authHeaders['Authorization'],
    });

    for (const [key, value] of Object.entries(authHeaders)) {
      headers.set(key, value);
    }

    // POST/PUT 요청 시 Content-Type 설정
    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
      headers.set('Content-Type', 'application/json;charset=UTF-8');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📥 Notification API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      // 204 No Content 처리
      if (response.status === 204) {
        return undefined as T;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Notification API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const text = await response.text();
      if (!text) {
        return [] as T;
      }

      const parsed = JSON.parse(text);

      // API 응답 래퍼 처리
      if (parsed && typeof parsed === 'object' && 'data' in parsed) {
        return parsed.data as T;
      }

      return parsed;
    } catch (error) {
      console.error(`❌ Notification API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ==================== 푸시 토큰 관리 ====================

  /**
   * 사용자의 활성 푸시 토큰 목록 조회
   */
  async getUserTokens(userId: string): Promise<TokenResponse[]> {
    return this.request<TokenResponse[]>(`/v1/notifications/users/${userId}/push/tokens`);
  }

  /**
   * 푸시 토큰 등록/업데이트
   */
  async registerToken(
    userId: string,
    data: TokenRegistrationRequest
  ): Promise<TokenResponse> {
    return this.request<TokenResponse>(`/v1/notifications/users/${userId}/push/tokens`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 특정 토큰 비활성화 (tokenId 사용)
   */
  async deactivateToken(userId: string, tokenId: number): Promise<void> {
    return this.request<void>(`/v1/notifications/users/${userId}/push/tokens/${tokenId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 디바이스별 토큰 비활성화
   */
  async deactivateTokenByDevice(
    userId: string,
    deviceId: string,
    platformType: PlatformType
  ): Promise<void> {
    return this.request<void>(
      `/v1/notifications/users/${userId}/push/tokens?deviceId=${deviceId}&platformType=${platformType}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * 활성 토큰 개수 조회
   */
  async getActiveTokenCount(userId: string): Promise<number> {
    return this.request<number>(`/v1/notifications/users/${userId}/push/tokens/count`);
  }

  // ==================== 이메일 관리 ====================

  /**
   * 사용자 이메일 조회
   */
  async getUserEmail(userId: string): Promise<EmailResponse | null> {
    try {
      return await this.request<EmailResponse>(`/v1/notifications/users/${userId}/emails`);
    } catch (error) {
      // 404 에러는 이메일이 없는 것으로 처리
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 이메일 등록/업데이트
   */
  async registerEmail(userId: string, data: EmailRegistrationRequest): Promise<EmailResponse> {
    return this.request<EmailResponse>(`/v1/notifications/users/${userId}/emails`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 사용자 이메일 비활성화
   */
  async deactivateUserEmail(userId: string): Promise<void> {
    return this.request<void>(`/v1/notifications/users/${userId}/emails`, {
      method: 'DELETE',
    });
  }

  /**
   * 이메일 ID로 조회
   */
  async getEmailById(userId: string, emailId: number): Promise<EmailResponse | null> {
    try {
      return await this.request<EmailResponse>(
        `/v1/notifications/users/${userId}/emails/${emailId}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 이메일 ID로 비활성화
   */
  async deactivateEmail(userId: string, emailId: number): Promise<void> {
    return this.request<void>(`/v1/notifications/users/${userId}/emails/${emailId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 이메일 존재 여부 확인
   */
  async hasActiveEmail(userId: string): Promise<boolean> {
    return this.request<boolean>(`/v1/notifications/users/${userId}/emails/check`);
  }

  // ==================== 푸시 알림 전송 ====================

  /**
   * 푸시 알림 전송
   */
  async sendPushNotification(
    userId: string,
    data: PushNotificationRequest
  ): Promise<PushNotificationResponse> {
    return this.request<PushNotificationResponse>(`/v1/notifications/users/${userId}/push`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 푸시 전송 이력 목록 조회
   */
  async listPushHistory(userId: string): Promise<NotificationHistoryResponse[]> {
    return this.request<NotificationHistoryResponse[]>(
      `/v1/notifications/users/${userId}/push/history`
    );
  }

  /**
   * 특정 푸시 조회
   */
  async getPushByRequestId(
    userId: string,
    requestId: string
  ): Promise<NotificationHistoryResponse | null> {
    try {
      return await this.request<NotificationHistoryResponse>(
        `/v1/notifications/users/${userId}/push/history/${requestId}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // ==================== 이메일 알림 전송 ====================

  /**
   * 이메일 전송
   */
  async sendEmail(userId: string, data: EmailSendRequest): Promise<void> {
    return this.request<void>(`/v1/notifications/users/${userId}/emails/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 이메일 전송 이력 목록 조회
   */
  async listEmailHistory(userId: string): Promise<NotificationHistoryResponse[]> {
    return this.request<NotificationHistoryResponse[]>(
      `/v1/notifications/users/${userId}/emails/history`
    );
  }

  /**
   * 특정 이메일 조회
   */
  async getEmailByRequestId(
    userId: string,
    requestId: string
  ): Promise<NotificationHistoryResponse | null> {
    try {
      return await this.request<NotificationHistoryResponse>(
        `/v1/notifications/users/${userId}/emails/history/${requestId}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // ==================== 알림 이력 조회 ====================

  /**
   * 모든 알림 이력 목록 조회 (푸시 + 이메일)
   */
  async listNotificationHistories(userId: string): Promise<NotificationHistoryResponse[]> {
    return this.request<NotificationHistoryResponse[]>(
      `/v1/notifications/users/${userId}/history`
    );
  }

  /**
   * 특정 알림 조회 (메시지 ID 사용)
   */
  async getNotificationHistoryByMessageId(
    userId: string,
    messageId: string
  ): Promise<NotificationHistoryResponse | null> {
    try {
      return await this.request<NotificationHistoryResponse>(
        `/v1/notifications/users/${userId}/history/${messageId}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // ==================== Management API - 푸시 토큰 ====================

  /**
   * 전체 토큰 목록 조회 (페이징, 필터링)
   */
  async getAllTokens(params: {
    userId?: string;
    platformType?: PlatformType;
    isActive?: boolean;
    page?: number;
    size?: number;
    sort?: string[];
  }): Promise<PageResponse<TokenManagementResponse>> {
    const queryParams = new URLSearchParams();

    if (params.userId) queryParams.append('userId', params.userId);
    if (params.platformType) queryParams.append('platformType', params.platformType);
    if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.size !== undefined) queryParams.append('size', String(params.size));
    if (params.sort) {
      params.sort.forEach(s => queryParams.append('sort', s));
    }

    return this.request<PageResponse<TokenManagementResponse>>(
      `/v1/management/tokens?${queryParams.toString()}`
    );
  }

  /**
   * 토큰 상세 조회
   */
  async getTokenById(tokenId: number): Promise<TokenManagementResponse> {
    return this.request<TokenManagementResponse>(`/v1/management/tokens/${tokenId}`);
  }

  /**
   * 토큰 수정
   */
  async updateToken(tokenId: number, data: TokenUpdateRequest): Promise<TokenManagementResponse> {
    return this.request<TokenManagementResponse>(`/v1/management/tokens/${tokenId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 토큰 삭제 (비활성화)
   */
  async deleteToken(tokenId: number): Promise<void> {
    return this.request<void>(`/v1/management/tokens/${tokenId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Management API - 이메일 ====================

  /**
   * 전체 이메일 목록 조회 (페이징, 필터링)
   */
  async getAllEmails(params: {
    userId?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
    sort?: string[];
  }): Promise<PageResponse<EmailManagementResponse>> {
    const queryParams = new URLSearchParams();

    if (params.userId) queryParams.append('userId', params.userId);
    if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.size !== undefined) queryParams.append('size', String(params.size));
    if (params.sort) {
      params.sort.forEach(s => queryParams.append('sort', s));
    }

    return this.request<PageResponse<EmailManagementResponse>>(
      `/v1/management/emails?${queryParams.toString()}`
    );
  }

  /**
   * 이메일 상세 조회 (Management)
   */
  async getEmailByIdManagement(emailId: number): Promise<EmailManagementResponse> {
    return this.request<EmailManagementResponse>(`/v1/management/emails/${emailId}`);
  }

  /**
   * 이메일 수정
   */
  async updateEmail(emailId: number, data: EmailUpdateRequest): Promise<EmailManagementResponse> {
    return this.request<EmailManagementResponse>(`/v1/management/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 이메일 삭제 (비활성화)
   */
  async deleteEmailManagement(emailId: number): Promise<void> {
    return this.request<void>(`/v1/management/emails/${emailId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Management API - 알림 이력 ====================

  /**
   * 전체 알림 이력 조회 (페이징, 필터링)
   */
  async getAllNotificationHistories(params: {
    userId?: string;
    notificationType?: NotificationType;
    status?: NotificationStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sort?: string[];
  }): Promise<PageResponse<NotificationHistoryManagementResponse>> {
    const queryParams = new URLSearchParams();

    if (params.userId) queryParams.append('userId', params.userId);
    if (params.notificationType) queryParams.append('notificationType', params.notificationType);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.size !== undefined) queryParams.append('size', String(params.size));
    if (params.sort) {
      params.sort.forEach(s => queryParams.append('sort', s));
    }

    return this.request<PageResponse<NotificationHistoryManagementResponse>>(
      `/v1/management/notifications/history?${queryParams.toString()}`
    );
  }

  /**
   * 알림 이력 상세 조회
   */
  async getNotificationHistoryById(historyId: number): Promise<NotificationHistoryManagementResponse> {
    return this.request<NotificationHistoryManagementResponse>(
      `/v1/management/notifications/history/${historyId}`
    );
  }
}

export const notificationService = new NotificationService();
