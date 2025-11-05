// Gateway routes 엔드포인트에서 반환하는 문자열 형식의 predicates와 filters를 파싱

export interface ParsedPredicate {
  type: string;
  description: string;
  args: Record<string, any>; // 사용자 설정 파라미터
  metadata?: Record<string, any>; // Spring 내부 메타데이터 (참고용)
  raw: string;
}

export interface ParsedFilter {
  name: string;
  description: string;
  order?: number;
  args: Record<string, any>; // 사용자 설정 파라미터
  metadata?: Record<string, any>; // Spring 내부 메타데이터 (참고용)
  raw: string;
}

/**
 * Predicate 문자열을 파싱합니다
 * 예: "(Paths: [/docs/ecg], match trailing slash: true && Methods: [GET])"
 */
export const parsePredicateString = (predicateStr: string): ParsedPredicate[] => {
  const predicates: ParsedPredicate[] = [];

  if (!predicateStr || typeof predicateStr !== 'string') {
    return predicates;
  }

  // 괄호 제거
  let cleaned = predicateStr.trim();
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = cleaned.slice(1, -1);
  }

  // && 로 분리 (여러 predicate가 있을 수 있음)
  const parts = cleaned.split('&&').map(p => p.trim());

  for (const part of parts) {
    const parsed = parsePredicatePart(part);
    if (parsed) {
      predicates.push(parsed);
    }
  }

  return predicates;
};

/**
 * 개별 Predicate 파트를 상세하게 파싱
 */
