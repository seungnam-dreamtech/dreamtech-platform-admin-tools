// API Gateway 실제 라우트 관리 페이지
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Alert,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TextField,
  Typography,
  Card,
  CardContent,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

import { gatewayService } from '../../services/gatewayService';
import type { GatewayRoute, RouteMetrics, RouteDefinitionResponse, ActuatorRouteResponse } from '../../types/gateway'
import { convertRouteDefinitionToGatewayRoute } from '../../utils/gatewayConverter';
import { getFilterTypeColor, getPredicateTypeColor } from '../../utils/messageParser';
import { parsePredicateString, parseFilterStrings } from '../../utils/routeParser';
import { RouteFormModal } from '../../components/gateway/RouteFormModal/RouteFormModal';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface RouteWithMetrics extends GatewayRoute {
  metrics?: RouteMetrics;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Statistic 컴포넌트 대체
interface StatisticProps {
  title: string;
  value: number | string;
  suffix?: string;
}

function Statistic({ title, value, suffix }: StatisticProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div">
        {value}{suffix}
      </Typography>
    </Box>
  );
}

// Descriptions 컴포넌트 대체
interface DescriptionItemProps {
  label: string;
  children: React.ReactNode;
}

function DescriptionItem({ label, children }: DescriptionItemProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          px: 2,
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {label}
      </Typography>
      <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
        {children}
      </Box>
    </Box>
  );
}

interface DescriptionsProps {
  children: React.ReactNode;
}

function Descriptions({ children }: DescriptionsProps) {
  return (
    <Paper variant="outlined" sx={{ border: '1px solid', borderColor: 'divider' }}>
      {children}
    </Paper>
  );
}

// Confirm Dialog
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ open, title, content, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{content}</Typography>
      </DialogContent>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel}>취소</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          삭제
        </Button>
      </Box>
    </Dialog>
  );
}

