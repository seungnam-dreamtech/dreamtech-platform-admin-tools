// Spring Cloud Gateway Actuator API 데이터 변환 유틸리티
// UI의 배열 형식을 API의 _genkey_N 형식으로 변환
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ActuatorPredicate, ActuatorFilter } from '../types/gateway';

/**
 * UI 배열을 Actuator API의 _genkey_N 형식으로 변환
 * 예: ["value1", "value2"] → {"_genkey_0": "value1", "_genkey_1": "value2"}
 */
export function arrayToGenKey(values: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  values.forEach((value, index) => {
    result[`_genkey_${index}`] = value;
  });
  return result;
}

/**
 * Actuator API의 _genkey_N 형식을 UI 배열로 변환
 * 예: {"_genkey_0": "value1", "_genkey_1": "value2"} → ["value1", "value2"]
 */
export function genKeyToArray(obj: Record<string, string>): string[] {
  const result: string[] = [];
  let index = 0;

  while (obj[`_genkey_${index}`] !== undefined) {
    result.push(obj[`_genkey_${index}`]);
    index++;
  }

  return result;
}

/**
 * Predicate args를 API 형식으로 변환
 */
export function convertPredicateArgsToApi(predicate: ActuatorPredicate): ActuatorPredicate {
  const { name, args } = predicate;

  switch (name) {
    case 'Path': {
      // patterns 배열을 _genkey_N 형식으로 변환
      if ('patterns' in args && Array.isArray(args.patterns)) {
        return {
          name,
          args: arrayToGenKey(args.patterns)
        };
      }
      // pattern 단일 값은 _genkey_0으로 변환
      if ('pattern' in args && typeof args.pattern === 'string') {
        return {
          name,
          args: { _genkey_0: args.pattern }
        };
      }
      return predicate;
    }

    case 'Method': {
      // methods 배열을 _genkey_N 형식으로 변환
      if ('methods' in args && Array.isArray(args.methods)) {
        return {
          name,
          args: arrayToGenKey(args.methods)
        };
      }
      // method 단일 값은 _genkey_0으로 변환
      if ('method' in args && typeof args.method === 'string') {
        return {
          name,
          args: { _genkey_0: args.method }
        };
      }
      return predicate;
    }

    case 'Host': {
      // patterns 배열을 _genkey_N 형식으로 변환
      if ('patterns' in args && Array.isArray(args.patterns)) {
        return {
          name,
          args: arrayToGenKey(args.patterns)
        };
      }
      // pattern 단일 값은 _genkey_0으로 변환
      if ('pattern' in args && typeof args.pattern === 'string') {
        return {
          name,
          args: { _genkey_0: args.pattern }
        };
      }
      return predicate;
    }

    case 'Header': {
      // Header는 name(또는 header)과 regexp(또는 value) 두 개의 값을 _genkey_0, _genkey_1로 변환
      const headerName = ('name' in args ? args.name : 'header' in args ? args.header : undefined) as string | undefined;
      const headerValue = ('regexp' in args ? args.regexp : 'value' in args ? args.value : undefined) as string | undefined;

      if (headerName && headerValue) {
        return {
          name,
          args: {
            _genkey_0: headerName,
            _genkey_1: headerValue
          }
        };
      } else if (headerName) {
        return {
          name,
          args: { _genkey_0: headerName }
        };
      }
      return predicate;
    }

    case 'Query': {
      // Query는 param(또는 name)과 regexp(또는 value) 두 개의 값을 _genkey_0, _genkey_1로 변환
      const paramName = ('param' in args ? args.param : 'name' in args ? args.name : undefined) as string | undefined;
      const paramValue = ('regexp' in args ? args.regexp : 'value' in args ? args.value : undefined) as string | undefined;

      if (paramName && paramValue) {
        return {
          name,
          args: {
            _genkey_0: paramName,
            _genkey_1: paramValue
          }
        };
      } else if (paramName) {
        return {
          name,
          args: { _genkey_0: paramName }
        };
      }
      return predicate;
    }

    case 'Cookie': {
      // Cookie는 name과 regexp 두 개의 값을 _genkey_0, _genkey_1로 변환
      if ('name' in args && 'regexp' in args) {
        return {
          name,
          args: {
            _genkey_0: args.name,
            _genkey_1: args.regexp
          }
        };
      } else if ('name' in args && 'value' in args) {
        return {
          name,
          args: {
            _genkey_0: args.name,
            _genkey_1: args.value
          }
        };
      } else if ('name' in args) {
        return {
          name,
          args: { _genkey_0: args.name }
        };
      }
      return predicate;
    }

    case 'RemoteAddr': {
      // sources 배열을 _genkey_N 형식으로 변환
      if ('sources' in args && Array.isArray(args.sources)) {
        return {
          name,
          args: arrayToGenKey(args.sources)
        };
      }
      // source 단일 값은 _genkey_0으로 변환
      if ('source' in args && typeof args.source === 'string') {
        return {
          name,
          args: { _genkey_0: args.source }
        };
      }
      return predicate;
    }

    case 'Weight': {
      // Weight는 group과 weight 두 개의 값을 _genkey_0, _genkey_1로 변환
      if ('group' in args && 'weight' in args) {
        return {
          name,
          args: {
            _genkey_0: args.group,
            _genkey_1: String(args.weight)
          }
        };
      }
      return predicate;
    }

    case 'After':
    case 'Before': {
      // datetime 값을 _genkey_0으로 변환
      if ('datetime' in args) {
        return {
          name,
          args: { _genkey_0: args.datetime }
        };
      }
      return predicate;
    }

    case 'Between': {
      // datetime1과 datetime2를 _genkey_0, _genkey_1로 변환
      if ('datetime1' in args && 'datetime2' in args) {
        return {
          name,
          args: {
            _genkey_0: args.datetime1,
            _genkey_1: args.datetime2
          }
        };
      }
      return predicate;
    }

    case 'CloudFoundryRouteService': {
      // CloudFoundryRouteService는 args가 없거나 빈 객체
      return {
        name,
        args: {}
      };
    }

    default:
      // 알 수 없는 predicate는 그대로 반환
      return predicate;
  }
}

