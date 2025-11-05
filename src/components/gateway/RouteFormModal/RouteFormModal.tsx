// 라우트 추가/수정 모달 컴포넌트 (4단계 Wizard)
import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Button, Space, message, Descriptions, Tag, Alert } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { RouteBasicInfoForm, type RouteBasicInfo } from '../RouteBasicInfoForm/RouteBasicInfoForm';
import { PredicateSelector } from '../PredicateSelector/PredicateSelector';
import { FilterSelector } from '../FilterSelector/FilterSelector';
import type { ActuatorPredicate, ActuatorFilter, RouteDefinitionResponse } from '../../../types/gateway';
import { PREDICATE_CONFIGS } from '../PredicateSelector/predicateConfigs';
import { FILTER_CONFIGS } from '../FilterSelector/filterConfigs';

const { TabPane } = Tabs;

interface RouteFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (route: RouteDefinitionResponse) => Promise<void>;
  initialData?: RouteDefinitionResponse;
  mode?: 'create' | 'edit';
}

export const RouteFormModal: React.FC<RouteFormModalProps> = ({
  visible,
  onCancel,
  onSave,
  initialData,
  mode = 'create'
}) => {
  const [currentStep, setCurrentStep] = useState<string>('basic');
  const [saving, setSaving] = useState(false);

  // 폼 데이터 상태
  const [basicInfo, setBasicInfo] = useState<RouteBasicInfo>({
    id: '',
    displayName: '',
    uri: '',
    order: 0,
    enabled: true
  });

  const [predicates, setPredicates] = useState<ActuatorPredicate[]>([]);
  const [filters, setFilters] = useState<ActuatorFilter[]>([]);

  // 변경 여부 추적
  const [hasChanges, setHasChanges] = useState(false);

  // initialData 변경 시 상태 업데이트
  useEffect(() => {
    if (visible && initialData) {
      console.log('🔧 수정 모드: initialData 로드', initialData);

      setBasicInfo({
        id: initialData.id,
        displayName: (initialData.metadata?.displayName as string) || '',
        uri: initialData.uri,
        order: initialData.order,
        enabled: true
      });

      setPredicates(initialData.predicates || []);
      setFilters(initialData.filters || []);
      setHasChanges(false); // 초기 로드 시 변경사항 없음

      console.log('✅ 수정 모드: 데이터 로드 완료', {
        predicates: initialData.predicates?.length,
        filters: initialData.filters?.length
      });
    } else if (visible && !initialData) {
      console.log('➕ 추가 모드: 폼 초기화');

      // 추가 모드일 때는 빈 폼
      setBasicInfo({
        id: '',
        displayName: '',
        uri: '',
        order: 0,
        enabled: true
      });
      setPredicates([]);
      setFilters([]);
      setHasChanges(false);
    }
  }, [visible, initialData]);

  // 수정 모드에서 폼 데이터 변경 감지
  useEffect(() => {
    if (mode !== 'edit' || !initialData || !visible) {
      return;
    }

    // 기본 정보 비교
    const basicInfoChanged =
      basicInfo.displayName !== ((initialData.metadata?.displayName as string) || '') ||
      basicInfo.uri !== initialData.uri ||
      basicInfo.order !== initialData.order;

    // Predicates 비교 (깊은 비교)
    const predicatesChanged =
      JSON.stringify(predicates) !== JSON.stringify(initialData.predicates || []);

    // Filters 비교 (깊은 비교)
    const filtersChanged =
      JSON.stringify(filters) !== JSON.stringify(initialData.filters || []);

    const changed = basicInfoChanged || predicatesChanged || filtersChanged;

    if (changed !== hasChanges) {
      console.log('🔄 변경 감지:', {
        basicInfoChanged,
        predicatesChanged,
        filtersChanged,
        hasChanges: changed
      });
      setHasChanges(changed);
    }
  }, [basicInfo, predicates, filters, initialData, mode, visible, hasChanges]);

  // 유효성 검증
  const validateBasicInfo = (): boolean => {
    if (!basicInfo.id.trim()) {
      message.error('Route ID는 필수입니다');
      return false;
    }
    if (!basicInfo.uri.trim()) {
      message.error('URI는 필수입니다');
      return false;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(basicInfo.id)) {
      message.error('Route ID는 영문, 숫자, 하이픈, 언더스코어만 사용 가능합니다');
      return false;
    }
    return true;
  };

  const validatePredicates = (): boolean => {
    if (predicates.length === 0) {
      message.warning('최소 1개의 Predicate를 추가해주세요');
      return false;
    }
    // 각 Predicate 필수 필드 검증
    for (const predicate of predicates) {
      const args = predicate.args as any;

      switch (predicate.name) {
        case 'Path':
          if (!args.patterns || args.patterns.length === 0 || !args.patterns[0]) {
            message.error('Path Predicate: 경로 패턴을 입력해주세요');
            return false;
          }
          break;
        case 'Method':
          if (!args.methods || args.methods.length === 0) {
            message.error('Method Predicate: HTTP 메서드를 선택해주세요');
            return false;
          }
          break;
        case 'Header':
          if (!args.name && !args.header) {
            message.error('Header Predicate: 헤더 이름을 입력해주세요');
            return false;
          }
          break;
        case 'Host':
          if (!args.patterns || args.patterns.length === 0 || !args.patterns[0]) {
            message.error('Host Predicate: 호스트 패턴을 입력해주세요');
            return false;
          }
          break;
        case 'Query':
          if (!args.param) {
            message.error('Query Predicate: 파라미터 이름을 입력해주세요');
            return false;
          }
          break;
        case 'Cookie':
          if (!args.name || !args.regexp) {
            message.error('Cookie Predicate: 쿠키 이름과 정규식을 입력해주세요');
            return false;
          }
          break;
        case 'RemoteAddr':
          if (!args.sources || args.sources.length === 0 || !args.sources[0]) {
            message.error('RemoteAddr Predicate: IP 주소/CIDR를 입력해주세요');
            return false;
          }
          break;
        case 'Weight':
          if (!args.group || !args.weight) {
            message.error('Weight Predicate: 그룹 이름과 가중치를 입력해주세요');
            return false;
          }
          break;
        case 'After':
        case 'Before':
          if (!args.datetime) {
            message.error(`${predicate.name} Predicate: 날짜와 시간을 선택해주세요`);
            return false;
          }
          break;
        case 'Between':
          if (!args.datetime1 || !args.datetime2) {
            message.error('Between Predicate: 시작과 종료 시간을 모두 선택해주세요');
            return false;
          }
          break;
        // CloudFoundryRouteService는 파라미터가 필요 없음
      }
    }
    return true;
  };

  const validateFilters = (): boolean => {
    // Filter는 선택사항이지만, 추가된 경우 필수 필드 검증
    for (const filter of filters) {
      const args = filter.args as any;

      switch (filter.name) {
        case 'AddRequestHeader':
        case 'AddResponseHeader':
        case 'AddRequestParameter':
          if (!args.name || !args.value) {
            message.error(`${filter.name}: 이름과 값을 모두 입력해주세요`);
            return false;
          }
          break;
        case 'RemoveRequestHeader':
        case 'RemoveResponseHeader':
          if ('names' in args) {
            if (!args.names || args.names.length === 0 || !args.names[0]) {
              message.error(`${filter.name}: 제거할 헤더 이름을 입력해주세요`);
              return false;
            }
          } else if (!args.name) {
            message.error(`${filter.name}: 제거할 헤더 이름을 입력해주세요`);
            return false;
          }
          break;
        case 'RemoveRequestParameter':
          if (!args.name) {
            message.error('RemoveRequestParameter: 제거할 파라미터 이름을 입력해주세요');
            return false;
          }
          break;
        case 'RewritePath':
          if (!args.regexp || !args.replacement) {
            message.error('RewritePath: 정규식과 치환 패턴을 모두 입력해주세요');
            return false;
          }
          break;
        case 'StripPrefix':
          if (!args.parts) {
            message.error('StripPrefix: 제거할 세그먼트 수를 입력해주세요');
            return false;
          }
          break;
        case 'PrefixPath':
          if (!args.prefix) {
            message.error('PrefixPath: 접두사를 입력해주세요');
            return false;
          }
          break;
        case 'SetPath':
          if (!args.template) {
            message.error('SetPath: 경로 템플릿을 입력해주세요');
            return false;
          }
          break;
        case 'RequestRateLimiter':
          if (!args.replenishRate || !args.burstCapacity) {
            message.error('RequestRateLimiter: 재충전 속도와 버스트 용량을 입력해주세요');
            return false;
          }
          break;
        case 'CircuitBreaker':
          if (!args.name) {
            message.error('CircuitBreaker: Circuit Breaker 이름을 입력해주세요');
            return false;
          }
          break;
        case 'Retry':
          if (!args.retries) {
            message.error('Retry: 재시도 횟수를 입력해주세요');
            return false;
          }
          break;
        case 'RequestSize':
          if (!args.maxSize) {
            message.error('RequestSize: 최대 요청 크기를 입력해주세요');
            return false;
          }
          break;
        case 'ModifyRequestBody':
        case 'ModifyResponseBody':
          if (!args.rewriteFunction) {
            message.error(`${filter.name}: RewriteFunction Bean 이름을 입력해주세요`);
            return false;
          }
          break;
      }
    }
    return true;
  };

  // 탭 이동 핸들러
  const handleNext = () => {
    if (currentStep === 'basic') {
      if (!validateBasicInfo()) return;
      setCurrentStep('predicates');
    } else if (currentStep === 'predicates') {
      if (!validatePredicates()) return;
      setCurrentStep('filters');
    } else if (currentStep === 'filters') {
      if (!validateFilters()) return;
      setCurrentStep('review');
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'predicates') {
      setCurrentStep('basic');
    } else if (currentStep === 'filters') {
      setCurrentStep('predicates');
    } else if (currentStep === 'review') {
      setCurrentStep('filters');
    }
  };

  // Spring Cloud Gateway 형식에 맞게 Predicate args 정규화
  const normalizePredicateArgs = (predicate: ActuatorPredicate): ActuatorPredicate => {
    const args = predicate.args as any;
    const normalized = { ...predicate };

    switch (predicate.name) {
      case 'Path':
      case 'Host':
        // patterns: 배열 형태로 유지 (Spring Cloud Gateway 표준)
        if (Array.isArray(args.patterns)) {
          normalized.args = {
            patterns: args.patterns
          };
        } else if (typeof args.patterns === 'string') {
          // 단일 문자열이면 배열로 변환
          normalized.args = {
            patterns: [args.patterns]
          };
        }
        break;

      case 'Method':
        // methods: 배열 형태로 유지 (Spring Cloud Gateway 표준)
        if (Array.isArray(args.methods)) {
          normalized.args = {
            methods: args.methods
          };
        } else if (typeof args.methods === 'string') {
          // 단일 문자열이면 배열로 변환
          normalized.args = {
            methods: [args.methods]
          };
        }
        break;

      case 'Header':
        // header와 regexp 키 확인
        if ('name' in args) {
          normalized.args = {
            header: args.name,
            regexp: args.regexp || args.value || '.*'
          };
        } else if ('header' in args) {
          // 이미 올바른 형식
          normalized.args = args;
        }
        break;

      case 'Query':
        // param과 regexp 키 유지
        if ('param' in args) {
          const queryArgs: any = { param: args.param };
          if (args.regexp) {
            queryArgs.regexp = args.regexp;
          }
          normalized.args = queryArgs;
        }
        break;

      case 'Cookie':
        // name과 regexp 키 유지
        if ('name' in args && 'regexp' in args) {
          normalized.args = {
            name: args.name,
            regexp: args.regexp
          };
        }
        break;

      case 'RemoteAddr':
        // sources: 배열 유지
        if (Array.isArray(args.sources)) {
          normalized.args = { sources: args.sources };
        }
        break;

      case 'Weight':
        // group과 weight 유지
        if ('group' in args && 'weight' in args) {
          normalized.args = {
            group: args.group,
            weight: String(args.weight)
          };
        }
        break;

      case 'After':
      case 'Before':
        // datetime 키 유지
        if ('datetime' in args) {
          normalized.args = { datetime: args.datetime };
        }
        break;

      case 'Between':
        // datetime1, datetime2 키 유지
        if ('datetime1' in args && 'datetime2' in args) {
          normalized.args = {
            datetime1: args.datetime1,
            datetime2: args.datetime2
          };
        }
        break;

      default:
        // 다른 Predicate는 그대로 유지
        break;
    }

    return normalized;
  };

  // Spring Cloud Gateway 형식에 맞게 Filter args 정규화
  const normalizeFilterArgs = (filter: ActuatorFilter): ActuatorFilter => {
    const args = filter.args as any;
    const normalized = { ...filter };

    switch (filter.name) {
      case 'AddRequestHeader':
      case 'AddResponseHeader':
      case 'AddRequestParameter':
        // name과 value 키 유지
        if ('name' in args && 'value' in args) {
          normalized.args = {
            name: args.name,
            value: args.value
          };
        }
        break;

      case 'RemoveRequestHeader':
      case 'RemoveResponseHeader':
        // name 또는 names 키 유지
        if ('names' in args && Array.isArray(args.names)) {
          normalized.args = { names: args.names };
        } else if ('name' in args) {
          normalized.args = { name: args.name };
        }
        break;

      case 'RemoveRequestParameter':
        // name 키 유지
        if ('name' in args) {
          normalized.args = { name: args.name };
        }
        break;

      case 'RewritePath':
        // regexp과 replacement 키 유지
        if ('regexp' in args && 'replacement' in args) {
          normalized.args = {
            regexp: args.regexp,
            replacement: args.replacement
          };
        }
        break;

      case 'StripPrefix':
        // parts 키 유지
        if ('parts' in args) {
          normalized.args = { parts: String(args.parts) };
        }
        break;

      case 'PrefixPath':
        // prefix 키 유지
        if ('prefix' in args) {
          normalized.args = { prefix: args.prefix };
        }
        break;

      case 'SetPath':
        // template 키 유지
        if ('template' in args) {
          normalized.args = { template: args.template };
        }
        break;

      default:
        // 다른 Filter는 그대로 유지
        break;
    }

    return normalized;
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!validateBasicInfo() || !validatePredicates() || !validateFilters()) {
      return;
    }

    setSaving(true);
    try {
      // Predicates와 Filters를 Spring Cloud Gateway 형식으로 정규화
      const normalizedPredicates = predicates.map(normalizePredicateArgs);
      const normalizedFilters = filters.map(normalizeFilterArgs);

      const routeData: RouteDefinitionResponse = {
        id: basicInfo.id,
        uri: basicInfo.uri,
        order: basicInfo.order,
        predicates: normalizedPredicates,
        filters: normalizedFilters,
        metadata: basicInfo.displayName ? { displayName: basicInfo.displayName } : {}
      };

      console.log('📤 서버로 전송할 데이터:', JSON.stringify(routeData, null, 2));

      await onSave(routeData);
      message.success(`라우트가 ${mode === 'create' ? '추가' : '수정'}되었습니다`);
      handleModalClose();
    } catch (error) {
      console.error('Failed to save route:', error);
      message.error(`라우트 ${mode === 'create' ? '추가' : '수정'} 실패`);
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setCurrentStep('basic');
    setBasicInfo({ id: '', displayName: '', uri: '', order: 0, enabled: true });
    setPredicates([]);
    setFilters([]);
    onCancel();
  };

  // Review 탭 렌더링
  const renderReview = () => {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {mode === 'edit' && (
          <Alert
            message={hasChanges ? "변경 사항 감지됨" : "변경 사항 없음"}
            description={
              hasChanges
                ? "수정된 내용이 있습니다. 아래 내용을 확인하고 저장 버튼을 클릭하세요."
                : "현재 저장된 내용과 동일합니다. 변경 후 저장 버튼이 활성화됩니다."
            }
            type={hasChanges ? "warning" : "info"}
            showIcon
            style={{ marginBottom: '8px' }}
          />
        )}

        {mode === 'create' && (
          <Alert
            message="설정 검토"
            description="아래 내용을 확인하고 저장 버튼을 클릭하세요"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        )}

        {/* 기본 정보 */}
        <div>
          <h3>📌 기본 정보</h3>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Route ID">
              <Tag color="blue">{basicInfo.id}</Tag>
            </Descriptions.Item>
            {basicInfo.displayName && (
              <Descriptions.Item label="Display Name">
                {basicInfo.displayName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="URI">{basicInfo.uri}</Descriptions.Item>
            <Descriptions.Item label="Order">{basicInfo.order}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={basicInfo.enabled ? 'green' : 'red'}>
                {basicInfo.enabled ? '활성화' : '비활성화'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Predicates */}
        <div>
          <h3>🔹 Predicates ({predicates.length}개)</h3>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {predicates.map((predicate, index) => {
              const config = PREDICATE_CONFIGS[predicate.name];
              return (
                <div key={index} style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {config?.icon} {config?.label || predicate.name}
                  </div>
                  <pre style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                    {JSON.stringify(predicate.args, null, 2)}
                  </pre>
                </div>
              );
            })}
          </Space>
        </div>

        {/* Filters */}
        <div>
          <h3>🔸 Filters ({filters.length}개)</h3>
          {filters.length === 0 ? (
            <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px', color: '#8c8c8c' }}>
              필터가 없습니다
            </div>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {filters.map((filter, index) => {
                const config = FILTER_CONFIGS[filter.name];
                return (
                  <div key={index} style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      <Tag color="purple" style={{ fontSize: '10px' }}>#{index + 1}</Tag>
                      {config?.icon} {config?.label || filter.name}
                    </div>
                    <pre style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                      {JSON.stringify(filter.args, null, 2)}
                    </pre>
                  </div>
                );
              })}
            </Space>
          )}
        </div>

        {/* JSON Preview */}
        <div>
          <h3>📄 생성될 JSON</h3>
          <pre style={{
            background: '#f9f9f9',
            padding: '12px',
            borderRadius: '4px',
            maxHeight: '300px',
            overflow: 'auto',
            border: '1px solid #d9d9d9'
          }}>
            {JSON.stringify({ id: basicInfo.id, uri: basicInfo.uri, order: basicInfo.order, predicates, filters }, null, 2)}
          </pre>
        </div>
      </Space>
    );
  };

  return (
    <Modal
      title={mode === 'create' ? '새 라우트 추가' : '라우트 수정'}
      open={visible}
      onCancel={handleModalClose}
      width={900}
      footer={
        <Space>
          <Button onClick={handleModalClose}>취소</Button>
          {currentStep !== 'basic' && (
            <Button onClick={handlePrevious}>이전</Button>
          )}
          {currentStep !== 'review' ? (
            <Button type="primary" onClick={handleNext}>다음</Button>
          ) : (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleSave}
              loading={saving}
              disabled={mode === 'edit' && !hasChanges}
            >
              저장
            </Button>
          )}
        </Space>
      }
      destroyOnClose
    >
      <Tabs activeKey={currentStep} onChange={setCurrentStep}>
        <TabPane tab="1. 기본 정보" key="basic">
          <RouteBasicInfoForm
            value={basicInfo}
            onChange={setBasicInfo}
            readOnly={mode === 'edit'}
          />
        </TabPane>

        <TabPane tab="2. Predicates" key="predicates">
          <PredicateSelector value={predicates} onChange={setPredicates} />
        </TabPane>

        <TabPane tab="3. Filters" key="filters">
          <FilterSelector value={filters} onChange={setFilters} />
        </TabPane>

        <TabPane tab="4. 검토" key="review">
          {renderReview()}
        </TabPane>
      </Tabs>
    </Modal>
  );
};