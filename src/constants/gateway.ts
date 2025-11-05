// Gateway 관련 상수 정의

// 모달 크기
export const MODAL_WIDTHS = {
  SMALL: 500,
  MEDIUM: 600,
  LARGE: 900,
  EXTRA_LARGE: 1000,
} as const;

// 색상 테마
export const THEME_COLORS = {
  SUCCESS: '#3f8600',
  WARNING: '#faad14',
  ERROR: '#cf1322',
  INFO: '#1890ff',
  TEXT_SECONDARY: '#999',
  TEXT_TERTIARY: '#666',
} as const;

// 시간 관련 상수
export const DELAYS = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 1500,
} as const;

// 라우트 기본 우선순위
export const DEFAULT_ROUTE_ORDER = {
  USER_SERVICE: 100,
  AUTH_SERVICE: 101,
  API_SERVICE: 200,
  NOTIFICATION_SERVICE: 300,
  ADMIN_SERVICE: 301,
  GATEWAY_SERVICE: 400,
} as const;

// 입력 제한값
export const INPUT_LIMITS = {
  ORDER: { min: 0, max: 999 },
  REQUEST_SIZE: { min: 1, max: 1024 * 1024 }, // 1MB
  RETRY_COUNT: { min: 1, max: 10 },
} as const;

// 스크롤 높이
export const SCROLL_HEIGHTS = {
  SHORT: '200px',
  MEDIUM: '400px',
  TALL: '500px',
} as const;