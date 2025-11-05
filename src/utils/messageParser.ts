// Gateway 필터 메시지 파싱 유틸리티
// 사용자 친화적인 필터 설명을 생성합니다

import type { ActuatorFilter, ActuatorPredicate } from '../types/gateway';

/**
 * Predicate 메시지를 사용자 친화적으로 파싱합니다
 */
export const parsePredicateMessage = (predicate: ActuatorPredicate): string => {
  const { name, args } = predicate;

  switch (name) {
    case 'Path': {
      const patterns = args.patterns || args.pattern;
      if (Array.isArray(patterns)) {
        return `경로: ${patterns.join(', ')}`;
      }
      return `경로: ${patterns}`;
    }

    case 'Method': {
      const methods = args.methods || args.method;
      if (Array.isArray(methods)) {
        return `HTTP 메서드: ${methods.join(', ')}`;
      }
      return `HTTP 메서드: ${methods}`;
    }

    case 'Host': {
      const hosts = args.patterns || args.pattern;
      if (Array.isArray(hosts)) {
        return `호스트: ${hosts.join(', ')}`;
      }
      return `호스트: ${hosts}`;
    }

    case 'Header': {
      const headerName = args.header || args.name;
      const headerValue = args.regexp || args.value;
      if (headerValue) {
        return `헤더: ${headerName} = ${headerValue}`;
      }
      return `헤더: ${headerName}`;
    }

    case 'Query': {
      const queryName = args.param || args.name;
      const queryValue = args.regexp || args.value;
      if (queryValue) {
        return `쿼리 파라미터: ${queryName} = ${queryValue}`;
      }
      return `쿼리 파라미터: ${queryName}`;
    }

    case 'Cookie': {
      const cookieName = args.name;
      const cookieValue = args.regexp || args.value;
      if (cookieValue) {
        return `쿠키: ${cookieName} = ${cookieValue}`;
      }
      return `쿠키: ${cookieName}`;
    }

    case 'RemoteAddr': {
      const sources = args.sources || args.source;
      if (Array.isArray(sources)) {
        return `원격 주소: ${sources.join(', ')}`;
      }
      return `원격 주소: ${sources}`;
    }

    case 'Weight':
      return `가중치: 그룹 ${args.group}, 비중 ${args.weight}`;

    case 'After':
      return `이후 시간: ${new Date(args.datetime as string).toLocaleString('ko-KR')}`;

    case 'Before':
      return `이전 시간: ${new Date(args.datetime as string).toLocaleString('ko-KR')}`;

    case 'Between':
      return `시간 범위: ${new Date(args.datetime1 as string).toLocaleString('ko-KR')} ~ ${new Date(args.datetime2 as string).toLocaleString('ko-KR')}`;

    case 'CloudFoundryRouteService':
      return 'Cloud Foundry 라우트 서비스';

    case 'ReadBodyPredicateFactory':
      return `요청 본문 크기: ${args.size} 바이트`;

    default:
      return `${name}: ${JSON.stringify(args)}`;
  }
};

/**
 * Filter 메시지를 사용자 친화적으로 파싱합니다
 */
export const parseFilterMessage = (filter: ActuatorFilter): string => {
  const { name, args } = filter;

  switch (name) {
    case 'AddRequestHeader':
      return `요청 헤더 추가: ${args.name} = ${args.value}`;

    case 'AddRequestParameter':
      return `요청 파라미터 추가: ${args.name} = ${args.value}`;

    case 'AddResponseHeader':
      return `응답 헤더 추가: ${args.name} = ${args.value}`;

    case 'RemoveRequestHeader':
      return `요청 헤더 제거: ${args.name}`;

    case 'RemoveResponseHeader':
      return `응답 헤더 제거: ${args.name}`;

    case 'RemoveRequestParameter':
      return `요청 파라미터 제거: ${args.name}`;

    case 'RewritePath':
      return `경로 재작성: ${args.regexp} → ${args.replacement}`;

    case 'PrefixPath':
      return `경로 접두사 추가: ${args.prefix}`;

    case 'StripPrefix': {
      const parts = parseInt(args.parts as string, 10);
      return `경로 접두사 제거: ${parts}개 세그먼트`;
    }

    case 'SetPath':
      return `경로 설정: ${args.template}`;

    case 'RequestRateLimiter': {
      const replenishRate = args['replenish-rate'];
      const burstCapacity = args['burst-capacity'];
      const keyResolver = args['key-resolver'];
      let message = `요청 제한: ${replenishRate}req/s, 버스트 ${burstCapacity}`;
      if (keyResolver) {
        message += `, 키 리졸버: ${keyResolver}`;
      }
      return message;
    }

    case 'CircuitBreaker': {
      let cbMessage = `서킷 브레이커: ${args.name}`;
      if (args.fallbackUri) {
        cbMessage += `, 폴백: ${args.fallbackUri}`;
      }
      return cbMessage;
    }

    case 'Retry': {
      let retryMessage = `재시도: ${args.retries}회`;
      if (args.statuses) {
        retryMessage += `, 상태코드: ${args.statuses}`;
      }
      if (args.methods) {
        retryMessage += `, 메서드: ${args.methods}`;
      }
      if (args.backoff && typeof args.backoff === 'object') {
        const backoff = args.backoff as { firstBackoff?: string; maxBackoff?: string };
        if (backoff.firstBackoff && backoff.maxBackoff) {
          retryMessage += `, 백오프: ${backoff.firstBackoff}~${backoff.maxBackoff}`;
        }
      }
      return retryMessage;
    }

    case 'RequestSize':
      return `요청 크기 제한: ${args.maxSize}`;

    case 'ModifyRequestBody':
      return `요청 본문 수정: ${args.contentType}`;

    case 'ModifyResponseBody':
      return `응답 본문 수정: ${args.contentType}`;

    default:
      return `${name}: ${JSON.stringify(args)}`;
  }
};

/**
 * 필터 타입에 따른 색상을 반환합니다
 */
export const getFilterTypeColor = (filterName: string): string => {
  switch (filterName) {
    case 'AddRequestHeader':
    case 'AddRequestParameter':
    case 'AddResponseHeader':
      return 'green';

    case 'RemoveRequestHeader':
    case 'RemoveResponseHeader':
    case 'RemoveRequestParameter':
      return 'red';

    case 'RewritePath':
    case 'PrefixPath':
    case 'StripPrefix':
    case 'SetPath':
      return 'blue';

    case 'RequestRateLimiter':
    case 'CircuitBreaker':
    case 'Retry':
      return 'orange';

    case 'ModifyRequestBody':
    case 'ModifyResponseBody':
      return 'purple';

    default:
      return 'default';
  }
};

/**
 * Predicate 타입에 따른 색상을 반환합니다
 */
export const getPredicateTypeColor = (predicateName: string): string => {
  switch (predicateName) {
    case 'Path':
      return 'blue';
    case 'Method':
      return 'green';
    case 'Host':
      return 'purple';
    case 'Header':
    case 'Query':
    case 'Cookie':
      return 'orange';
    case 'RemoteAddr':
      return 'red';
    case 'Weight':
      return 'gold';
    case 'After':
    case 'Before':
    case 'Between':
      return 'cyan';
    default:
      return 'default';
  }
};