/**
 * Filter args를 API 형식으로 변환
 */
export function convertFilterArgsToApi(filter: ActuatorFilter): ActuatorFilter {
  const { name, args } = filter;

  switch (name) {
    case 'AddRequestHeader':
    case 'AddResponseHeader':
    case 'AddRequestParameter': {
      // name과 value를 _genkey_0, _genkey_1로 변환
      if ('name' in args && 'value' in args) {
        return {
          name,
          args: {
            _genkey_0: args.name,
            _genkey_1: args.value
          }
        };
      }
      return filter;
    }

    case 'RemoveRequestHeader':
    case 'RemoveResponseHeader': {
      // names 배열을 _genkey_N 형식으로 변환
      if ('names' in args && Array.isArray(args.names)) {
        return {
          name,
          args: arrayToGenKey(args.names as string[])
        };
      }
      // name 단일 값은 _genkey_0으로 변환
      if ('name' in args && typeof args.name === 'string') {
        return {
          name,
          args: { _genkey_0: args.name }
        };
      }
      return filter;
    }

    case 'RemoveRequestParameter': {
      // name 값을 _genkey_0으로 변환
      if ('name' in args) {
        return {
          name,
          args: { _genkey_0: args.name }
        };
      }
      return filter;
    }

    case 'RewritePath': {
      // regexp과 replacement를 _genkey_0, _genkey_1로 변환
      if ('regexp' in args && 'replacement' in args) {
        return {
          name,
          args: {
            _genkey_0: args.regexp,
            _genkey_1: args.replacement
          }
        };
      }
      return filter;
    }

    case 'StripPrefix': {
      // parts 값을 _genkey_0으로 변환
      if ('parts' in args) {
        return {
          name,
          args: { _genkey_0: String(args.parts) }
        };
      }
      return filter;
    }

    case 'PrefixPath': {
      // prefix 값을 _genkey_0으로 변환
      if ('prefix' in args) {
        return {
          name,
          args: { _genkey_0: args.prefix }
        };
      }
      return filter;
    }

    case 'SetPath': {
      // template 값을 _genkey_0으로 변환
      if ('template' in args) {
        return {
          name,
          args: { _genkey_0: args.template }
        };
      }
      return filter;
    }

    case 'RequestRateLimiter': {
      // replenishRate, burstCapacity, keyResolver를 _genkey_N으로 변환
      const apiArgs: Record<string, string> = {};

      if ('replenishRate' in args || 'replenish-rate' in args) {
        const rate = ('replenishRate' in args ? args.replenishRate : args['replenish-rate']) as string | number;
        apiArgs._genkey_0 = String(rate);
      }

      if ('burstCapacity' in args || 'burst-capacity' in args) {
        const capacity = ('burstCapacity' in args ? args.burstCapacity : args['burst-capacity']) as string | number;
        apiArgs._genkey_1 = String(capacity);
      }

      if ('keyResolver' in args || 'key-resolver' in args) {
        const resolver = ('keyResolver' in args ? args.keyResolver : args['key-resolver']) as string;
        apiArgs._genkey_2 = resolver;
      }

      return {
        name,
        args: apiArgs
      };
    }

    case 'CircuitBreaker': {
      // name과 fallbackUri를 _genkey_N으로 변환
      const apiArgs: Record<string, string> = {};

      if ('name' in args) {
        apiArgs._genkey_0 = args.name;
      }

      if ('fallbackUri' in args && args.fallbackUri) {
        apiArgs._genkey_1 = args.fallbackUri;
      }

      return {
        name,
        args: apiArgs
      };
    }

    case 'Retry': {
      // Retry는 복잡한 구조이므로 간단히 처리
      // retries만 _genkey_0으로 변환하고 나머지는 그대로 유지
      if ('retries' in args) {
        const apiArgs: Record<string, any> = {
          _genkey_0: String(args.retries)
        };

        // statuses, methods, backoff 등은 그대로 유지 (선택사항)
        if ('statuses' in args) {
          apiArgs.statuses = args.statuses;
        }
        if ('methods' in args) {
          apiArgs.methods = args.methods;
        }
        if ('backoff' in args) {
          apiArgs.backoff = args.backoff;
        }

        return {
          name,
          args: apiArgs
        };
      }
      return filter;
    }

    case 'RequestSize': {
      // maxSize 값을 _genkey_0으로 변환
      if ('maxSize' in args) {
        return {
          name,
          args: { _genkey_0: String(args.maxSize) }
        };
      }
      return filter;
    }

    case 'ModifyRequestBody':
    case 'ModifyResponseBody': {
      // contentType과 rewriteFunction을 _genkey_N으로 변환
      const apiArgs: Record<string, string> = {};

      if ('contentType' in args) {
        apiArgs._genkey_0 = args.contentType;
      }

      if ('rewriteFunction' in args) {
        apiArgs._genkey_1 = args.rewriteFunction;
      }

      return {
        name,
        args: apiArgs
      };
    }

    default:
      // 알 수 없는 filter는 그대로 반환
      return filter;
  }
}

