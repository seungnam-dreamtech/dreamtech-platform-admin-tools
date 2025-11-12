// 사용자 API 응답 어댑터

import type { PlatformUser, PlatformUserResponse } from '../types/user-management';

/**
 * API 응답을 UI용 PlatformUser로 변환
 */
export function adaptUserResponseToUser(response: PlatformUserResponse): PlatformUser {
  // 상태 결정: enabled, account_non_locked, account_non_expired를 기반으로
  let status: 'active' | 'inactive' | 'suspended' = 'inactive';

  if (!response.enabled) {
    status = 'inactive';
  } else if (!response.account_non_locked) {
    status = 'suspended';
  } else if (response.enabled && response.account_non_locked && response.account_non_expired) {
    status = 'active';
  }

  return {
    id: response.id,
    email: response.email_address,
    name: response.full_name,
    phoneNumber: response.phone_number,
    status,
    userType: response.user_type,
    createdAt: response.created_at,
    updatedAt: response.updated_at,

    // 역할 및 권한 (현재 API 응답에 없음, 추후 추가 필요)
    platformRoles: [], // TODO: API에서 역할 정보 제공 시 매핑
    serviceSubscriptions: [], // TODO: API에서 서비스 가입 정보 제공 시 매핑

    // API 응답 추가 필드
    username: response.username,
    firstName: response.first_name,
    lastName: response.last_name,
    emailVerified: response.email_verified,
    birthDate: response.birth_date,
    zipCode: response.zip_code,
    address: response.address,
    addressDetail: response.address_detail,
    isAnonymous: response.is_anonymous,
    hasProfile: response.has_profile,
  };
}

/**
 * API 응답 배열을 PlatformUser 배열로 변환
 */
export function adaptUserResponseArrayToUsers(
  responses: PlatformUserResponse[]
): PlatformUser[] {
  return responses.map(adaptUserResponseToUser);
}

/**
 * UI 폼 데이터를 API 요청 형식으로 변환
 */
export function adaptUserFormToApiRequest(formData: {
  email: string;
  password?: string;
  name: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive' | 'suspended';
  userType?: string;
  platformRoles?: string[];
  serviceSubscriptions?: Array<{ serviceId: string; roles: string[] }>;
}): {
  username: string;
  email_address: string;
  password?: string;
  full_name: string;
  phone_number?: string;
  user_type: string;
  enabled: boolean;
  // 추가 필드는 필요 시 확장
} {
  return {
    username: formData.email, // username을 email로 사용
    email_address: formData.email,
    password: formData.password,
    full_name: formData.name,
    phone_number: formData.phoneNumber,
    user_type: formData.userType || 'USER',
    enabled: formData.status === 'active',
    // TODO: department, position 등은 API 스펙에 따라 추가
  };
}
