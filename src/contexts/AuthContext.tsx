// OIDC 기반 인증 컨텍스트
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { User, UserManager } from 'oidc-client-ts';
import type { AuthContextType, AuthState } from '../types/auth';
import { oidcConfig } from '../config/auth';
import { cleanupExpiredTokens } from '../utils/authUtils';

// AuthContext 생성
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Props
interface AuthProviderProps {
  children: ReactNode;
}

// 전역 UserManager 싱글톤
let globalUserManager: UserManager | null = null;

const getOrCreateUserManager = (): UserManager => {
  if (!globalUserManager) {
    console.log('🔧 Creating UserManager singleton instance');
    globalUserManager = new UserManager(oidcConfig);
  }
  return globalUserManager;
};

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // UserManager 인스턴스 (싱글톤)
  const [userManager] = useState(() => {
    try {
      return getOrCreateUserManager();
    } catch (error) {
      console.error('Failed to initialize UserManager:', error);
      throw error;
    }
  });

  // 인증 상태
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  // 사용자 정보 업데이트 함수
  const updateUser = useCallback((user: User | null) => {
    const isAuthenticated = !!user && !user.expired;
    console.log('🔐 AuthContext: updateUser called', {
      hasUser: !!user,
      isExpired: user?.expired,
      isAuthenticated,
      userProfile: user?.profile
    });

    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated,
      isLoading: false,
      error: null,
    }));
  }, []);

  // 에러 처리 함수
  const handleError = useCallback((error: Error) => {
    console.error('Auth error:', error);
    setAuthState(prev => ({
      ...prev,
      error: error.message,
      isLoading: false,
    }));
  }, []);

  // 로그인 함수
  const login = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await userManager.signinRedirect();
    } catch (error) {
      handleError(error as Error);
    }
  }, [userManager, handleError]);

  // 로그아웃 함수
  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await userManager.signoutRedirect();
    } catch (error) {
      handleError(error as Error);
      // 에러가 발생해도 로컬 상태는 초기화
      updateUser(null);
    }
  }, [userManager, handleError, updateUser]);

  // 무음 로그인 (토큰 갱신)
  const signinSilent = useCallback(async (): Promise<User | null> => {
    try {
      const user = await userManager.signinSilent();
      updateUser(user);
      return user;
    } catch (error) {
      console.warn('Silent signin failed:', error);
      return null;
    }
  }, [userManager, updateUser]);

  // 역할 확인 함수
  const hasRole = useCallback((role: string): boolean => {
    if (!authState.user) return false;
    const userRoles = authState.user.profile.roles as string[] || [];
    return userRoles.includes(role);
  }, [authState.user]);

  // 권한 확인 함수
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    const userPermissions = authState.user.profile.permissions as string[] || [];
    return userPermissions.includes(permission);
  }, [authState.user]);

  // Access Token 가져오기
  const getAccessToken = useCallback((): string | null => {
    return authState.user?.access_token || null;
  }, [authState.user]);

  // 사용자 수동 로드 (콜백에서 사용)
  const reloadUser = useCallback(async (): Promise<void> => {
    try {
      const user = await userManager.getUser();
      updateUser(user);
    } catch (error) {
      console.error('Failed to reload user:', error);
    }
  }, [userManager, updateUser]);

  // 콜백 처리 (AuthContext의 UserManager 인스턴스 사용)
  const handleAuthCallback = useCallback(async (): Promise<User | null> => {
    try {
      console.log('🔄 AuthContext: Processing auth callback with existing UserManager...');
      const user = await userManager.signinRedirectCallback();
      updateUser(user);
      return user;
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  }, [userManager, updateUser]);

  // 무음 콜백 처리 (AuthContext의 UserManager 인스턴스 사용)
  const handleSilentCallback = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 AuthContext: Processing silent callback with existing UserManager...');
      await userManager.signinSilentCallback();
    } catch (error) {
      console.error('Silent callback error:', error);
    }
  }, [userManager]);

  // UserManager 이벤트 리스너 설정
  useEffect(() => {
    // 토큰 만료 시 처리
    const handleAccessTokenExpiring = () => {
      console.log('Access token expiring, attempting silent renewal...');
      void signinSilent();
    };

    // 토큰 만료됨
    const handleAccessTokenExpired = () => {
      console.log('Access token expired');
      updateUser(null);
    };

    // 사용자 로딩됨
    const handleUserLoaded = (user: User) => {
      console.log('User loaded:', user.profile);
      updateUser(user);
    };

    // 사용자 언로딩됨
    const handleUserUnloaded = () => {
      console.log('User unloaded');
      updateUser(null);
    };

    // 무음 갱신 에러
    const handleSilentRenewError = (error: Error) => {
      console.warn('Silent renew error:', error);
    };

    // 사용자 세션 변경
    const handleUserSessionChanged = () => {
      console.log('User session changed');
      userManager.getUser().then(updateUser);
    };

    // 이벤트 리스너 등록
    userManager.events.addAccessTokenExpiring(handleAccessTokenExpiring);
    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);
    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addSilentRenewError(handleSilentRenewError);
    userManager.events.addUserSessionChanged(handleUserSessionChanged);

    // 초기 사용자 로드 - 멱등성 보장
    let loadUserCancelled = false;

    const loadUser = async () => {
      try {
        // 애플리케이션 시작 시 만료된 토큰 정리
        // 직접 URL 입력, 북마크, 새로고침 등으로 접근할 때도 정리됨
        cleanupExpiredTokens();

        const user = await userManager.getUser();

        // 컴포넌트가 언마운트되지 않았을 때만 상태 업데이트
        if (!loadUserCancelled) {
          updateUser(user);
        }
      } catch (error) {
        if (!loadUserCancelled) {
          console.error('Failed to load user:', error);
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    void loadUser();

    // cleanup
    return () => {
      loadUserCancelled = true;
      userManager.events.removeAccessTokenExpiring(handleAccessTokenExpiring);
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
      userManager.events.removeUserSessionChanged(handleUserSessionChanged);
    };
  }, [userManager, signinSilent, updateUser]);

  // Context value
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    signinSilent,
    hasRole,
    hasPermission,
    getAccessToken,
    reloadUser,
    handleAuthCallback,
    handleSilentCallback,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};



