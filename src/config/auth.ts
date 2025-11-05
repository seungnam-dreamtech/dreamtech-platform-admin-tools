// OpenID/OAuth2 인증 설정 (oidc-client-ts 기반)

// 환경변수에서 설정 읽기
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
};

// 안전한 origin 가져오기
const getOrigin = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173'; // 개발 환경 기본값
};

// OIDC UserManager 설정
export const oidcConfig = {
  authority: getEnvVar('VITE_AUTH_AUTHORITY', 'https://api.cadiacinsight.com'),
  client_id: getEnvVar('VITE_AUTH_CLIENT_ID', 'platform-admin-client'),
  redirect_uri: getEnvVar('VITE_AUTH_REDIRECT_URI', `${getOrigin()}/auth/callback`),
  silent_redirect_uri: getEnvVar('VITE_AUTH_SILENT_REDIRECT_URI', `${getOrigin()}/auth/silent-callback`),
  post_logout_redirect_uri: getEnvVar('VITE_AUTH_POST_LOGOUT_REDIRECT_URI', getOrigin()),
  response_type: getEnvVar('VITE_AUTH_RESPONSE_TYPE', 'code'),
  scope: getEnvVar('VITE_AUTH_SCOPE', 'openid profile email address phone'),

  // OIDC 추가 설정
  automaticSilentRenew: true,
  includeIdTokenInSilentRenew: true,
  loadUserInfo: false,

  // PKCE 활성화
  response_mode: 'query' as const,

  // 메타데이터 설정
  metadataUrl: `${getEnvVar('VITE_AUTH_AUTHORITY')}/.well-known/openid-configuration`,

  // 토큰 설정
  accessTokenExpiringNotificationTime: 60, // 1분 전 알림
  silentRequestTimeout: 10000, // 10초

  // UI 설정
  popup: false, // redirect 방식 사용
  popupWindowFeatures: {
    location: false,
    toolbar: false,
    width: 500,
    height: 600,
    left: 100,
    top: 100
  }
};

// Application Token 설정 (Client Credentials)
export const appTokenConfig = {
  clientId: getEnvVar('VITE_APP_CLIENT_ID', 'ecg-assist-lite-application'),
  clientSecret: getEnvVar('VITE_APP_CLIENT_SECRET', 'qwer1234!'),
  scope: getEnvVar('VITE_APP_SCOPE', 'user:registration'),
  authority: getEnvVar('VITE_AUTH_AUTHORITY', 'https://api.cadiacinsight.com'),
  tokenEndpoint: `${getEnvVar('VITE_AUTH_AUTHORITY')}/v1/token`,
};

