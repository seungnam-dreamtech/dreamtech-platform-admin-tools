import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// API slice will be added later for backend integration
// 백엔드 통합을 위한 API slice는 나중에 추가될 예정

export const store = configureStore({
  reducer: {
    // Additional reducers will be added here as features are implemented
    // 기능 구현에 따라 추가 리듀서가 여기에 추가됩니다
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in actions for RTK Query
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for TypeScript support
// TypeScript 지원을 위한 타입이 지정된 훅
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;