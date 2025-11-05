// 폼 관련 유틸리티 함수

/**
 * Accordion 키를 정규화합니다.
 */
export const normalizeAccordionKey = (key: string | string[]): string => {
  return Array.isArray(key) && key.length > 0 ? key[0] : key as string;
};

/**
 * 빈 배열이 아닌 키만 유지합니다.
 */
export const ensureAccordionKey = (key: string | string[], fallback: string = 'basic'): string => {
  const normalized = normalizeAccordionKey(key);
  return normalized || fallback;
};

/**
 * 폼 데이터에서 빈 값을 제거합니다.
 */
export const removeEmptyValues = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const result: Partial<T> = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          result[key as keyof T] = value as T[keyof T];
        }
      } else if (typeof value === 'object' && value !== null) {
        const cleaned = removeEmptyValues(value as Record<string, unknown>);
        if (Object.keys(cleaned).length > 0) {
          result[key as keyof T] = cleaned as T[keyof T];
        }
      } else {
        result[key as keyof T] = value as T[keyof T];
      }
    }
  });

  return result;
};

/**
 * 고유한 ID를 생성합니다.
 */
export const generateUniqueId = (prefix: string = 'route'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
