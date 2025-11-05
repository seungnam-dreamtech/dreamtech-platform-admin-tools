// 인증 관련 유틸리티 함수

/**
 * sessionStorage 또는 localStorage에서 OIDC 사용자 토큰을 가져옵니다
 * UserManager가 저장한 토큰 정보를 읽어옵니다
 */
export function getAccessTokenFromStorage(): string | null {
  try {
    const keys = Object.keys(localStorage);

    console.log('🔍 Searching for token in localStorage...');
    console.log('Available OIDC keys:', keys.filter(k => k.startsWith('oidc.')));

    // OIDC UserManager가 저장한 키를 찾습니다
    // 형식: "oidc.user:{authority}:{client_id}"
    // 더 유연하게 검색: oidc.user로 시작하는 모든 키를 찾음
    const userKeys = keys.filter(key => key.startsWith('oidc.user:'));

    console.log('Found OIDC user keys:', userKeys);

    if (userKeys.length === 0) {
      console.warn('⚠️ No OIDC user keys found in localStorage');
      console.log('💡 Tip: Make sure you are logged in. Check AuthContext.');
      return null;
    }

    // 가장 최근 키를 사용 (여러 개가 있을 수 있음)
    const userKey = userKeys[0];
    console.log('Using user key:', userKey);

    const userData = localStorage.getItem(userKey);
    if (userData) {
      const user = JSON.parse(userData);

      console.log('🔐 Token info:', {
        hasToken: !!user.access_token,
        tokenPreview: user.access_token ? `${user.access_token.substring(0, 20)}...` : 'none',
        expired: user.expired,
        expiresAt: user.expires_at ? new Date(user.expires_at * 1000).toISOString() : 'unknown',
        profile: {
          email: user.profile?.email,
          name: user.profile?.name,
        }
      });

      // 토큰이 있고 만료되지 않았는지 확인
      if (user.access_token && !user.expired) {
        console.log('✅ Valid token found!');
        return user.access_token;
      } else {
        console.warn('⚠️ Token is expired or missing');
        console.log('Token expired:', user.expired);
        console.log('Expires at:', user.expires_at ? new Date(user.expires_at * 1000).toISOString() : 'unknown');
      }
    }

    console.warn('⚠️ No valid access token found in localStorage');
    return null;
  } catch (error) {
    console.error('❌ Failed to get access token from storage:', error);
    return null;
  }
}

/**
 * API 요청에 필요한 인증 헤더를 생성합니다
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // sessionStorage와 localStorage에서 토큰 찾기
  try {
    // 1. sessionStorage 체크
    const sessionKeys = Object.keys(sessionStorage);
    const sessionUserKey = sessionKeys.find(key => key.startsWith('oidc.user:'));

    if (sessionUserKey) {
      const userData = sessionStorage.getItem(sessionUserKey);
      if (userData) {
        const user = JSON.parse(userData);
        if (user.access_token && !user.expired) {
          console.log('✅ Using token from sessionStorage');
          headers['Authorization'] = `Bearer ${user.access_token}`;
          return headers;
        }
      }
    }

    // 2. localStorage 체크
    const localKeys = Object.keys(localStorage);
    const localUserKey = localKeys.find(key => key.startsWith('oidc.user:'));

    if (localUserKey) {
      const userData = localStorage.getItem(localUserKey);
      if (userData) {
        const user = JSON.parse(userData);
        if (user.access_token && !user.expired) {
          console.log('✅ Using token from localStorage');
          headers['Authorization'] = `Bearer ${user.access_token}`;
          return headers;
        }
      }
    }

    console.warn('⚠️ No valid token found in sessionStorage or localStorage');
  } catch (error) {
    console.error('❌ Failed to get token:', error);
  }

  return headers;
}

/**
 * 토큰이 만료되었는지 확인합니다
 */
export function isTokenExpired(): boolean {
  try {
    const keys = Object.keys(localStorage);
    const userKey = keys.find(key =>
      key.startsWith('oidc.user:') && key.includes('platform-admin-client')
    );

    if (userKey) {
      const userData = localStorage.getItem(userKey);
      if (userData) {
        const user = JSON.parse(userData);
        return user.expired === true;
      }
    }

    return true; // 사용자 정보가 없으면 만료된 것으로 간주
  } catch (error) {
    console.error('Failed to check token expiration:', error);
    return true;
  }
}

