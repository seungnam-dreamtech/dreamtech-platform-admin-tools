// 라우트 추가/수정 모달 컴포넌트 (4단계 Wizard)
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Button,
  Stack,
  Alert,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
// Note: Using console messages instead of snackbar for now
import { RouteBasicInfoForm, type RouteBasicInfo } from '../RouteBasicInfoForm/RouteBasicInfoForm';
import { PredicateSelector } from '../PredicateSelector/PredicateSelector';
import { FilterSelector } from '../FilterSelector/FilterSelector';
import type { ActuatorPredicate, ActuatorFilter, RouteDefinitionResponse } from '../../../types/gateway';
import { PREDICATE_CONFIGS } from '../PredicateSelector/predicateConfigs';
import { FILTER_CONFIGS } from '../FilterSelector/filterConfigs';

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
  // Snackbar helper function
  const showMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    // TODO: Implement proper snackbar/notification
    if (type === 'error') {
      alert(`오류: ${message}`);
    } else if (type === 'warning') {
      console.warn(message);
      alert(message);
    } else {
      console.log(message);
    }
  };
  const [currentStep, setCurrentStep] = useState<number>(0);
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
      showMessage('Route ID는 필수입니다', 'error');
      return false;
    }
    if (!basicInfo.uri.trim()) {
      showMessage('URI는 필수입니다', 'error');
      return false;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(basicInfo.id)) {
      showMessage('Route ID는 영문, 숫자, 하이픈, 언더스코어만 사용 가능합니다', 'error');
      return false;
    }
    return true;
  };

  const validatePredicates = (): boolean => {
    if (predicates.length === 0) {
      showMessage('최소 1개의 Predicate를 추가해주세요', 'warning');
      return false;
    }
    // 각 Predicate 필수 필드 검증
    for (const predicate of predicates) {
      const args = predicate.args as any;

      switch (predicate.name) {
        case 'Path':
          if (!args.patterns || args.patterns.length === 0 || !args.patterns[0]) {
            showMessage('Path Predicate: 경로 패턴을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'Method':
          if (!args.methods || args.methods.length === 0) {
            showMessage('Method Predicate: HTTP 메서드를 선택해주세요', 'error');
            return false;
          }
          break;
        case 'Header':
          if (!args.name && !args.header) {
            showMessage('Header Predicate: 헤더 이름을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'Host':
          if (!args.patterns || args.patterns.length === 0 || !args.patterns[0]) {
            showMessage('Host Predicate: 호스트 패턴을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'Query':
          if (!args.param) {
            showMessage('Query Predicate: 파라미터 이름을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'Cookie':
          if (!args.name || !args.regexp) {
            showMessage('Cookie Predicate: 쿠키 이름과 정규식을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'RemoteAddr':
          if (!args.sources || args.sources.length === 0 || !args.sources[0]) {
            showMessage('RemoteAddr Predicate: IP 주소/CIDR를 입력해주세요', 'error');
            return false;
          }
          break;
        case 'Weight':
          if (!args.group || !args.weight) {
            showMessage('Weight Predicate: 그룹 이름과 가중치를 입력해주세요', 'error');
            return false;
          }
          break;
        case 'After':
        case 'Before':
          if (!args.datetime) {
            showMessage(`${predicate.name} Predicate: 날짜와 시간을 선택해주세요`, 'error');
            return false;
          }
          break;
        case 'Between':
          if (!args.datetime1 || !args.datetime2) {
            showMessage('Between Predicate: 시작과 종료 시간을 모두 선택해주세요', 'error');
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
            showMessage(`${filter.name}: 이름과 값을 모두 입력해주세요`, 'error');
            return false;
          }
          break;
        case 'RemoveRequestHeader':
        case 'RemoveResponseHeader':
          if ('names' in args) {
            if (!args.names || args.names.length === 0 || !args.names[0]) {
              showMessage(`${filter.name}: 제거할 헤더 이름을 입력해주세요`, 'error');
              return false;
            }
          } else if (!args.name) {
            showMessage(`${filter.name}: 제거할 헤더 이름을 입력해주세요`, 'error');
            return false;
          }
          break;
        case 'RemoveRequestParameter':
          if (!args.name) {
            showMessage('RemoveRequestParameter: 제거할 파라미터 이름을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'RewritePath':
          if (!args.regexp || !args.replacement) {
            showMessage('RewritePath: 정규식과 치환 패턴을 모두 입력해주세요', 'error');
            return false;
          }
          break;
        case 'StripPrefix':
          if (!args.parts) {
            showMessage('StripPrefix: 제거할 세그먼트 수를 입력해주세요', 'error');
            return false;
          }
          break;
        case 'PrefixPath':
          if (!args.prefix) {
            showMessage('PrefixPath: 접두사를 입력해주세요', 'error');
            return false;
          }
          break;
        case 'SetPath':
          if (!args.template) {
            showMessage('SetPath: 경로 템플릿을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'RequestRateLimiter':
          if (!args.replenishRate || !args.burstCapacity) {
            showMessage('RequestRateLimiter: 재충전 속도와 버스트 용량을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'CircuitBreaker':
          if (!args.name) {
            showMessage('CircuitBreaker: Circuit Breaker 이름을 입력해주세요', 'error');
            return false;
          }
          break;
        case 'Retry':
          if (!args.retries) {
            showMessage('Retry: 재시도 횟수를 입력해주세요', 'error');
            return false;
          }
          break;
        case 'RequestSize':
          if (!args.maxSize) {
            showMessage('RequestSize: 최대 요청 크기를 입력해주세요', 'error');
            return false;
          }
          break;
        case 'ModifyRequestBody':
        case 'ModifyResponseBody':
          if (!args.rewriteFunction) {
            showMessage(`${filter.name}: RewriteFunction Bean 이름을 입력해주세요`, 'error');
            return false;
          }
          break;
      }
    }
    return true;
  };

  // 탭 이동 핸들러
  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateBasicInfo()) return;
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!validatePredicates()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateFilters()) return;
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
      showMessage(`라우트가 ${mode === 'create' ? '추가' : '수정'}되었습니다`, 'success');
      handleModalClose();
    } catch (error) {
      console.error('Failed to save route:', error);
      showMessage(`라우트 ${mode === 'create' ? '추가' : '수정'} 실패`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setCurrentStep(0);
    setBasicInfo({ id: '', displayName: '', uri: '', order: 0, enabled: true });
    setPredicates([]);
    setFilters([]);
    onCancel();
  };

  // Review 탭 렌더링
  const renderReview = () => {
    return (
      <Stack spacing={3}>
        {mode === 'edit' && (
          <Alert
            severity={hasChanges ? "warning" : "info"}
            icon={hasChanges ? undefined : <InfoIcon />}
          >
            <Typography variant="body2" fontWeight="bold">
              {hasChanges ? "변경 사항 감지됨" : "변경 사항 없음"}
            </Typography>
            <Typography variant="caption">
              {hasChanges
                ? "수정된 내용이 있습니다. 아래 내용을 확인하고 저장 버튼을 클릭하세요."
                : "현재 저장된 내용과 동일합니다. 변경 후 저장 버튼이 활성화됩니다."}
            </Typography>
          </Alert>
        )}

        {mode === 'create' && (
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2" fontWeight="bold">
              설정 검토
            </Typography>
            <Typography variant="caption">
              아래 내용을 확인하고 저장 버튼을 클릭하세요
            </Typography>
          </Alert>
        )}

        {/* 기본 정보 */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>📌 기본 정보</Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight="bold">Route ID:</Typography>
              <Chip label={basicInfo.id} color="primary" size="small" />
            </Stack>
            {basicInfo.displayName && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight="bold">Display Name:</Typography>
                <Typography variant="body2">{basicInfo.displayName}</Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight="bold">URI:</Typography>
              <Typography variant="body2">{basicInfo.uri}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight="bold">Order:</Typography>
              <Typography variant="body2">{basicInfo.order}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight="bold">Status:</Typography>
              <Chip
                label={basicInfo.enabled ? '활성화' : '비활성화'}
                color={basicInfo.enabled ? 'success' : 'error'}
                size="small"
              />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* Predicates */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>🔹 Predicates ({predicates.length}개)</Typography>
          <Stack spacing={1}>
            {predicates.map((predicate, index) => {
              const config = PREDICATE_CONFIGS[predicate.name];
              return (
                <Box key={index} sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {config?.icon} {config?.label || predicate.name}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      fontSize: '11px',
                      color: 'text.secondary',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {JSON.stringify(predicate.args, null, 2)}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        {/* Filters */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>🔸 Filters ({filters.length}개)</Typography>
          {filters.length === 0 ? (
            <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                필터가 없습니다
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {filters.map((filter, index) => {
                const config = FILTER_CONFIGS[filter.name];
                return (
                  <Box key={index} sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Chip label={`#${index + 1}`} color="secondary" size="small" />
                      <Typography variant="body2" fontWeight="bold">
                        {config?.icon} {config?.label || filter.name}
                      </Typography>
                    </Stack>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        fontSize: '11px',
                        color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {JSON.stringify(filter.args, null, 2)}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider />

        {/* JSON Preview */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>📄 생성될 JSON</Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.50',
              p: 1.5,
              borderRadius: 1,
              maxHeight: '300px',
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              fontSize: '12px'
            }}
          >
            {JSON.stringify({ id: basicInfo.id, uri: basicInfo.uri, order: basicInfo.order, predicates, filters }, null, 2)}
          </Box>
        </Box>
      </Stack>
    );
  };

  const tabLabels = ['1. 기본 정보', '2. Predicates', '3. Filters', '4. 검토'];

  return (
    <Dialog
      open={visible}
      onClose={handleModalClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '700px',
        }
      }}
    >
      <DialogTitle>
        {mode === 'create' ? '새 라우트 추가' : '라우트 수정'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        <Tabs
          value={currentStep}
          onChange={(_, newValue) => setCurrentStep(newValue)}
          sx={{
            flexShrink: 0,
            borderBottom: 1,
            borderColor: 'divider',
            px: 3,
            pt: 2
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            px: 3,
            py: 2
          }}
        >
          {currentStep === 0 && (
            <RouteBasicInfoForm
              value={basicInfo}
              onChange={setBasicInfo}
              readOnly={mode === 'edit'}
            />
          )}

          {currentStep === 1 && (
            <PredicateSelector value={predicates} onChange={setPredicates} />
          )}

          {currentStep === 2 && (
            <FilterSelector value={filters} onChange={setFilters} />
          )}

          {currentStep === 3 && renderReview()}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleModalClose} size="large">취소</Button>
        {currentStep > 0 && (
          <Button onClick={handlePrevious} size="large">이전</Button>
        )}
        {currentStep < 3 ? (
          <Button variant="contained" size="large" onClick={handleNext}>다음</Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            startIcon={<CheckCircleIcon />}
            onClick={handleSave}
            disabled={mode === 'edit' && !hasChanges || saving}
          >
            저장
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
