// Predicate 타입별 설정 메타데이터

export interface PredicateConfig {
  name: string;
  label: string;
  description: string;
  icon: string;
  category: 'basic' | 'header' | 'time' | 'advanced';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultArgs: Record<string, any>;
}

export const PREDICATE_CONFIGS: Record<string, PredicateConfig> = {
  Path: {
    name: 'Path',
    label: 'Path (경로 매칭)',
    description: '요청 경로 패턴을 매칭합니다',
    icon: '🔹',
    category: 'basic',
    defaultArgs: { patterns: [''] }
  },
  Method: {
    name: 'Method',
    label: 'Method (HTTP 메서드)',
    description: 'HTTP 메서드를 매칭합니다 (GET, POST 등)',
    icon: '🔹',
    category: 'basic',
    defaultArgs: { methods: [] }
  },
  Host: {
    name: 'Host',
    label: 'Host (호스트명)',
    description: '호스트명 패턴을 매칭합니다',
    icon: '🔹',
    category: 'basic',
    defaultArgs: { patterns: [''] }
  },
  Header: {
    name: 'Header',
    label: 'Header (헤더)',
    description: '요청 헤더 값을 매칭합니다',
    icon: '🔸',
    category: 'header',
    defaultArgs: { name: '', regexp: '' }
  },
  Query: {
    name: 'Query',
    label: 'Query (쿼리 파라미터)',
    description: '쿼리 파라미터 값을 매칭합니다',
    icon: '🔸',
    category: 'header',
    defaultArgs: { param: '', regexp: '' }
  },
  Cookie: {
    name: 'Cookie',
    label: 'Cookie (쿠키)',
    description: '쿠키 값을 매칭합니다',
    icon: '🔸',
    category: 'header',
    defaultArgs: { name: '', regexp: '' }
  },
  RemoteAddr: {
    name: 'RemoteAddr',
    label: 'RemoteAddr (원격 주소)',
    description: '클라이언트 IP 주소를 매칭합니다',
    icon: '🔸',
    category: 'advanced',
    defaultArgs: { sources: [''] }
  },
  Weight: {
    name: 'Weight',
    label: 'Weight (가중치)',
    description: '가중치 기반 로드밸런싱',
    icon: '⚖️',
    category: 'advanced',
    defaultArgs: { group: '', weight: '1' }
  },
  After: {
    name: 'After',
    label: 'After (이후 시간)',
    description: '지정된 시간 이후 요청만 매칭',
    icon: '⏰',
    category: 'time',
    defaultArgs: { datetime: '' }
  },
  Before: {
    name: 'Before',
    label: 'Before (이전 시간)',
    description: '지정된 시간 이전 요청만 매칭',
    icon: '⏰',
    category: 'time',
    defaultArgs: { datetime: '' }
  },
  Between: {
    name: 'Between',
    label: 'Between (시간 범위)',
    description: '지정된 시간 범위 내 요청만 매칭',
    icon: '⏰',
    category: 'time',
    defaultArgs: { datetime1: '', datetime2: '' }
  },
  ReadBodyPredicateFactory: {
    name: 'ReadBodyPredicateFactory',
    label: 'ReadBody (요청 본문)',
    description: '요청 본문 크기를 확인합니다',
    icon: '📄',
    category: 'advanced',
    defaultArgs: { size: '1024' }
  }
};

export const getPredicatesByCategory = (category?: string) => {
  if (!category) {
    return Object.values(PREDICATE_CONFIGS);
  }
  return Object.values(PREDICATE_CONFIGS).filter(p => p.category === category);
};

export const getPredicateConfig = (name: string): PredicateConfig | undefined => {
  return PREDICATE_CONFIGS[name];
};