function parsePredicatePart(part: string): ParsedPredicate | null {
  // Path Predicate: "Paths: [/docs/ecg], match trailing slash: true"
  if (part.includes('Paths:')) {
    const args: Record<string, any> = {};
    const metadata: Record<string, any> = {};

    const pathMatch = part.match(/Paths:\s*\[([^\]]+)\]/);
    if (pathMatch) {
      args.patterns = pathMatch[1].split(',').map(p => p.trim());
    }

    // matchTrailingSlash는 Spring 내부 메타데이터 (사용자 설정값 아님)
    const trailingSlashMatch = part.match(/match trailing slash:\s*(true|false)/i);
    if (trailingSlashMatch) {
      metadata.matchTrailingSlash = trailingSlashMatch[1].toLowerCase() === 'true';
    }

    return {
      type: 'Path',
      description: `경로 패턴 매칭 (${args.patterns?.length || 0}개)`,
      args,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      raw: part
    };
  }

  // Method Predicate: "Methods: [GET]"
  if (part.includes('Methods:')) {
    const args: Record<string, any> = {};

    const methodMatch = part.match(/Methods:\s*\[([^\]]+)\]/);
    if (methodMatch) {
      args.methods = methodMatch[1].split(',').map(m => m.trim());
    }

    return {
      type: 'Method',
      description: `HTTP 메서드 매칭 (${args.methods?.length || 0}개)`,
      args,
      raw: part
    };
  }

  // Host Predicate: "Hosts: [**.example.com]"
  if (part.includes('Hosts:') || part.includes('Host:')) {
    const args: Record<string, any> = {};

    const hostMatch = part.match(/Hosts?:\s*\[([^\]]+)\]|Hosts?:\s*([^\s,]+)/);
    if (hostMatch) {
      const hostStr = hostMatch[1] || hostMatch[2];
      args.patterns = hostStr.split(',').map(h => h.trim());
    }

    return {
      type: 'Host',
      description: `호스트 패턴 매칭`,
      args,
      raw: part
    };
  }

  // Header Predicate: "Header: X-Request-Id regexp [0-9]+"
  if (part.includes('Header:')) {
    const args: Record<string, any> = {};

    const headerMatch = part.match(/Header:\s*([^\s]+)\s+(.+)/);
    if (headerMatch) {
      args.header = headerMatch[1];
      const valueStr = headerMatch[2].trim();

      if (valueStr.startsWith('regexp ')) {
        args.regexp = valueStr.replace('regexp ', '').trim();
      } else {
        args.value = valueStr;
      }
    }

    return {
      type: 'Header',
      description: `헤더 매칭`,
      args,
      raw: part
    };
  }

  // Query Predicate: "Query: foo regexp ba."
  if (part.includes('Query:')) {
    const args: Record<string, any> = {};

    const queryMatch = part.match(/Query:\s*([^\s]+)(?:\s+(.+))?/);
    if (queryMatch) {
      args.param = queryMatch[1];

      if (queryMatch[2]) {
        const valueStr = queryMatch[2].trim();
        if (valueStr.startsWith('regexp ')) {
          args.regexp = valueStr.replace('regexp ', '').trim();
        } else {
          args.value = valueStr;
        }
      }
    }

    return {
      type: 'Query',
      description: `쿼리 파라미터 매칭`,
      args,
      raw: part
    };
  }

  // Cookie Predicate: "Cookie: mycookie mycookievalue"
  if (part.includes('Cookie:')) {
    const args: Record<string, any> = {};

    const cookieMatch = part.match(/Cookie:\s*([^\s]+)(?:\s+(.+))?/);
    if (cookieMatch) {
      args.name = cookieMatch[1];
      if (cookieMatch[2]) {
        args.regexp = cookieMatch[2].trim();
      }
    }

    return {
      type: 'Cookie',
      description: `쿠키 매칭`,
      args,
      raw: part
    };
  }

  // RemoteAddr Predicate: "RemoteAddr: 192.168.1.1/24"
  if (part.includes('RemoteAddr:')) {
    const args: Record<string, any> = {};

    const addrMatch = part.match(/RemoteAddr:\s*([^\s,]+)/);
    if (addrMatch) {
      args.sources = addrMatch[1].split(',').map(a => a.trim());
    }

    return {
      type: 'RemoteAddr',
      description: `원격 주소 매칭`,
      args,
      raw: part
    };
  }

  // Weight Predicate: "Weight: group1 8"
  if (part.includes('Weight:')) {
    const args: Record<string, any> = {};

    const weightMatch = part.match(/Weight:\s*([^\s]+)\s+(\d+)/);
    if (weightMatch) {
      args.group = weightMatch[1];
      args.weight = parseInt(weightMatch[2], 10);
    }

    return {
      type: 'Weight',
      description: `가중치 기반 라우팅`,
      args,
      raw: part
    };
  }

  // Between Predicate: "Between: 2023-01-01T00:00:00Z 2023-12-31T23:59:59Z"
  if (part.includes('Between:')) {
    const args: Record<string, any> = {};

    const betweenMatch = part.match(/Between:\s*([^\s]+)\s+([^\s]+)/);
    if (betweenMatch) {
      args.datetime1 = betweenMatch[1];
      args.datetime2 = betweenMatch[2];
    }

    return {
      type: 'Between',
      description: `시간 범위 매칭`,
      args,
      raw: part
    };
  }

  // After/Before Predicate
  if (part.includes('After:') || part.includes('Before:')) {
    const type = part.includes('After:') ? 'After' : 'Before';
    const args: Record<string, any> = {};

    const timeMatch = part.match(/(After|Before):\s*(.+)/);
    if (timeMatch) {
      args.datetime = timeMatch[2].trim();
    }

    return {
      type,
      description: type === 'After' ? `특정 시간 이후` : `특정 시간 이전`,
      args,
      raw: part
    };
  }

  // 기타 predicate (알 수 없는 형식)
  if (part.includes(':')) {
    const colonIndex = part.indexOf(':');
    const type = part.substring(0, colonIndex).trim();
    const value = part.substring(colonIndex + 1).trim();

    return {
      type,
      description: `커스텀 조건`,
      args: { value },
      raw: part
    };
  }

  return null;
}

/**
 * Filter 문자열을 파싱합니다
 * 예: "[[DedupeResponseHeader Vary Access-Control-Allow-Credentials = RETAIN_LAST], order = 1]"
 */
export const parseFilterString = (filterStr: string): ParsedFilter | null => {
  if (!filterStr || typeof filterStr !== 'string') {
    return null;
  }

  let cleaned = filterStr.trim();

  // order 추출
  let order: number | undefined;
  const orderMatch = cleaned.match(/,\s*order\s*=\s*(\d+)\]/);
  if (orderMatch) {
    order = parseInt(orderMatch[1], 10);
    // order 부분 제거
    cleaned = cleaned.replace(orderMatch[0], ']');
  }

  // 대괄호 제거
  while (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // 필터 이름과 인자 분리
  const firstSpaceIndex = cleaned.indexOf(' ');
  if (firstSpaceIndex === -1) {
    // 인자가 없는 필터
    return {
      name: cleaned,
      description: cleaned,
      order,
      args: {},
      raw: filterStr
    };
  }

  const filterName = cleaned.substring(0, firstSpaceIndex);
  const filterArgs = cleaned.substring(firstSpaceIndex + 1).trim();

  return parseFilterByType(filterName, filterArgs, order, filterStr);
};

