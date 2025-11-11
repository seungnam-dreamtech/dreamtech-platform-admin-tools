// Spring Cloud Gateway Actuator 기반 타입 정의
// Spring Cloud Gateway Actuator based type definitions

// RouteDefinition API 응답 형식 (routedefinitions 엔드포인트)
export interface RouteDefinitionResponse {
  id: string;
  predicates: ActuatorPredicate[];
  filters: ActuatorFilter[];
  uri: string;
  metadata?: Record<string, unknown>;
  order: number;
}

// Actuator Route Response 형식 (routes 엔드포인트)
// Actuator Route Response format
// 주의: routes/{id} 엔드포인트는 predicates를 문자열로, filters를 문자열 배열로 반환
export interface ActuatorRouteResponse {
  route_id: string;
  uri: string;
  order: number;
  predicate: string;  // 문자열 형식: "(Paths: [/docs/ecg], match trailing slash: true && Methods: [GET])"
  filters: string[];  // 문자열 배열: "[[DedupeResponseHeader ...], order = 1]"
  metadata?: Record<string, unknown>;
}

// ===========================================================================
// Actuator Predicate Args 타입 정의
// ===========================================================================
export interface ActuatorPathPredicateArgs {
  pattern?: string;
  patterns?: string[];
}

export interface ActuatorMethodPredicateArgs {
  method?: string;
  methods?: string[];
}

export interface ActuatorHostPredicateArgs {
  pattern?: string;
  patterns?: string[];
}

export interface ActuatorHeaderPredicateArgs {
  header?: string;
  name?: string; // 때때로 'name'이 'header' 대신 사용됨
  regexp?: string;
  value?: string; // 때때로 'value'가 'regexp' 대신 사용됨
}

export interface ActuatorQueryPredicateArgs {
  param?: string;
  name?: string; // 때때로 'name'이 'param' 대신 사용됨
  regexp?: string;
  value?: string; // 때때로 'value'가 'regexp' 대신 사용됨
}

export interface ActuatorCookiePredicateArgs {
  name: string;
  regexp?: string;
  value?: string; // 때때로 'value'가 'regexp' 대신 사용됨
}

export interface ActuatorRemoteAddrPredicateArgs {
  source?: string;
  sources?: string[];
}

export interface ActuatorWeightPredicateArgs {
  group: string;
  weight: string; // Actuator는 문자열로 반환, UI는 숫자로 변환
}

export interface ActuatorDateTimePredicateArgs {
  datetime: string;
}

export interface ActuatorAfterPredicateArgs {
  datetime: string;
}

export interface ActuatorBeforePredicateArgs {
  datetime: string;
}

