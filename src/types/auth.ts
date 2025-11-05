// OpenID/OAuth2 인증 관련 타입 정의 (oidc-client-ts 기반)

import { User } from 'oidc-client-ts';

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer' | 'bearer';
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

export interface UserInfo {
  sub: string; // Subject (unique user identifier)
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  updated_at?: number;

  // Custom claims (확장 가능)
  roles?: string[];
  permissions?: string[];
  organization?: string;
  department?: string;
}

export interface JWTPayload {
  iss: string; // Issuer
  sub: string; // Subject
  aud: string | string[]; // Audience
  exp: number; // Expiration time
  nbf?: number; // Not before
  iat: number; // Issued at
  jti?: string; // JWT ID

  // OpenID Connect Standard Claims
  name?: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;

  // Custom claims
  roles?: string[];
  permissions?: string[];
  scope?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  signinSilent: () => Promise<User | null>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  getAccessToken: () => string | null;
  reloadUser: () => Promise<void>;
  handleAuthCallback: () => Promise<User | null>;
  handleSilentCallback: () => Promise<void>;
}

// OAuth 설정
export interface OAuthConfig {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string;
  responseType: string;
}

// Provider 설정
export interface AuthProvider {
  id: string;
  name: string;
  displayName: string;
  config: OAuthConfig;
  userInfoEndpoint?: string;
  logoutEndpoint?: string;
  iconUrl?: string;
}

// 인증 이벤트
export interface AuthEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'error';
  timestamp: number;
  data?: unknown;
  error?: string;
}