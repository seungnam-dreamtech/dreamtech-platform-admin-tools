// Spring Cloud Gateway Actuator JSON ↔ UI 변환 유틸리티
// Spring Cloud Gateway Actuator JSON ↔ UI conversion utilities

import type {
    GatewayRoute,
    ActuatorRouteResponse,
    RouteDefinitionResponse,
    ActuatorPredicate,
    ActuatorFilter
} from '../types/gateway';

/**
 * RouteDefinition을 사용자 친화적 GatewayRoute로 변환
 * Convert RouteDefinition to user-friendly GatewayRoute
 */
export function convertRouteDefinitionToGatewayRoute(routeDefinition: RouteDefinitionResponse): GatewayRoute {
  const route: GatewayRoute = {
    id: routeDefinition.id,
    uri: routeDefinition.uri,
    order: routeDefinition.order,
    enabled: true, // RouteDefinition에서는 활성화된 것만 반환됨
    conditions: {},
    filters: {},
    metadata: routeDefinition.metadata,
    uiMetadata: {
      lastModified: new Date(),
      isDefault: false,
    }
  };

  // Predicates 변환
  routeDefinition.predicates?.forEach(predicate => {
    convertPredicateToCondition(predicate, route.conditions);
  });

  // Filters 변환
  routeDefinition.filters?.forEach(filter => {
    convertFilterToRouteFilter(filter, route.filters);
  });

  return route;
}

/**
 * Actuator JSON을 사용자 친화적 GatewayRoute로 변환
 * Convert Actuator JSON to user-friendly GatewayRoute
 *
 * 주의: ActuatorRouteResponse는 predicate(문자열)와 filters(문자열 배열)을 반환합니다.
 * 이 함수는 현재 사용되지 않으며, RouteDefinitionResponse를 사용하는 것이 권장됩니다.
 *
 * @deprecated Use convertRouteDefinitionToGatewayRoute instead
 */
export function convertActuatorToGatewayRoute(actuatorRoute: ActuatorRouteResponse): GatewayRoute {
  const route: GatewayRoute = {
    id: actuatorRoute.route_id,
    uri: actuatorRoute.uri,
    order: actuatorRoute.order,
    enabled: true, // Actuator에서는 비활성화된 라우트는 보통 반환하지 않음
    conditions: {},
    filters: {},
    metadata: actuatorRoute.metadata,
    uiMetadata: {
      lastModified: new Date(),
      isDefault: false,
    }
  };

  // ActuatorRouteResponse는 predicate와 filters가 문자열 형식이므로
  // 직접 변환할 수 없습니다. 이 함수는 현재 사용되지 않습니다.
  // 실제 변환은 parsePredicateString과 parseFilterStrings를 사용하여
  // 별도로 처리해야 합니다.
  console.warn('convertActuatorToGatewayRoute is deprecated. Use RouteDefinitionResponse instead.');

  return route;
}

/**
 * GatewayRoute를 Actuator JSON 형식으로 변환
 * Convert GatewayRoute to Actuator JSON format
 */
export function convertGatewayRouteToActuator(route: GatewayRoute): unknown {
  const predicates: ActuatorPredicate[] = [];
  const filters: ActuatorFilter[] = [];

  // Conditions를 Predicates로 변환
  convertConditionsToPredicates(route.conditions, predicates);

  // Filters를 Actuator Filter로 변환
  convertRouteFiltersToActuator(route.filters, filters);

  return {
    id: route.id,
    uri: route.uri,
    order: route.order,
    predicates,
    filters,
    metadata: route.metadata || {}
  };
}

/**
 * Predicate를 Condition으로 변환
 */