/**
 * Filter 타입별로 상세 파싱
 */
function parseFilterByType(
  filterName: string,
  filterArgs: string,
  order: number | undefined,
  raw: string
): ParsedFilter {
  const args: Record<string, any> = {};
  let description = '';

  switch (filterName) {
    // DedupeResponseHeader: "Vary Access-Control-Allow-Credentials = RETAIN_LAST"
    case 'DedupeResponseHeader':
      const dedupeMatch = filterArgs.match(/(.+?)\s*=\s*(.+)/);
      if (dedupeMatch) {
        const headers = dedupeMatch[1].trim().split(/\s+/);
        args.headers = headers;
        args.strategy = dedupeMatch[2].trim();
        description = `응답 헤더 중복 제거 (${headers.length}개)`;
      }
      break;

    // AddRequestHeader / AddResponseHeader: "X-Request-Foo Bar"
    case 'AddRequestHeader':
    case 'AddResponseHeader':
      const addMatch = filterArgs.match(/([^\s]+)\s+(.+)/);
      if (addMatch) {
        args.name = addMatch[1];
        args.value = addMatch[2];
        description = filterName === 'AddRequestHeader' ? '요청 헤더 추가' : '응답 헤더 추가';
      }
      break;

    // RemoveRequestHeader / RemoveResponseHeader: "X-Request-Foo"
    case 'RemoveRequestHeader':
    case 'RemoveResponseHeader':
      args.name = filterArgs;
      description = filterName === 'RemoveRequestHeader' ? '요청 헤더 제거' : '응답 헤더 제거';
      break;

    // RewritePath: "/foo/(?<segment>.*) /$\{segment}"
    case 'RewritePath':
      const rewriteMatch = filterArgs.match(/([^\s]+)\s+(.+)/);
      if (rewriteMatch) {
        args.regexp = rewriteMatch[1];
        args.replacement = rewriteMatch[2];
        description = '경로 재작성';
      }
      break;

    // StripPrefix: "2"
    case 'StripPrefix':
      args.parts = parseInt(filterArgs, 10);
      description = `경로 접두사 제거 (${args.parts}개 세그먼트)`;
      break;

    // PrefixPath: "/myprefix"
    case 'PrefixPath':
      args.prefix = filterArgs;
      description = '경로 접두사 추가';
      break;

    // SetPath: "/foo/{segment}"
    case 'SetPath':
      args.template = filterArgs;
      description = '경로 설정';
      break;

    // SetStatus: "401"
    case 'SetStatus':
      args.status = filterArgs;
      description = 'HTTP 상태 코드 설정';
      break;

    // SetRequestHeader / SetResponseHeader: "X-Request-Foo Bar"
    case 'SetRequestHeader':
    case 'SetResponseHeader':
      const setMatch = filterArgs.match(/([^\s]+)\s+(.+)/);
      if (setMatch) {
        args.name = setMatch[1];
        args.value = setMatch[2];
        description = filterName === 'SetRequestHeader' ? '요청 헤더 설정' : '응답 헤더 설정';
      }
      break;

    // RedirectTo: "302 https://example.com"
    case 'RedirectTo':
      const redirectMatch = filterArgs.match(/(\d+)\s+(.+)/);
      if (redirectMatch) {
        args.status = parseInt(redirectMatch[1], 10);
        args.url = redirectMatch[2];
        description = '리다이렉트';
      }
      break;

    // RequestRateLimiter: "replenishRate=10 burstCapacity=20"
    case 'RequestRateLimiter':
      const rateParts = filterArgs.split(/\s+/);
      for (const part of rateParts) {
        const [key, value] = part.split('=');
        if (key && value) {
          args[key] = value;
        }
      }
      description = '요청 속도 제한';
      break;

    // CircuitBreaker: "name=myCircuitBreaker fallbackUri=forward:/fallback"
    case 'CircuitBreaker':
      const cbParts = filterArgs.split(/\s+/);
      for (const part of cbParts) {
        const [key, value] = part.split('=');
        if (key && value) {
          args[key] = value;
        }
      }
      description = '서킷 브레이커';
      break;

    // Retry: "retries=3 statuses=BAD_GATEWAY methods=GET,POST"
    case 'Retry':
      const retryParts = filterArgs.split(/\s+/);
      for (const part of retryParts) {
        const [key, value] = part.split('=');
        if (key && value) {
          if (key === 'methods' || key === 'statuses' || key === 'series') {
            args[key] = value.split(',');
          } else {
            args[key] = value;
          }
        }
      }
      description = '재시도';
      break;

    // RequestSize: "5000000" (5MB)
    case 'RequestSize':
      args.maxSize = filterArgs;
      description = '요청 크기 제한';
      break;

    // PreserveHostHeader
    case 'PreserveHostHeader':
      description = '원본 Host 헤더 유지';
      break;

    // SecureHeaders
    case 'SecureHeaders':
      description = '보안 헤더 추가';
      break;

    // SaveSession
    case 'SaveSession':
      description = '세션 저장';
      break;

    // ModifyRequestBody / ModifyResponseBody
    case 'ModifyRequestBody':
    case 'ModifyResponseBody':
      args.config = filterArgs;
      description = filterName === 'ModifyRequestBody' ? '요청 본문 변환' : '응답 본문 변환';
      break;

    // Default: unknown filter
    default:
      args.rawArgs = filterArgs;
      description = `커스텀 필터: ${filterName}`;
  }

  return {
    name: filterName,
    description,
    order,
    args,
    raw
  };
}