export interface ActuatorBetweenPredicateArgs {
  datetime1: string;
  datetime2: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ActuatorCloudFoundryRouteServicePredicateArgs {
  // CloudFoundryRouteService는 args가 없음
}

export interface ActuatorReadBodyPredicateArgs {
  size: string; // Actuator는 문자열로 반환, UI는 숫자로 변환
}

// ===========================================================================
// Actuator Filter Args 타입 정의
// ===========================================================================
export interface ActuatorAddHeaderFilterArgs {
  name: string;
  value: string;
}

export interface ActuatorRemoveHeaderFilterArgs {
  name?: string;
  names?: string[]; // 여러 헤더를 제거할 때 사용
}

export interface ActuatorRewritePathFilterArgs {
  regexp: string;
  replacement: string;
}

export interface ActuatorPrefixPathFilterArgs {
  prefix: string;
}

export interface ActuatorStripPrefixFilterArgs {
  parts: string; // Actuator는 문자열로 반환, UI는 숫자로 변환
}

export interface ActuatorSetPathFilterArgs {
  template: string;
}

export interface ActuatorRequestRateLimiterFilterArgs {
  'replenish-rate': string; // Actuator는 문자열로 반환, UI는 숫자로 변환
  'burst-capacity': string; // Actuator는 문자열로 반환, UI는 숫자로 변환
  'key-resolver'?: string;
}

export interface ActuatorCircuitBreakerFilterArgs {
  name: string;
  fallbackUri?: string;
}

export interface ActuatorRetryBackoffArgs {
  firstBackoff?: string;
  maxBackoff?: string;
  factor?: string; // Actuator는 문자열로 반환, UI는 숫자로 변환
}

export interface ActuatorRetryFilterArgs {
  retries?: string; // Actuator는 문자열로 반환, UI는 숫자로 변환
  statuses?: string; // 콤마로 구분된 문자열
  methods?: string; // 콤마로 구분된 문자열
  backoff?: ActuatorRetryBackoffArgs;
}

export interface ActuatorRequestSizeFilterArgs {
  maxSize: string; // Actuator는 문자열로 반환, UI는 숫자로 변환
}

export interface ActuatorModifyBodyFilterArgs {
  contentType: string;
  rewriteFunction: string;
}

// ===========================================================================
// Actuator Predicate 및 Filter 타입 (판별된 유니온)
// ===========================================================================
export type ActuatorPredicate =
  | { name: 'Path'; args: ActuatorPathPredicateArgs }
  | { name: 'Method'; args: ActuatorMethodPredicateArgs }
  | { name: 'Host'; args: ActuatorHostPredicateArgs }
  | { name: 'Header'; args: ActuatorHeaderPredicateArgs }
  | { name: 'Query'; args: ActuatorQueryPredicateArgs }
  | { name: 'Cookie'; args: ActuatorCookiePredicateArgs }
  | { name: 'RemoteAddr'; args: ActuatorRemoteAddrPredicateArgs }
  | { name: 'Weight'; args: ActuatorWeightPredicateArgs }
  | { name: 'After'; args: ActuatorDateTimePredicateArgs }
  | { name: 'Before'; args: ActuatorDateTimePredicateArgs }
  | { name: 'Between'; args: ActuatorBetweenPredicateArgs }
  | { name: 'CloudFoundryRouteService'; args: Record<string, unknown> } // 특정 args 없음
  | { name: 'ReadBodyPredicateFactory'; args: ActuatorReadBodyPredicateArgs }
  | { name: string; args: Record<string, unknown> }; // 알려지지 않은 Predicate를 위한 폴백

export type ActuatorFilter =
  | { name: 'AddRequestHeader'; args: ActuatorAddHeaderFilterArgs }
  | { name: 'AddRequestParameter'; args: ActuatorAddHeaderFilterArgs }
  | { name: 'AddResponseHeader'; args: ActuatorAddHeaderFilterArgs }
  | { name: 'RemoveRequestHeader'; args: ActuatorRemoveHeaderFilterArgs }
  | { name: 'RemoveResponseHeader'; args: ActuatorRemoveHeaderFilterArgs }
  | { name: 'RemoveRequestParameter'; args: ActuatorRemoveHeaderFilterArgs }
  | { name: 'RewritePath'; args: ActuatorRewritePathFilterArgs }
  | { name: 'PrefixPath'; args: ActuatorPrefixPathFilterArgs }
  | { name: 'StripPrefix'; args: ActuatorStripPrefixFilterArgs }
  | { name: 'SetPath'; args: ActuatorSetPathFilterArgs }
  | { name: 'RequestRateLimiter'; args: ActuatorRequestRateLimiterFilterArgs }
  | { name: 'CircuitBreaker'; args: ActuatorCircuitBreakerFilterArgs }
  | { name: 'Retry'; args: ActuatorRetryFilterArgs }
  | { name: 'RequestSize'; args: ActuatorRequestSizeFilterArgs }
  | { name: 'ModifyRequestBody'; args: ActuatorModifyBodyFilterArgs }
  | { name: 'ModifyResponseBody'; args: ActuatorModifyBodyFilterArgs }
  | { name: string; args: Record<string, unknown> }; // 알려지지 않은 Filter를 위한 폴백

// ===========================================================================
// 사용자 친화적 라우트 표현
// ===========================================================================
export interface GatewayRoute {
  id: string;
  displayName?: string;
  uri: string;
  order: number;
  enabled: boolean;

  // 조건들 (Predicates)
  conditions: {
    path?: string[];              // Path=/api/users/**
    method?: string[];            // Method=GET,POST
    host?: string[];              // Host=**.example.com
    header?: Array<{              // Header=X-Request-Id, \d+
      name: string;
      value?: string;
    }>;
    query?: Array<{               // Query=version, v1
      name: string;
      value?: string;
    }>;
    cookie?: Array<{              // Cookie=chocolate, ch.p
      name: string;
      value?: string;
    }>;
    remoteAddr?: string[];        // RemoteAddr=192.168.1.1/24
    weight?: {                    // Weight=group1, 8
      group: string;
      weight: number;
    };
    cloudFoundryRouteService?: boolean;
    readBodyWithSize?: number;
    after?: string;               // After=2023-01-20T17:42:47.789-07:00[America/Denver]
    before?: string;              // Before=2023-01-20T17:42:47.789-07:00[America/Denver]
    between?: {                   // Between=2023-01-20T17:42:47.789-07:00[America/Denver], 2023-01-21T17:42:47.789-07:00[America/Denver]
      start: string;
      end: string;
    };
  };