function convertPredicateToCondition(predicate: ActuatorPredicate, conditions: GatewayRoute['conditions']) {
  const { name, args } = predicate;
  const anyArgs = args as Record<string, unknown>;

  switch (name) {
    case 'Path':
      conditions.path = conditions.path || [];
      if ('pattern' in args && typeof args.pattern === 'string') {
        conditions.path.push(args.pattern);
      }
      if ('patterns' in args) {
        if (typeof args.patterns === 'string') {
          conditions.path.push(args.patterns);
        } else if (Array.isArray(args.patterns)) {
          conditions.path.push(...args.patterns.filter((p): p is string => typeof p === 'string'));
        }
      }
      break;

    case 'Method':
      conditions.method = conditions.method || [];
      if ('method' in args && typeof args.method === 'string') {
        conditions.method.push(args.method);
      }
      if ('methods' in args) {
        if (typeof args.methods === 'string') {
          conditions.method.push(args.methods);
        } else if (Array.isArray(args.methods)) {
          conditions.method.push(...args.methods.filter((m): m is string => typeof m === 'string'));
        }
      }
      break;

    case 'Host':
      conditions.host = conditions.host || [];
      if ('pattern' in args && typeof args.pattern === 'string') {
        conditions.host.push(args.pattern);
      }
      if ('patterns' in args) {
        if (typeof args.patterns === 'string') {
          conditions.host.push(args.patterns);
        } else if (Array.isArray(args.patterns)) {
          conditions.host.push(...args.patterns.filter((p): p is string => typeof p === 'string'));
        }
      }
      break;

    case 'Header':
      conditions.header = conditions.header || [];
      conditions.header.push({
        name: anyArgs.header as string || anyArgs.name as string,
        value: anyArgs.regexp as string || anyArgs.value as string
      });
      break;

    case 'Query':
      conditions.query = conditions.query || [];
      conditions.query.push({
        name: anyArgs.param as string || anyArgs.name as string,
        value: anyArgs.regexp as string || anyArgs.value as string
      });
      break;

    case 'Cookie':
      conditions.cookie = conditions.cookie || [];
      conditions.cookie.push({
        name: anyArgs.name as string,
        value: anyArgs.regexp as string || anyArgs.value as string
      });
      break;

    case 'RemoteAddr':
      conditions.remoteAddr = conditions.remoteAddr || [];
      if ('source' in args && typeof args.source === 'string') {
        conditions.remoteAddr.push(args.source);
      }
      if ('sources' in args) {
        if (typeof args.sources === 'string') {
          conditions.remoteAddr.push(args.sources);
        } else if (Array.isArray(args.sources)) {
          conditions.remoteAddr.push(...args.sources.filter((s): s is string => typeof s === 'string'));
        }
      }
      break;

    case 'Weight':
      conditions.weight = {
        group: anyArgs.group as string,
        weight: parseInt(anyArgs.weight as string) || 0
      };
      break;

    case 'After':
      conditions.after = anyArgs.datetime as string | undefined;
      break;

    case 'Before':
      conditions.before = anyArgs.datetime as string | undefined;
      break;

    case 'Between':
      conditions.between = {
        start: anyArgs.datetime1 as string,
        end: anyArgs.datetime2 as string
      };
      break;

    case 'CloudFoundryRouteService':
      conditions.cloudFoundryRouteService = true;
      break;

    case 'ReadBodyPredicateFactory':
      conditions.readBodyWithSize = parseInt(anyArgs.size as string) || 0;
      break;

    default:
      console.warn(`Unknown predicate: ${name}`, args);
  }
}

/**
 * Filter를 RouteFilter로 변환
 */