/**
 * Filter 문자열 배열을 파싱합니다
 */
export const parseFilterStrings = (filterStrs: string[]): ParsedFilter[] => {
  if (!Array.isArray(filterStrs)) {
    return [];
  }

  return filterStrs
    .map(parseFilterString)
    .filter((f): f is ParsedFilter => f !== null);
};

/**
 * 글로벌 필터 객체를 파싱합니다
 * 입력: { "org.springframework.cloud.gateway.filter.AdaptCachedBodyGlobalFilter": -2147482648, ... }
 * 출력: ParsedFilter 배열
 */
export const parseGlobalFilters = (globalFilters: Record<string, number>): ParsedFilter[] => {
  if (!globalFilters || typeof globalFilters !== 'object') {
    return [];
  }

  return Object.entries(globalFilters).map(([className, order]) => {
    // 클래스명에서 필터 이름 추출
    // "org.springframework.cloud.gateway.filter.AdaptCachedBodyGlobalFilter" -> "AdaptCachedBodyGlobalFilter"
    const filterName = className.split('.').pop() || className;

    // "GlobalFilter" 접미사 제거
    const cleanName = filterName.replace(/GlobalFilter$/, '');

    // 필터 이름을 기반으로 설명 생성
    let description = '';
    const args: Record<string, any> = {};

    // Spring Cloud Gateway 기본 글로벌 필터 해석
    switch (cleanName) {
      case 'AdaptCachedBody':
        description = '캐시된 요청 본문 적응';
        break;
      case 'ForwardRouting':
        description = '포워드 라우팅 처리';
        break;
      case 'LoadBalancerClient':
        description = '로드 밸런서 클라이언트 통합';
        break;
      case 'NettyRouting':
        description = 'Netty 기반 라우팅';
        break;
      case 'NettyWriteResponse':
        description = 'Netty 응답 쓰기';
        break;
      case 'RouteToRequestUrl':
        description = '라우트를 요청 URL로 변환';
        break;
      case 'Websocket':
      case 'WebsocketRouting':
        description = 'WebSocket 라우팅';
        break;
      case 'GatewayMetrics':
        description = 'Gateway 메트릭 수집';
        break;
      case 'ForwardPath':
        description = '포워드 경로 처리';
        break;
      case 'ReactiveLoadBalancerClient':
        description = '반응형 로드 밸런서';
        break;
      case 'RemoveCachedBody':
        description = '캐시된 본문 제거';
        break;
      default:
        description = `커스텀 글로벌 필터: ${cleanName}`;
        args.className = className;
    }

    return {
      name: cleanName,
      description,
      order,
      args,
      raw: `${className} [order=${order}]`
    };
  }).sort((a, b) => (a.order || 0) - (b.order || 0)); // order 기준 정렬
};