  // 필터들
  filters: {
    // Request/Response 변환
    addRequestHeader?: Array<{    // AddRequestHeader=X-Request-red, blue
      name: string;
      value: string;
    }>;
    addRequestParameter?: Array<{ // AddRequestParameter=red, blue
      name: string;
      value: string;
    }>;
    addResponseHeader?: Array<{   // AddResponseHeader=X-Response-Red, Blue
      name: string;
      value: string;
    }>;
    removeRequestHeader?: string[]; // RemoveRequestHeader=X-Request-Foo
    removeResponseHeader?: string[]; // RemoveResponseHeader=X-Response-Foo
    removeRequestParameter?: string[]; // RemoveRequestParameter=red

    // URL 변환
    rewritePath?: {               // RewritePath=/red(?<segment>/?.*), $\{segment}
      regexp: string;
      replacement: string;
    };
    prefixPath?: string;          // PrefixPath=/mypath
    stripPrefix?: number;         // StripPrefix=2
    setPath?: string;             // SetPath=/foo/{segment}

    // Rate Limiting & Circuit Breaker
    requestRateLimiter?: {        // RequestRateLimiter=10, 20, #{@userKeyResolver}
      replenishRate: number;
      burstCapacity: number;
      keyResolver?: string;
    };
    circuitBreaker?: {            // CircuitBreaker=myCircuitBreaker
      name: string;
      fallbackUri?: string;
    };

    // 기타 유용한 필터들
    retry?: {                     // Retry=3, 5000, GET, POST
      retries: number;
      statuses?: string[];
      methods?: string[];
      backoff?: {
        firstBackoff: string;
        maxBackoff: string;
        factor: number;
      };
    };
    requestSize?: number;         // RequestSize=5MB
    modifyRequestBody?: {         // ModifyRequestBody
      contentType: string;
      rewriteFunction: string;
    };
    modifyResponseBody?: {        // ModifyResponseBody
      contentType: string;
      rewriteFunction: string;
    };

    // 커스텀 필터 (사용자 정의)
    custom?: ActuatorFilter[];
  };

  metadata?: Record<string, unknown>;

  // UI용 추가 정보
  uiMetadata?: {
    description?: string;
    tags?: string[];
    lastModified?: Date;
    modifiedBy?: string;
    isDefault?: boolean;
  };
}

// 라우트 생성/수정용 폼 데이터
// Form data for route creation/modification
export interface RouteFormData {
  basic: {
    id: string;
    displayName?: string;
    description?: string;
    uri: string;
    order: number;
    enabled: boolean;
    tags?: string[];
  };
  conditions: GatewayRoute['conditions'];
  filters: GatewayRoute['filters'];
}

// 라우트 테스트용 데이터
// Route testing data
export interface RouteTestRequest {
  method: string;
  path: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: string;
}

export interface RouteTestResult {
  matched: boolean;
  matchedRoute?: string;
  finalUri?: string;
  appliedFilters?: string[];
  executionTime: number;
  error?: string;
}

// Metrics 및 통계 타입
export interface GatewayMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  // 추가 시스템 메트릭스
  jvmMemoryUsed?: number; // MB 단위
  jvmMemoryMax?: number;  // MB 단위
  activeConnections?: number;
  uptimeSeconds?: number; // 업타임 (초)
}

export interface RouteMetrics {
  routeId: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastAccessed: string;
}

// 라우트 통계 정보
// Route statistics
export interface RouteStats {
  routeId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastAccessed?: Date;
  errorRate: number;
}

// 서비스별 그룹핑을 위한 인터페이스
// Interface for service-based grouping
export interface ServiceGroup {
  serviceName: string;
  displayName?: string;
  description?: string;
  routes: GatewayRoute[];
  totalRoutes: number;
  activeRoutes: number;
  tags?: string[];
  serviceType: 'microservice' | 'external' | 'legacy';
  serviceStats?: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}