function convertFilterToRouteFilter(filter: ActuatorFilter, filters: GatewayRoute['filters']) {
  const { name, args } = filter;
  const anyArgs = args as Record<string, unknown>;

  switch (name) {
    case 'AddRequestHeader':
      filters.addRequestHeader = filters.addRequestHeader || [];
      filters.addRequestHeader.push({
        name: anyArgs.name as string,
        value: anyArgs.value as string
      });
      break;

    case 'AddRequestParameter':
      filters.addRequestParameter = filters.addRequestParameter || [];
      filters.addRequestParameter.push({
        name: anyArgs.name as string,
        value: anyArgs.value as string
      });
      break;

    case 'AddResponseHeader':
      filters.addResponseHeader = filters.addResponseHeader || [];
      filters.addResponseHeader.push({
        name: anyArgs.name as string,
        value: anyArgs.value as string
      });
      break;

    case 'RemoveRequestHeader':
      filters.removeRequestHeader = filters.removeRequestHeader || [];
      filters.removeRequestHeader.push(anyArgs.name as string);
      break;

    case 'RemoveResponseHeader':
      filters.removeResponseHeader = filters.removeResponseHeader || [];
      filters.removeResponseHeader.push(anyArgs.name as string);
      break;

    case 'RemoveRequestParameter':
      filters.removeRequestParameter = filters.removeRequestParameter || [];
      filters.removeRequestParameter.push(anyArgs.name as string);
      break;

    case 'RewritePath':
      filters.rewritePath = {
        regexp: anyArgs.regexp as string,
        replacement: anyArgs.replacement as string
      };
      break;

    case 'PrefixPath':
      filters.prefixPath = anyArgs.prefix as string;
      break;

    case 'StripPrefix':
      filters.stripPrefix = parseInt(anyArgs.parts as string) || 1;
      break;

    case 'SetPath':
      filters.setPath = anyArgs.template as string;
      break;

    case 'RequestRateLimiter':
      filters.requestRateLimiter = {
        replenishRate: parseInt(anyArgs['replenish-rate'] as string) || 1,
        burstCapacity: parseInt(anyArgs['burst-capacity'] as string) || 1,
        keyResolver: anyArgs['key-resolver'] as string
      };
      break;

    case 'CircuitBreaker':
      filters.circuitBreaker = {
        name: anyArgs.name as string,
        fallbackUri: anyArgs.fallbackUri as string
      };
      break;

    case 'Retry':
      filters.retry = {
        retries: parseInt(anyArgs.retries as string) || 3,
        statuses: anyArgs.statuses ? (anyArgs.statuses as string).split(',') : undefined,
        methods: anyArgs.methods ? (anyArgs.methods as string).split(',') : undefined,
        backoff: (anyArgs.backoff && typeof anyArgs.backoff === 'object') ? {
          firstBackoff: (anyArgs.backoff as Record<string, unknown>).firstBackoff as string,
          maxBackoff: (anyArgs.backoff as Record<string, unknown>).maxBackoff as string,
          factor: parseFloat((anyArgs.backoff as Record<string, unknown>).factor as string) || 2
        } : undefined
      };
      break;

    case 'RequestSize':
      filters.requestSize = parseInt(anyArgs.maxSize as string) || 0;
      break;

    case 'ModifyRequestBody':
      filters.modifyRequestBody = {
        contentType: anyArgs.contentType as string,
        rewriteFunction: anyArgs.rewriteFunction as string
      };
      break;

    case 'ModifyResponseBody':
      filters.modifyResponseBody = {
        contentType: anyArgs.contentType as string,
        rewriteFunction: anyArgs.rewriteFunction as string
      };
      break;

    default:
      // 커스텀 필터들
      filters.custom = filters.custom || [];
      filters.custom.push(filter);
      console.warn(`Unknown or custom filter: ${name}`, args);
  }
}

/**
 * Conditions를 Predicates로 변환 (역변환)
 */
