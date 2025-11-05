// OIDC 무음 로그인 콜백 페이지

import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const SilentCallback: React.FC = () => {
  const { handleSilentCallback } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const processSilentCallback = async () => {
      try {
        await handleSilentCallback();

        if (!cancelled) {
          console.log('Silent callback processed successfully');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Silent callback error:', error);
        }
      }
    };

    processSilentCallback();

    return () => {
      cancelled = true;
    };
  }, [handleSilentCallback]);

  // 이 페이지는 iframe에서 로드되므로 UI가 필요하지 않음
  return null;
};

export default SilentCallback;