/**
 * 토큰 정보를 콘솔에 디버깅합니다
 */
export function debugTokenInfo(): void {
  try {
    const keys = Object.keys(localStorage);
    const userKey = keys.find(key =>
      key.startsWith('oidc.user:') && key.includes('platform-admin-client')
    );

    if (userKey) {
      const userData = localStorage.getItem(userKey);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔐 Token Debug Info:', {
          hasToken: !!user.access_token,
          tokenLength: user.access_token?.length,
          expired: user.expired,
          expiresAt: user.expires_at,
          profile: user.profile,
          scopes: user.scope,
        });
      }
    } else {
      console.log('🔐 Token Debug Info: No user key found in localStorage');
    }
  } catch (error) {
    console.error('Failed to debug token info:', error);
  }
}

/**
 * 애플리케이션 초기화 시 만료된 토큰을 정리합니다
 * sessionStorage와 localStorage에서 모든 OIDC 토큰을 검사하고 만료된 것을 삭제합니다
 */
export function cleanupExpiredTokens(): void {
  console.log('🧹 Starting token cleanup...');

  let removedCount = 0;
  let validCount = 0;

  try {
    // 1. sessionStorage 정리
    const sessionKeys = Object.keys(sessionStorage);
    const sessionUserKeys = sessionKeys.filter(key => key.startsWith('oidc.user:'));

    console.log(`📦 Found ${sessionUserKeys.length} OIDC keys in sessionStorage`);

    sessionUserKeys.forEach(key => {
      try {
        const userData = sessionStorage.getItem(key);
        if (userData) {
          const user = JSON.parse(userData);

          // 토큰이 만료되었는지 확인
          const isExpired = user.expired === true ||
            (user.expires_at && user.expires_at * 1000 < Date.now());

          if (isExpired) {
            console.log(`🗑️ Removing expired token from sessionStorage: ${key}`);
            console.log(`   - Expired: ${user.expired}`);
            console.log(`   - Expires at: ${user.expires_at ? new Date(user.expires_at * 1000).toISOString() : 'unknown'}`);
            sessionStorage.removeItem(key);
            removedCount++;
          } else {
            console.log(`✅ Valid token found in sessionStorage: ${key}`);
            validCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing sessionStorage key ${key}:`, error);
        // 파싱 실패한 키는 삭제
        sessionStorage.removeItem(key);
        removedCount++;
      }
    });

    // 2. localStorage 정리
    const localKeys = Object.keys(localStorage);
    const localUserKeys = localKeys.filter(key => key.startsWith('oidc.user:'));

    console.log(`📦 Found ${localUserKeys.length} OIDC keys in localStorage`);

    localUserKeys.forEach(key => {
      try {
        const userData = localStorage.getItem(key);
        if (userData) {
          const user = JSON.parse(userData);

          // 토큰이 만료되었는지 확인
          const isExpired = user.expired === true ||
            (user.expires_at && user.expires_at * 1000 < Date.now());

          if (isExpired) {
            console.log(`🗑️ Removing expired token from localStorage: ${key}`);
            console.log(`   - Expired: ${user.expired}`);
            console.log(`   - Expires at: ${user.expires_at ? new Date(user.expires_at * 1000).toISOString() : 'unknown'}`);
            localStorage.removeItem(key);
            removedCount++;
          } else {
            console.log(`✅ Valid token found in localStorage: ${key}`);
            validCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing localStorage key ${key}:`, error);
        // 파싱 실패한 키는 삭제
        localStorage.removeItem(key);
        removedCount++;
      }
    });

    console.log(`🧹 Token cleanup completed:`);
    console.log(`   - Valid tokens: ${validCount}`);
    console.log(`   - Removed expired tokens: ${removedCount}`);

  } catch (error) {
    console.error('❌ Failed to cleanup expired tokens:', error);
  }
}