function convertConditionsToPredicates(conditions: GatewayRoute['conditions'], predicates: ActuatorPredicate[]) {
  // Path 조건
  if (conditions.path && conditions.path.length > 0) {
    predicates.push({
      name: 'Path',
      args: conditions.path.length === 1
        ? { pattern: conditions.path[0] }
        : { patterns: conditions.path }
    });
  }

  // Method 조건
  if (conditions.method && conditions.method.length > 0) {
    predicates.push({
      name: 'Method',
      args: conditions.method.length === 1
        ? { method: conditions.method[0] }
        : { methods: conditions.method }
    });
  }

  // Host 조건
  if (conditions.host && conditions.host.length > 0) {
    predicates.push({
      name: 'Host',
      args: conditions.host.length === 1
        ? { pattern: conditions.host[0] }
        : { patterns: conditions.host }
    });
  }

  // Header 조건
  if (conditions.header && conditions.header.length > 0) {
    conditions.header.forEach(header => {
      predicates.push({
        name: 'Header',
        args: {
          header: header.name,
          regexp: header.value
        }
      });
    });
  }

  // Query 조건
  if (conditions.query && conditions.query.length > 0) {
    conditions.query.forEach(query => {
      predicates.push({
        name: 'Query',
        args: {
          param: query.name,
          regexp: query.value
        }
      });
    });
  }

  // Cookie 조건
  if (conditions.cookie && conditions.cookie.length > 0) {
    conditions.cookie.forEach(cookie => {
      predicates.push({
        name: 'Cookie',
        args: {
          name: cookie.name,
          regexp: cookie.value
        }
      });
    });
  }

  // RemoteAddr 조건
  if (conditions.remoteAddr && conditions.remoteAddr.length > 0) {
    predicates.push({
      name: 'RemoteAddr',
      args: conditions.remoteAddr.length === 1
        ? { source: conditions.remoteAddr[0] }
        : { sources: conditions.remoteAddr }
    });
  }

  // Weight 조건
  if (conditions.weight) {
    predicates.push({
      name: 'Weight',
      args: {
        group: conditions.weight.group,
        weight: conditions.weight.weight.toString()
      }
    });
  }

  // 시간 기반 조건들
  if (conditions.after) {
    predicates.push({
      name: 'After',
      args: { datetime: conditions.after }
    });
  }

  if (conditions.before) {
    predicates.push({
      name: 'Before',
      args: { datetime: conditions.before }
    });
  }

  if (conditions.between) {
    predicates.push({
      name: 'Between',
      args: {
        datetime1: conditions.between.start,
        datetime2: conditions.between.end
      }
    });
  }

  if (conditions.cloudFoundryRouteService) {
    predicates.push({
      name: 'CloudFoundryRouteService',
      args: {}
    });
  }

  if (conditions.readBodyWithSize) {
    predicates.push({
      name: 'ReadBodyPredicateFactory',
      args: { size: conditions.readBodyWithSize.toString() }
    });
  }
}

/**
 * RouteFilters를 Actuator Filters로 변환 (역변환)
 */
