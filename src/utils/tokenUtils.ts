// 토큰 유효기간 관련 유틸리티

/**
 * 토큰 유효기간 문자열을 사람이 읽기 쉬운 형식으로 변환
 * @param duration - "1H", "24H", "5M", "30S" 형식의 문자열
 * @returns "1시간", "24시간", "5분", "30초" 형식의 문자열
 */
export function formatTokenDuration(duration?: string | null): string {
  if (!duration) {
    return '-';
  }

  const match = duration.match(/^(\d+)([SMHD])$/);
  if (!match) {
    return duration; // 파싱 실패 시 원본 반환
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  const unitMap: Record<string, string> = {
    S: '초',
    M: '분',
    H: '시간',
    D: '일',
  };

  return `${numValue}${unitMap[unit] || unit}`;
}

/**
 * 사람이 읽기 쉬운 형식을 토큰 유효기간 문자열로 변환
 * @param hours - 시간 단위 숫자
 * @returns "1H", "24H" 형식의 문자열
 */
export function toHoursDuration(hours: number): string {
  return `${hours}H`;
}

/**
 * 사람이 읽기 쉬운 형식을 토큰 유효기간 문자열로 변환
 * @param minutes - 분 단위 숫자
 * @returns "5M", "10M" 형식의 문자열
 */
export function toMinutesDuration(minutes: number): string {
  return `${minutes}M`;
}

/**
 * 토큰 유효기간 문자열을 초 단위로 변환
 * @param duration - "1H", "24H", "5M" 형식의 문자열
 * @returns 초 단위 숫자
 */
export function durationToSeconds(duration?: string | null): number | undefined {
  if (!duration) {
    return undefined;
  }

  const match = duration.match(/^(\d+)([SMHD])$/);
  if (!match) {
    return undefined;
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  const multipliers: Record<string, number> = {
    S: 1,
    M: 60,
    H: 3600,
    D: 86400,
  };

  return numValue * (multipliers[unit] || 1);
}

/**
 * 초 단위를 토큰 유효기간 문자열로 변환
 * @param seconds - 초 단위 숫자
 * @returns "1H", "24H", "5M" 형식의 문자열
 */
export function secondsToDuration(seconds?: number | null): string | undefined {
  if (seconds == null) {
    return undefined;
  }

  // 일 단위
  if (seconds % 86400 === 0) {
    return `${seconds / 86400}D`;
  }

  // 시간 단위
  if (seconds % 3600 === 0) {
    return `${seconds / 3600}H`;
  }

  // 분 단위
  if (seconds % 60 === 0) {
    return `${seconds / 60}M`;
  }

  // 초 단위
  return `${seconds}S`;
}
