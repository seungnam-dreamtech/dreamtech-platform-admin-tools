// Mock 데이터 관련 유틸리티 함수

import { DELAYS } from '../constants/gateway';

/**
 * Mock 지연시간을 생성합니다.
 */
export const createMockDelay = (ms: number = DELAYS.MEDIUM): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 랜덤한 지연시간을 생성합니다.
 */
export const createRandomDelay = (min: number = DELAYS.SHORT, max: number = DELAYS.LONG): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return createMockDelay(delay);
};

/**
 * Mock 실행 시간을 생성합니다.
 */
export const generateMockExecutionTime = (): number => {
  return Math.floor(Math.random() * 100) + 50; // 50-150ms
};

/**
 * Mock 통계 데이터를 생성합니다.
 */
export const generateMockStats = () => ({
  totalRequests: Math.floor(Math.random() * 10000) + 1000,
  successfulRequests: Math.floor(Math.random() * 9000) + 900,
  averageResponseTime: Math.floor(Math.random() * 200) + 50,
  uptime: Math.random() * 0.1 + 0.9, // 90-100%
});