// Notification Service Type Definitions
// 알림 서비스 타입 정의

// Enums
export type PlatformType = 'ANDROID' | 'IOS' | 'WEB';

export type NotificationType = 'WEB_PUSH' | 'MOBILE_PUSH' | 'EMAIL';

export type NotificationStatus =
  | 'TRANSFER_TO_PROVIDER'
  | 'NOTIFICATION_FAILED'
  | 'NOTIFICATION_SUCCESS';

// Push Token Management
export interface TokenRegistrationRequest {
  push_token: string;
  platform_type: PlatformType;
  device_id: string;
  device_name?: string;
  app_version?: string;
  expires_at?: string;
}

export interface TokenResponse {
  token_id: number;
  user_id: string;
  push_token: string;
  platform_type: PlatformType;
  device_id: string;
  device_name?: string;
  app_version?: string;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

// Email Management
export interface EmailRegistrationRequest {
  email: string;
}

export interface EmailResponse {
  email_id: number;
  user_id: string;
  email: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

// Push Notification
export interface PushNotificationRequest {
  title: string;
  message: string;
  additional_data?: Record<string, string>;
  notification_type?: NotificationType;
  target_platforms?: PlatformType[];
  target_token_ids?: number[];
  target_device_ids?: string[];
}

export interface PushNotificationResponse {
  user_id: string;
  title: string;
  message: string;
  total_targets: number;
  request_ids: string[];
  sent_at: string;
}

// Email Notification
export interface EmailSendRequest {
  subject: string;
  content: string;
  template_data?: Record<string, string>;
  template_name?: string;
}

// Notification History
export interface NotificationHistoryResponse {
  request_id: string;
  notification_type: NotificationType;
  message_id: string;
  status: NotificationStatus;
  created_at: string;
  updated_at: string;
}

// Error Response
export interface ErrorDetails {
  field_name?: string;
  message?: string;
}

export interface ErrorResponse {
  message: string;
  detail_message?: ErrorDetails[];
  code?: string;
}