function convertRouteFiltersToActuator(filters: GatewayRoute['filters'], actuatorFilters: ActuatorFilter[]) {
  // Request Header 조작
  if (filters.addRequestHeader) {
    filters.addRequestHeader.forEach(header => {
      actuatorFilters.push({
        name: 'AddRequestHeader',
        args: { name: header.name, value: header.value }
      });
    });
  }

  if (filters.addRequestParameter) {
    filters.addRequestParameter.forEach(param => {
      actuatorFilters.push({
        name: 'AddRequestParameter',
        args: { name: param.name, value: param.value }
      });
    });
  }

  if (filters.addResponseHeader) {
    filters.addResponseHeader.forEach(header => {
      actuatorFilters.push({
        name: 'AddResponseHeader',
        args: { name: header.name, value: header.value }
      });
    });
  }

  if (filters.removeRequestHeader) {
    filters.removeRequestHeader.forEach(headerName => {
      actuatorFilters.push({
        name: 'RemoveRequestHeader',
        args: { name: headerName }
      });
    });
  }

  if (filters.removeResponseHeader) {
    filters.removeResponseHeader.forEach(headerName => {
      actuatorFilters.push({
        name: 'RemoveResponseHeader',
        args: { name: headerName }
      });
    });
  }

  if (filters.removeRequestParameter) {
    filters.removeRequestParameter.forEach(paramName => {
      actuatorFilters.push({
        name: 'RemoveRequestParameter',
        args: { name: paramName }
      });
    });
  }

  // URL 변환
  if (filters.rewritePath) {
    actuatorFilters.push({
      name: 'RewritePath',
      args: {
        regexp: filters.rewritePath.regexp,
        replacement: filters.rewritePath.replacement
      }
    });
  }

  if (filters.prefixPath) {
    actuatorFilters.push({
      name: 'PrefixPath',
      args: { prefix: filters.prefixPath }
    });
  }

  if (filters.stripPrefix) {
    actuatorFilters.push({
      name: 'StripPrefix',
      args: { parts: filters.stripPrefix.toString() }
    });
  }

  if (filters.setPath) {
    actuatorFilters.push({
      name: 'SetPath',
      args: { template: filters.setPath }
    });
  }

  // Rate Limiting & Circuit Breaker
  if (filters.requestRateLimiter) {
    actuatorFilters.push({
      name: 'RequestRateLimiter',
      args: {
        'replenish-rate': filters.requestRateLimiter.replenishRate.toString(),
        'burst-capacity': filters.requestRateLimiter.burstCapacity.toString(),
        'key-resolver': filters.requestRateLimiter.keyResolver
      }
    });
  }

  if (filters.circuitBreaker) {
    actuatorFilters.push({
      name: 'CircuitBreaker',
      args: {
        name: filters.circuitBreaker.name,
        fallbackUri: filters.circuitBreaker.fallbackUri
      }
    });
  }

  // 기타 필터들
  if (filters.retry) {
    const retryArgs: Record<string, unknown> = {
      retries: filters.retry.retries.toString()
    };

    if (filters.retry.statuses) {
      retryArgs.statuses = filters.retry.statuses.join(',');
    }

    if (filters.retry.methods) {
      retryArgs.methods = filters.retry.methods.join(',');
    }

    if (filters.retry.backoff) {
      retryArgs.backoff = filters.retry.backoff;
    }

    actuatorFilters.push({
      name: 'Retry',
      args: retryArgs
    });
  }

  if (filters.requestSize) {
    actuatorFilters.push({
      name: 'RequestSize',
      args: { maxSize: filters.requestSize.toString() }
    });
  }

  if (filters.modifyRequestBody) {
    actuatorFilters.push({
      name: 'ModifyRequestBody',
      args: {
        contentType: filters.modifyRequestBody.contentType,
        rewriteFunction: filters.modifyRequestBody.rewriteFunction
      }
    });
  }

  if (filters.modifyResponseBody) {
    actuatorFilters.push({
      name: 'ModifyResponseBody',
      args: {
        contentType: filters.modifyResponseBody.contentType,
        rewriteFunction: filters.modifyResponseBody.rewriteFunction
      }
    });
  }

  // 커스텀 필터들
  if (filters.custom) {
    actuatorFilters.push(...filters.custom);
  }
}

/**
 * 라우트 유효성 검증
 * Route validation
 */
export function validateRoute(route: GatewayRoute): string[] {
  const errors: string[] = [];

  if (!route.id || route.id.trim() === '') {
    errors.push('라우트 ID는 필수입니다.');
  }

  if (!route.uri || route.uri.trim() === '') {
    errors.push('URI는 필수입니다.');
  } else {
    try {
      new URL(route.uri);
    } catch {
      if (!route.uri.startsWith('lb://') && !route.uri.startsWith('forward:')) {
        errors.push('URI 형식이 올바르지 않습니다. (http://, https://, lb://, forward: 지원)');
      }
    }
  }

  if (!route.conditions.path || route.conditions.path.length === 0) {
    errors.push('최소 하나의 Path 조건이 필요합니다.');
  }

  return errors;
}
