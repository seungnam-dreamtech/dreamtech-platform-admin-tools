// Filter 타입별 설정 메타데이터

export interface FilterConfig {
  name: string;
  label: string;
  description: string;
  icon: string;
  category: 'request' | 'response' | 'url' | 'control' | 'advanced';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultArgs: Record<string, any>;
}

export const FILTER_CONFIGS: Record<string, FilterConfig> = {
  AddRequestHeader: {
    name: 'AddRequestHeader',
    label: 'Add Request Header',
    description: '요청에 헤더를 추가합니다',
    icon: '🔸',
    category: 'request',
    defaultArgs: { name: '', value: '' }
  },
  AddRequestParameter: {
    name: 'AddRequestParameter',
    label: 'Add Request Parameter',
    description: '요청에 쿼리 파라미터를 추가합니다',
    icon: '🔸',
    category: 'request',
    defaultArgs: { name: '', value: '' }
  },
  AddResponseHeader: {
    name: 'AddResponseHeader',
    label: 'Add Response Header',
    description: '응답에 헤더를 추가합니다',
    icon: '🔸',
    category: 'response',
    defaultArgs: { name: '', value: '' }
  },
  RemoveRequestHeader: {
    name: 'RemoveRequestHeader',
    label: 'Remove Request Header',
    description: '요청에서 헤더를 제거합니다',
    icon: '🔸',
    category: 'request',
    defaultArgs: { name: '' }
  },
  RemoveResponseHeader: {
    name: 'RemoveResponseHeader',
    label: 'Remove Response Header',
    description: '응답에서 헤더를 제거합니다',
    icon: '🔸',
    category: 'response',
    defaultArgs: { name: '' }
  },
  RemoveRequestParameter: {
    name: 'RemoveRequestParameter',
    label: 'Remove Request Parameter',
    description: '요청에서 쿼리 파라미터를 제거합니다',
    icon: '🔸',
    category: 'request',
    defaultArgs: { name: '' }
  },
  RewritePath: {
    name: 'RewritePath',
    label: 'Rewrite Path',
    description: '경로를 정규식으로 재작성합니다',
    icon: '🔀',
    category: 'url',
    defaultArgs: { regexp: '', replacement: '' }
  },
  PrefixPath: {
    name: 'PrefixPath',
    label: 'Prefix Path',
    description: '경로 앞에 접두사를 추가합니다',
    icon: '🔀',
    category: 'url',
    defaultArgs: { prefix: '' }
  },
  StripPrefix: {
    name: 'StripPrefix',
    label: 'Strip Prefix',
    description: '경로에서 지정된 수만큼 앞 세그먼트를 제거합니다',
    icon: '🔀',
    category: 'url',
    defaultArgs: { parts: '1' }
  },
  SetPath: {
    name: 'SetPath',
    label: 'Set Path',
    description: '경로를 지정된 템플릿으로 설정합니다',
    icon: '🔀',
    category: 'url',
    defaultArgs: { template: '' }
  },
  RequestRateLimiter: {
    name: 'RequestRateLimiter',
    label: 'Request Rate Limiter',
    description: '요청 속도를 제한합니다',
    icon: '⏱️',
    category: 'control',
    defaultArgs: { 'replenish-rate': '10', 'burst-capacity': '20' }
  },
  CircuitBreaker: {
    name: 'CircuitBreaker',
    label: 'Circuit Breaker',
    description: '서킷 브레이커 패턴을 적용합니다',
    icon: '🔌',
    category: 'control',
    defaultArgs: { name: '', fallbackUri: '' }
  },
  Retry: {
    name: 'Retry',
    label: 'Retry',
    description: '실패 시 재시도합니다',
    icon: '🔁',
    category: 'control',
    defaultArgs: { retries: '3' }
  },
  RequestSize: {
    name: 'RequestSize',
    label: 'Request Size',
    description: '요청 크기를 제한합니다',
    icon: '📏',
    category: 'control',
    defaultArgs: { maxSize: '5MB' }
  },
  ModifyRequestBody: {
    name: 'ModifyRequestBody',
    label: 'Modify Request Body',
    description: '요청 본문을 수정합니다',
    icon: '📝',
    category: 'advanced',
    defaultArgs: { contentType: 'application/json', rewriteFunction: '' }
  },
  ModifyResponseBody: {
    name: 'ModifyResponseBody',
    label: 'Modify Response Body',
    description: '응답 본문을 수정합니다',
    icon: '📝',
    category: 'advanced',
    defaultArgs: { contentType: 'application/json', rewriteFunction: '' }
  }
};

export const getFiltersByCategory = (category?: string) => {
  if (!category) {
    return Object.values(FILTER_CONFIGS);
  }
  return Object.values(FILTER_CONFIGS).filter(f => f.category === category);
};

export const getFilterConfig = (name: string): FilterConfig | undefined => {
  return FILTER_CONFIGS[name];
};

export const FILTER_CATEGORIES = [
  { label: '전체', value: '' },
  { label: '요청 변환', value: 'request' },
  { label: '응답 변환', value: 'response' },
  { label: 'URL 변환', value: 'url' },
  { label: '제어 & 안정성', value: 'control' },
  { label: '고급', value: 'advanced' }
];