const GatewayRoutes: React.FC = () => {
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteWithMetrics[]>([]);
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<GatewayRoute | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [routeDetail, setRouteDetail] = useState<ActuatorRouteResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedPredicateIndex, setSelectedPredicateIndex] = useState<number | null>(null);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState<number | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>('basic');
  const [routeFormModalVisible, setRouteFormModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteDefinitionResponse | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<GatewayRoute | null>(null);

  // 데이터 로드
  const loadRoutes = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading gateway routes...');
      const routesData = await gatewayService.getRoutes();

      // RouteDefinitionResponse를 GatewayRoute로 변환
      const convertedRoutes = routesData.map((route: RouteDefinitionResponse) => {
        return convertRouteDefinitionToGatewayRoute(route);
      });

      setRoutes(convertedRoutes);
      snackbar.success(`${convertedRoutes.length}개의 라우트를 로드했습니다.`);
    } catch (error) {
      console.error('Failed to load routes:', error);
      setError('라우트 정보를 불러오는데 실패했습니다.');
      snackbar.error('라우트 정보 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      console.log('📊 Loading gateway metrics...');
      const [, routeMetricsData] = await Promise.all([
        gatewayService.getGatewayMetrics().catch(() => null),
        gatewayService.getRouteMetrics().catch(() => [])
      ]);

      setRouteMetrics(routeMetricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadActuatorInfo = async () => {
    try {
      console.log('ℹ️ Loading actuator endpoints...');
      const endpoints = await gatewayService.getActuatorEndpoints();
      console.log('Available endpoints:', endpoints);
    } catch (error) {
      console.error('Failed to load actuator info:', error);
    }
  };

  const refreshRoutes = async () => {
    setLoading(true);
    try {
      await gatewayService.refreshRoutes();
      await loadRoutes();
      snackbar.success('라우트를 새로고침했습니다.');
    } catch (error) {
      console.error('Failed to refresh routes:', error);
      snackbar.error('라우트 새로고침 실패');
    } finally {
      setLoading(false);
    }
  };

  // 라우트 상세 정보 로드 (글로벌 필터 포함)
  const loadRouteDetail = async (routeId: string) => {
    setDetailLoading(true);
    try {
      console.log(`🔍 Loading route detail for: ${routeId}`);
      const detail = await gatewayService.getRoute(routeId);
      console.log('📦 Route detail loaded:', detail);
      console.log('📦 Predicate:', detail.predicate);
      console.log('📦 Filters:', detail.filters);
      setRouteDetail(detail);
    } catch (error) {
      console.error('Failed to load route detail:', error);
      snackbar.error('라우트 상세 정보 로드 실패');
    } finally {
      setDetailLoading(false);
    }
  };

  // 상세 보기 모달 열기
  const handleShowRouteDetail = async (route: GatewayRoute) => {
    setSelectedRoute(route);
    setDetailModalVisible(true);
    setRouteDetail(null);
    // 선택된 인덱스 초기화
    setSelectedPredicateIndex(null);
    setSelectedFilterIndex(null);
    // 탭 초기화
    setActiveTabKey('basic');
    await loadRouteDetail(route.id);
  };

  // 라우트 수정 핸들러
  const handleEditRoute = async (route: GatewayRoute) => {
    console.log('Edit route:', route.id);
    try {
      // routes 엔드포인트에서 RouteDefinitionResponse 형식의 데이터 가져오기
      const routesData = await gatewayService.getRoutes();
      const routeDefinition = routesData.find(r => r.id === route.id);

      if (routeDefinition) {
        // Actuator API의 _genkey_N 형식을 UI 형식으로 변환
        const { convertPredicateArgsFromApi, convertFilterArgsFromApi } = await import('../../utils/gatewayApiConverter');

        const convertedPredicates = routeDefinition.predicates?.map(convertPredicateArgsFromApi) || [];
        const convertedFilters = routeDefinition.filters?.map(convertFilterArgsFromApi) || [];

        const convertedRouteDefinition: RouteDefinitionResponse = {
          ...routeDefinition,
          predicates: convertedPredicates,
          filters: convertedFilters
        };

        console.log('📝 수정 모드 데이터 변환:', {
          원본: routeDefinition,
          변환후: convertedRouteDefinition
        });

        setEditingRoute(convertedRouteDefinition);
        setRouteFormModalVisible(true);
      } else {
        snackbar.error('라우트 정보를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('Failed to load route for editing:', error);
      snackbar.error('라우트 정보 로드 실패');
    }
  };

  // 라우트 삭제 핸들러
  const handleDeleteRoute = (route: GatewayRoute) => {
    console.log('🗑️ handleDeleteRoute called for:', route.id);
    setRouteToDelete(route);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!routeToDelete) return;

    console.log('✅ Delete confirmed for:', routeToDelete.id);
    try {
      setLoading(true);
      console.log('🔄 Calling deleteRoute API...');
      await gatewayService.deleteRoute(routeToDelete.id);
      console.log('✅ Delete API call successful');
      snackbar.success(`라우트 "${routeToDelete.id}"가 삭제되었습니다.`);

      console.log('🔄 Reloading routes...');
      await loadRoutes(); // 라우트 목록 새로고침
      console.log('✅ Routes reloaded');
    } catch (error) {
      console.error('❌ Failed to delete route:', error);
      snackbar.error('라우트 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setRouteToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('❌ Delete cancelled for:', routeToDelete?.id);
    setConfirmDialogOpen(false);
    setRouteToDelete(null);
  };

  // 서비스별 그룹핑 및 통계 계산을 위한 헬퍼 함수
  const getServiceFromUri = (uri: string): string => {
    if (!uri) return 'unknown';

    // Load Balancer 서비스 (Spring Cloud 내부 서비스)
    if (uri.startsWith('lb://')) {
      return uri.replace('lb://', '').split('/')[0]; // lb://service-name/path → service-name
    }

    // Forward 프록시
    if (uri.startsWith('forward:')) {
      return 'forward-proxy';
    }

    // HTTP/HTTPS 외부 서비스
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      try {
        const url = new URL(uri);
        return `external:${url.hostname}`; // http://example.com → external:example.com
      } catch {
        return 'external:invalid-url';
      }
    }

    // 기타 프로토콜 (ws://, wss://, etc.)
    const protocolMatch = uri.match(/^([a-z]+):\/\//);
    if (protocolMatch) {
      try {
        const url = new URL(uri);
        return `${protocolMatch[1]}:${url.hostname}`;
      } catch {
        return `${protocolMatch[1]}:unknown`;
      }
    }

    // 알 수 없는 형식
    return 'unknown';
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadRoutes();
    loadMetrics();
    loadActuatorInfo();
  }, []);

  // 선택된 서비스가 더 이상 존재하지 않으면 '전체 서비스'로 전환
  useEffect(() => {
    if (selectedService !== 'all') {
      const serviceExists = routes.some(route => getServiceFromUri(route.uri) === selectedService);

      if (!serviceExists) {
        console.log(`🔄 Service "${selectedService}" no longer exists, switching to "all"`);
        setSelectedService('all');
      }
    }
  }, [routes, selectedService]);

  // 라우트와 메트릭스 데이터 결합
  const routesWithMetrics = routes.map(route => ({
    ...route,
    metrics: routeMetrics.find(metric => metric.routeId === route.id)
  }));

  const serviceGroups = routesWithMetrics.reduce((groups, route) => {
    const service = getServiceFromUri(route.uri);
    if (!groups[service]) {
      groups[service] = [];
    }
    groups[service].push(route);
    return groups;
  }, {} as Record<string, RouteWithMetrics[]>);

  // 전체 통계 계산 (실제 라우트 정의 기반)
  const activeRoutes = routesWithMetrics.filter(route => route.enabled).length;
  const servicesCount = Object.keys(serviceGroups).length;

  // 현재 선택된 서비스의 라우트 필터링 + 키워드 검색
  const getFilteredRoutes = () => {
    let filtered = selectedService === 'all'
      ? routesWithMetrics
      : serviceGroups[selectedService] || [];

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (route) =>
          route.id.toLowerCase().includes(keyword) ||
          route.uri.toLowerCase().includes(keyword) ||
          route.conditions.path?.some(p => p.toLowerCase().includes(keyword))
      );
    }

    return filtered;
  };

  const filteredRoutes = getFilteredRoutes();

  // 테이블 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Route ID',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'uri',
      headerName: 'Service URI',
      flex: 2,
      minWidth: 220,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '12px',
              color: 'primary.main',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'path',
      headerName: 'Path',
      flex: 2.5,
      minWidth: 220,
      renderCell: (params) => {
        const paths = params.row.conditions.path || [];

        if (paths.length === 0) return <Typography color="text.secondary">-</Typography>;

        return (
          <Box>
            {paths.slice(0, 1).map((path: string, index: number) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontSize: '12px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  color: 'primary.main',
                  fontWeight: 500,
                }}
              >
                {path}
              </Typography>
            ))}
            {paths.length > 1 && (
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      모든 경로:
                    </Typography>
                    {paths.map((p: string, i: number) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '11px' }}
                      >
                        {p}
                      </Typography>
                    ))}
                  </Box>
                }
              >
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#666',
                    cursor: 'pointer',
                  }}
                >
                  +{paths.length - 1}개 더
                </Typography>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: 'method',
      headerName: 'Method',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const methods = params.row.conditions.method || [];

        if (methods.length === 0) return <Typography color="text.secondary">ALL</Typography>;

        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {methods.map((method: string, index: number) => {
              let color: 'success' | 'primary' | 'warning' | 'error' | 'secondary' | 'default' = 'default';
              switch (method) {
                case 'GET': color = 'success'; break;
                case 'POST': color = 'primary'; break;
                case 'PUT': color = 'warning'; break;
                case 'DELETE': color = 'error'; break;
                case 'PATCH': color = 'secondary'; break;
              }

              return (
                <Chip
                  key={index}
                  label={method}
                  color={color}
                  size="small"
                  sx={{ fontSize: '11px', fontWeight: 'bold', height: '22px' }}
                />
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: 'order',
      headerName: 'Priority',
      flex: 0.5,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      sortable: true,
      renderCell: (params) => {
        const order = params.value as number;
        let color: 'error' | 'warning' | 'success' = 'success';

        if (order < 0) {
          color = 'error';
        } else if (order < 100) {
          color = 'warning';
        } else {
          color = 'success';
        }

        return (
          <Chip
            label={order}
            color={color}
            size="small"
            sx={{
              fontSize: '12px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              minWidth: '40px',
            }}
          />
        );
      },
    },
    {
      field: 'enabled',
      headerName: 'Status',
      flex: 0.5,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'error'}
          size="small"
          sx={{
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.6,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="수정">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditRoute(params.row as RouteWithMetrics);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                console.log('🗑️ Delete button clicked for route:', params.row.id);
                e.stopPropagation();
                handleDeleteRoute(params.row as RouteWithMetrics);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
            API Gateway 라우트 ({filteredRoutes.length}개)
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
            {routes.length}개 라우트 | 활성 {activeRoutes}개 | 서비스 {servicesCount}개
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshRoutes}
            disabled={loading}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingRoute(undefined);
              setRouteFormModalVisible(true);
            }}
          >
            라우트 추가
          </Button>
        </Stack>
      </Box>

      {/* 에러 표시 */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          action={
            <Button size="small" onClick={loadRoutes}>
              다시 시도
            </Button>
          }
        >
          <Typography variant="body2" fontWeight="bold">데이터 로드 오류</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {/* 필터 및 검색 */}
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <FormControl sx={{ width: 250 }}>
          <InputLabel>서비스 필터</InputLabel>
          <Select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            label="서비스 필터"
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            }
          >
            <MenuItem value="all">전체 서비스 ({routesWithMetrics.length})</MenuItem>
            {Object.keys(serviceGroups).map(service => (
              <MenuItem key={service} value={service}>
                {service} ({serviceGroups[service].length})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          placeholder="Route ID, URI, Path로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          sx={{ flex: 1, maxWidth: 500 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchKeyword && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchKeyword('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* 테이블 */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRoutes}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          onRowClick={(params: GridRowParams) => {
            handleShowRouteDetail(params.row as RouteWithMetrics);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex !important',
              alignItems: 'center !important',
              padding: '0 16px !important',
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
        />
      </Box>

      {/* 라우트 추가/수정 모달 */}
      <RouteFormModal
        visible={routeFormModalVisible}
        onCancel={() => {
          setRouteFormModalVisible(false);
          setEditingRoute(undefined);
        }}
        onSave={async (route) => {
          try {
            let addedRouteUri: string | undefined;

            if (editingRoute) {
              // 수정 모드
              await gatewayService.updateRoute(editingRoute.id, route);
              snackbar.success('라우트가 수정되었습니다');
            } else {
              // 추가 모드
              await gatewayService.addRoute(route);
              snackbar.success('라우트가 추가되었습니다');
              addedRouteUri = route.uri; // 추가된 라우트의 URI 저장
            }

            // 라우트 새로고침 (변경사항 반영)
            await gatewayService.refreshRoutes();

            // 목록 다시 로드
            await loadRoutes();

            // 새 라우트 추가 시, 해당 서비스로 자동 전환
            if (addedRouteUri) {
              const newService = getServiceFromUri(addedRouteUri);
              console.log(`📍 New route added to service: ${newService}, switching selection`);
              setSelectedService(newService);
            }

            setRouteFormModalVisible(false);
            setEditingRoute(undefined);
          } catch (error) {
            console.error('라우트 저장 실패:', error);
            throw error; // RouteFormModal의 에러 처리로 전달
          }
        }}
        initialData={editingRoute}
        mode={editingRoute ? 'edit' : 'create'}
      />

      {/* 상세 정보 모달 */}
      <Dialog
        open={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setRouteDetail(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>라우트 상세 정보: {selectedRoute?.id}</DialogTitle>
        <DialogContent>
          {selectedRoute && (
            <Box sx={{ position: 'relative', minHeight: 400 }}>
              {detailLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <Tabs value={activeTabKey} onChange={(_, newValue) => setActiveTabKey(newValue)}>
                <Tab label="기본 정보" value="basic" />
                <Tab label="Predicates" value="predicates" />
                <Tab label="Filters" value="filters" />
                <Tab label="원시 데이터" value="raw" />
              </Tabs>

              {/* 1탭: 기본 정보 + 메트릭스 */}
              <TabPanel value={activeTabKey} index="basic">
                <Stack spacing={2}>
                  {/* 라우트 기본 정보 */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>라우트 정보</Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 30%', minWidth: 200 }}>
                          <Typography variant="body2" fontWeight="bold">Route ID:</Typography>
                          <Typography
                            component="code"
                            sx={{
                              bgcolor: 'grey.100',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                            }}
                          >
                            {selectedRoute.id}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 30%', minWidth: 200 }}>
                          <Typography variant="body2" fontWeight="bold">URI:</Typography>
                          <Typography>{selectedRoute.uri}</Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 30%', minWidth: 200 }}>
                          <Typography variant="body2" fontWeight="bold">Order:</Typography>
                          <Badge badgeContent={selectedRoute.order} color="warning" />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* 메트릭스 정보 */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>라우트 메트릭스</Typography>
                      {routeMetrics.find(metric => metric.routeId === selectedRoute.id) ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                          <Card variant="outlined">
                            <CardContent>
                              <Statistic
                                title="총 요청 수"
                                value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.requestCount || 0}
                              />
                            </CardContent>
                          </Card>
                          <Card variant="outlined">
                            <CardContent>
                              <Statistic
                                title="성공 요청"
                                value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.successCount || 0}
                              />
                            </CardContent>
                          </Card>
                          <Card variant="outlined">
                            <CardContent>
                              <Statistic
                                title="실패 요청"
                                value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.errorCount || 0}
                              />
                            </CardContent>
                          </Card>
                          <Card variant="outlined">
                            <CardContent>
                              <Statistic
                                title="평균 응답시간"
                                value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.averageResponseTime || 0}
                                suffix="ms"
                              />
                            </CardContent>
                          </Card>
                        </Box>
                      ) : (
                        <Alert severity="info">메트릭스 데이터가 없습니다.</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </TabPanel>

              {/* 2탭: Predicates */}
              <TabPanel value={activeTabKey} index="predicates">
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Predicates (조건) - {routeDetail ? (parsePredicateString(routeDetail.predicate).length || 0) : '로딩 중...'}개
                      </Typography>
                      {routeDetail ? (
                        (() => {
                          const parsedPredicates = parsePredicateString(routeDetail.predicate);
                          return parsedPredicates.length > 0 ? (
                            <Stack spacing={2}>
                              <FormControl fullWidth size="small">
                                <InputLabel>조건 선택</InputLabel>
                                <Select
                                  value={selectedPredicateIndex !== null ? String(selectedPredicateIndex) : ''}
                                  onChange={(e) => setSelectedPredicateIndex(e.target.value === '' ? null : Number(e.target.value))}
                                  label="조건 선택"
                                >
                                  <MenuItem value="">
                                    <em>선택 해제</em>
                                  </MenuItem>
                                  {parsedPredicates.map((predicate, index) => (
                                    <MenuItem key={index} value={String(index)}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                          label={predicate.type}
                                          size="small"
                                          sx={{ bgcolor: getPredicateTypeColor(predicate.type) }}
                                        />
                                        <Typography>{predicate.description}</Typography>
                                      </Stack>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {/* 선택된 Predicate 상세 정보 */}
                              {selectedPredicateIndex !== null && parsedPredicates[selectedPredicateIndex] && (
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Descriptions>
                                    <DescriptionItem label="타입">
                                      <Chip
                                        label={parsedPredicates[selectedPredicateIndex].type}
                                        size="small"
                                        sx={{ bgcolor: getPredicateTypeColor(parsedPredicates[selectedPredicateIndex].type) }}
                                      />
                                    </DescriptionItem>
                                    <DescriptionItem label="설명">
                                      <Typography fontWeight="bold">
                                        {parsedPredicates[selectedPredicateIndex].description}
                                      </Typography>
                                    </DescriptionItem>

                                    {/* 파싱된 인자들을 키-값 형태로 표시 */}
                                    {Object.keys(parsedPredicates[selectedPredicateIndex].args).length > 0 && (
                                      <DescriptionItem label="설정 파라미터">
                                        <Stack spacing={1} sx={{ width: '100%' }}>
                                          {Object.entries(parsedPredicates[selectedPredicateIndex].args).map(([key, value]) => (
                                            <Box
                                              key={key}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                p: 1,
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                              }}
                                            >
                                              <Typography
                                                fontWeight="bold"
                                                sx={{ minWidth: 120, flexShrink: 0, color: 'primary.main' }}
                                              >
                                                {key}:
                                              </Typography>
                                              <Box sx={{ flex: 1, wordBreak: 'break-word' }}>
                                                {Array.isArray(value) ? (
                                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                    {value.map((v, i) => (
                                                      <Chip key={i} label={v} color="success" size="small" />
                                                    ))}
                                                  </Stack>
                                                ) : typeof value === 'boolean' ? (
                                                  <Chip label={value ? 'true' : 'false'} color={value ? 'success' : 'default'} size="small" />
                                                ) : (
                                                  <Typography
                                                    component="code"
                                                    sx={{
                                                      bgcolor: 'grey.100',
                                                      px: 0.5,
                                                      py: 0.25,
                                                      borderRadius: 0.5,
                                                      fontSize: '11px',
                                                    }}
                                                  >
                                                    {String(value)}
                                                  </Typography>
                                                )}
                                              </Box>
                                            </Box>
                                          ))}
                                        </Stack>
                                      </DescriptionItem>
                                    )}

                                    {/* 메타데이터 (참고용) */}
                                    {parsedPredicates[selectedPredicateIndex].metadata && Object.keys(parsedPredicates[selectedPredicateIndex].metadata).length > 0 && (
                                      <DescriptionItem label="메타데이터 (참고)">
                                        <Stack spacing={1} sx={{ width: '100%' }}>
                                          {Object.entries(parsedPredicates[selectedPredicateIndex].metadata!).map(([key, value]) => (
                                            <Box
                                              key={key}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                p: 1,
                                                bgcolor: 'grey.50',
                                                border: '1px solid',
                                                borderColor: 'grey.300',
                                                borderRadius: 1,
                                              }}
                                            >
                                              <Typography
                                                fontWeight="bold"
                                                sx={{ minWidth: 120, flexShrink: 0, color: 'text.secondary' }}
                                              >
                                                {key}:
                                              </Typography>
                                              <Box sx={{ flex: 1, wordBreak: 'break-word' }}>
                                                {typeof value === 'boolean' ? (
                                                  <Chip label={value ? 'true' : 'false'} size="small" />
                                                ) : (
                                                  <Typography color="text.secondary">{String(value)}</Typography>
                                                )}
                                              </Box>
                                            </Box>
                                          ))}
                                        </Stack>
                                      </DescriptionItem>
                                    )}

                                    <DescriptionItem label="원시 설정">
                                      <Box
                                        component="pre"
                                        sx={{
                                          bgcolor: 'grey.50',
                                          p: 1,
                                          borderRadius: 1,
                                          fontSize: '11px',
                                          m: 0,
                                          fontFamily: 'Monaco, Consolas, monospace',
                                          maxHeight: 150,
                                          overflow: 'auto',
                                          width: '100%',
                                        }}
                                      >
                                        {parsedPredicates[selectedPredicateIndex].raw}
                                      </Box>
                                    </DescriptionItem>
                                  </Descriptions>
                                </Paper>
                              )}
                            </Stack>
                          ) : (
                            <Alert severity="info">설정된 Predicate가 없습니다.</Alert>
                          );
                        })()
                      ) : (
                        <Alert severity="warning">Predicate 정보를 로드하고 있습니다...</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </TabPanel>

              {/* 3탭: Filters */}
              <TabPanel value={activeTabKey} index="filters">
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Filters (필터) - {routeDetail ? routeDetail.filters?.length || 0 : '로딩 중...'}개
                      </Typography>
                      {routeDetail ? (
                        (() => {
                          const parsedFilters = parseFilterStrings(routeDetail.filters || []);
                          return parsedFilters.length > 0 ? (
                            <Stack spacing={2}>
                              <FormControl fullWidth size="small">
                                <InputLabel>필터 선택</InputLabel>
                                <Select
                                  value={selectedFilterIndex !== null ? String(selectedFilterIndex) : ''}
                                  onChange={(e) => setSelectedFilterIndex(e.target.value === '' ? null : Number(e.target.value))}
                                  label="필터 선택"
                                >
                                  <MenuItem value="">
                                    <em>선택 해제</em>
                                  </MenuItem>
                                  {parsedFilters.map((filter, index) => (
                                    <MenuItem key={index} value={String(index)}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                          label={filter.name}
                                          size="small"
                                          sx={{ bgcolor: getFilterTypeColor(filter.name) }}
                                        />
                                        <Typography>{filter.description}</Typography>
                                      </Stack>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {/* 선택된 Filter 상세 정보 */}
                              {selectedFilterIndex !== null && parsedFilters[selectedFilterIndex] && (
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Descriptions>
                                    <DescriptionItem label="타입">
                                      <Chip
                                        label={parsedFilters[selectedFilterIndex].name}
                                        size="small"
                                        sx={{ bgcolor: getFilterTypeColor(parsedFilters[selectedFilterIndex].name) }}
                                      />
                                    </DescriptionItem>
                                    <DescriptionItem label="설명">
                                      <Typography fontWeight="bold">
                                        {parsedFilters[selectedFilterIndex].description}
                                      </Typography>
                                    </DescriptionItem>
                                    {parsedFilters[selectedFilterIndex].order !== undefined && (
                                      <DescriptionItem label="실행 순서">
                                        <Chip label={parsedFilters[selectedFilterIndex].order} color="primary" size="small" />
                                      </DescriptionItem>
                                    )}

                                    {/* 파싱된 인자들을 키-값 형태로 표시 */}
                                    {Object.keys(parsedFilters[selectedFilterIndex].args).length > 0 && (
                                      <DescriptionItem label="설정값">
                                        <Stack spacing={1} sx={{ width: '100%' }}>
                                          {Object.entries(parsedFilters[selectedFilterIndex].args).map(([key, value]) => (
                                            <Box
                                              key={key}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                p: 1,
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                              }}
                                            >
                                              <Typography
                                                fontWeight="bold"
                                                sx={{ minWidth: 120, flexShrink: 0, color: 'primary.main' }}
                                              >
                                                {key}:
                                              </Typography>
                                              <Box sx={{ flex: 1, wordBreak: 'break-word' }}>
                                                {Array.isArray(value) ? (
                                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                    {value.map((v, i) => (
                                                      <Chip key={i} label={v} color="success" size="small" />
                                                    ))}
                                                  </Stack>
                                                ) : typeof value === 'boolean' ? (
                                                  <Chip label={value ? 'true' : 'false'} color={value ? 'success' : 'default'} size="small" />
                                                ) : typeof value === 'number' ? (
                                                  <Chip label={value} color="secondary" size="small" />
                                                ) : (
                                                  <Typography
                                                    component="code"
                                                    sx={{
                                                      bgcolor: 'grey.100',
                                                      px: 0.5,
                                                      py: 0.25,
                                                      borderRadius: 0.5,
                                                      fontSize: '11px',
                                                    }}
                                                  >
                                                    {String(value)}
                                                  </Typography>
                                                )}
                                              </Box>
                                            </Box>
                                          ))}
                                        </Stack>
                                      </DescriptionItem>
                                    )}

                                    <DescriptionItem label="필터 카테고리">
                                      <Chip
                                        label={
                                          parsedFilters[selectedFilterIndex].name.includes('Request') ? '요청 변환' :
                                          parsedFilters[selectedFilterIndex].name.includes('Response') ? '응답 변환' :
                                          parsedFilters[selectedFilterIndex].name.includes('Path') ? 'URL 변환' :
                                          (parsedFilters[selectedFilterIndex].name.includes('Rate') || parsedFilters[selectedFilterIndex].name.includes('Circuit') || parsedFilters[selectedFilterIndex].name.includes('Retry')) ? '제어 & 안정성' :
                                          '기타'
                                        }
                                        color="primary"
                                        size="small"
                                      />
                                    </DescriptionItem>
                                    <DescriptionItem label="원시 설정">
                                      <Box
                                        component="pre"
                                        sx={{
                                          bgcolor: 'grey.50',
                                          p: 1,
                                          borderRadius: 1,
                                          fontSize: '11px',
                                          m: 0,
                                          fontFamily: 'Monaco, Consolas, monospace',
                                          maxHeight: 150,
                                          overflow: 'auto',
                                          width: '100%',
                                        }}
                                      >
                                        {parsedFilters[selectedFilterIndex].raw}
                                      </Box>
                                    </DescriptionItem>
                                  </Descriptions>
                                </Paper>
                              )}
                            </Stack>
                          ) : (
                            <Alert severity="info">적용된 필터가 없습니다.</Alert>
                          );
                        })()
                      ) : (
                        <Alert severity="warning">필터 정보를 로드하고 있습니다...</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </TabPanel>

              {/* 4탭: 원시 데이터 */}
              <TabPanel value={activeTabKey} index="raw">
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>라우트 정의 (routedefinitions)</Typography>
                      <Box
                        component="pre"
                        sx={{
                          bgcolor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(selectedRoute, null, 2)}
                      </Box>
                    </CardContent>
                  </Card>

                  {routeDetail && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>실행 시간 정보 (routes/{'{id}'})</Typography>
                        <Box
                          component="pre"
                          sx={{
                            bgcolor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            maxHeight: 200,
                            overflow: 'auto',
                          }}
                        >
                          {JSON.stringify(routeDetail, null, 2)}
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </TabPanel>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="라우트 삭제"
        content={`정말로 라우트 "${routeToDelete?.id}"를 삭제하시겠습니까?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Stack>
  );
};

export default GatewayRoutes;