/**
 * Predicate args를 UI 형식으로 변환 (API → UI)
 */
export function convertPredicateArgsFromApi(predicate: ActuatorPredicate): ActuatorPredicate {
  const { name, args } = predicate;

  // args가 _genkey_N 형식인지 확인
  const hasGenKey = Object.keys(args).some(key => key.startsWith('_genkey_'));
  if (!hasGenKey) {
    return predicate; // 이미 변환된 형식이거나 다른 형식
  }

  switch (name) {
    case 'Path': {
      const patterns = genKeyToArray(args as Record<string, string>);
      return {
        name,
        args: { patterns }
      };
    }

    case 'Method': {
      const methods = genKeyToArray(args as Record<string, string>);
      return {
        name,
        args: { methods }
      };
    }

    case 'Host': {
      const patterns = genKeyToArray(args as Record<string, string>);
      return {
        name,
        args: { patterns }
      };
    }

    case 'Header': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 2) {
        return {
          name,
          args: { name: values[0], regexp: values[1] }
        };
      } else if (values.length === 1) {
        return {
          name,
          args: { name: values[0] }
        };
      }
      return predicate;
    }

    case 'Query': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 2) {
        return {
          name,
          args: { param: values[0], regexp: values[1] }
        };
      } else if (values.length === 1) {
        return {
          name,
          args: { param: values[0] }
        };
      }
      return predicate;
    }

    case 'Cookie': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 2) {
        return {
          name,
          args: { name: values[0], regexp: values[1] }
        };
      } else if (values.length === 1) {
        return {
          name,
          args: { name: values[0] }
        };
      }
      return predicate;
    }

    case 'RemoteAddr': {
      const sources = genKeyToArray(args as Record<string, string>);
      return {
        name,
        args: { sources }
      };
    }

    case 'Weight': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 2) {
        return {
          name,
          args: { group: values[0], weight: values[1] }
        };
      }
      return predicate;
    }

    case 'After':
    case 'Before': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 1) {
        return {
          name,
          args: { datetime: values[0] }
        };
      }
      return predicate;
    }

    case 'Between': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 2) {
        return {
          name,
          args: { datetime1: values[0], datetime2: values[1] }
        };
      }
      return predicate;
    }

    default:
      return predicate;
  }
}

/**
 * Filter args를 UI 형식으로 변환 (API → UI)
 */
export function convertFilterArgsFromApi(filter: ActuatorFilter): ActuatorFilter {
  const { name, args } = filter;

  // args가 _genkey_N 형식인지 확인
  const hasGenKey = Object.keys(args).some(key => key.startsWith('_genkey_'));
  if (!hasGenKey) {
    return filter; // 이미 변환된 형식이거나 다른 형식
  }

  switch (name) {
    case 'AddRequestHeader':
    case 'AddResponseHeader':
    case 'AddRequestParameter': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 2) {
        return {
          name,
          args: { name: values[0], value: values[1] }
        };
      }
      return filter;
    }

    case 'RemoveRequestHeader':
    case 'RemoveResponseHeader':
    case 'RemoveRequestParameter': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length === 1) {
        return {
          name,
          args: { name: values[0] }
        } as ActuatorFilter;
      } else if (values.length > 1) {
        return {
          name,
          args: { names: values }
        } as ActuatorFilter;
      }
      return filter;
    }

    case 'RewritePath': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 2) {
        return {
          name,
          args: { regexp: values[0], replacement: values[1] }
        };
      }
      return filter;
    }

    case 'StripPrefix': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 1) {
        return {
          name,
          args: { parts: values[0] }
        };
      }
      return filter;
    }

    case 'PrefixPath': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 1) {
        return {
          name,
          args: { prefix: values[0] }
        };
      }
      return filter;
    }

    case 'SetPath': {
      const values = genKeyToArray(args as Record<string, string>);
      if (values.length >= 1) {
        return {
          name,
          args: { template: values[0] }
        };
      }
      return filter;
    }

    default:
      return filter;
  }
}