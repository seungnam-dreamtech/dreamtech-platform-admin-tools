// API Gateway 실제 라우트 관리 페이지
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Alert,
  Badge,
  Tooltip,
  Modal,
  Spin,
  Select,
  Tabs,
  Descriptions,
  App,
  Input,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
import type { ColumnsType } from 'antd/es/table';
import { gatewayService } from '../../services/gatewayService';
import type { GatewayRoute, RouteMetrics, RouteDefinitionResponse, ActuatorRouteResponse } from '../../types/gateway'
import { convertRouteDefinitionToGatewayRoute } from '../../utils/gatewayConverter';
import { getFilterTypeColor, getPredicateTypeColor } from '../../utils/messageParser';
import { parsePredicateString, parseFilterStrings } from '../../utils/routeParser';
import { RouteFormModal } from '../../components/gateway/RouteFormModal/RouteFormModal';
import styles from './GatewayRoutes.module.css';

const { TabPane } = Tabs;
const { Search } = Input;

interface RouteWithMetrics extends GatewayRoute {
  metrics?: RouteMetrics;
}

const GatewayRoutes: React.FC = () => {
  const { modal } = App.useApp();

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
      message.success(`${convertedRoutes.length}개의 라우트를 로드했습니다.`);
    } catch (error) {
      console.error('Failed to load routes:', error);
      setError('라우트 정보를 불러오는데 실패했습니다.');
      message.error('라우트 정보 로드 실패');
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
      message.success('라우트를 새로고침했습니다.');
    } catch (error) {
      console.error('Failed to refresh routes:', error);
      message.error('라우트 새로고침 실패');
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
      message.error('라우트 상세 정보 로드 실패');
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
        message.error('라우트 정보를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('Failed to load route for editing:', error);
      message.error('라우트 정보 로드 실패');
    }
  };

  // 라우트 삭제 핸들러
  const handleDeleteRoute = (route: GatewayRoute) => {
    console.log('🗑️ handleDeleteRoute called for:', route.id);

    modal.confirm({
      title: '라우트 삭제',
      content: `정말로 라우트 "${route.id}"를 삭제하시겠습니까?`,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      centered: true,
      maskClosable: false,
      keyboard: true,
      zIndex: 1000,
      onOk: async () => {
        console.log('✅ Delete confirmed for:', route.id);
        try {
          setLoading(true);
          console.log('🔄 Calling deleteRoute API...');
          await gatewayService.deleteRoute(route.id);
          console.log('✅ Delete API call successful');
          message.success(`라우트 "${route.id}"가 삭제되었습니다.`);

          console.log('🔄 Reloading routes...');
          await loadRoutes(); // 라우트 목록 새로고침
          console.log('✅ Routes reloaded');
        } catch (error) {
          console.error('❌ Failed to delete route:', error);
          message.error('라우트 삭제에 실패했습니다.');
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        console.log('❌ Delete cancelled for:', route.id);
      },
    });
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
  const columns: ColumnsType<RouteWithMetrics> = [
    {
      title: <span style={{ fontSize: '11px' }}>Route ID</span>,
      dataIndex: 'id',
      key: 'id',
      width: 180,
      render: (id: string) => (
        <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '3px', fontWeight: 500 }}>
          {id}
        </code>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>Service URI</span>,
      dataIndex: 'uri',
      key: 'uri',
      width: 250,
      ellipsis: true,
      render: (uri: string) => (
        <Tooltip title={uri}>
          <span style={{ fontSize: '11px', color: '#1890ff' }}>
            {uri}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Path',
      key: 'path',
      width: 220,
      render: (_, record) => {
        const paths = record.conditions.path || [];

        if (paths.length === 0) return <Text type="secondary">-</Text>;

        return (
          <div>
            {paths.slice(0, 1).map((path, index) => (
              <div key={index} style={{
                fontSize: '12px',
                fontFamily: 'Monaco, Consolas, monospace',
                background: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                marginBottom: '2px',
                color: '#1890ff'
              }}>
                {path}
              </div>
            ))}
            {paths.length > 1 && (
              <Tooltip title={
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>모든 경로:</div>
                  {paths.map((p, i) => (
                    <div key={i} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      {p}
                    </div>
                  ))}
                </div>
              }>
                <Text style={{
                  fontSize: '10px',
                  color: '#666',
                  cursor: 'pointer'
                }}>
                  +{paths.length - 1}개 더
                </Text>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Method',
      key: 'method',
      width: 120,
      render: (_, record) => {
        const methods = record.conditions.method || [];

        if (methods.length === 0) return <Text type="secondary">ALL</Text>;

        return (
          <Space wrap>
            {methods.map((method, index) => {
              let color = 'default';
              switch (method) {
                case 'GET': color = 'green'; break;
                case 'POST': color = 'blue'; break;
                case 'PUT': color = 'orange'; break;
                case 'DELETE': color = 'red'; break;
                case 'PATCH': color = 'purple'; break;
              }

              return (
                <Tag key={index} color={color} style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  {method}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'order',
      key: 'priority',
      width: 80,
      sorter: (a, b) => a.order - b.order,
      render: (order: number) => {
        let color = 'default';

        if (order < 0) {
          color = 'red';
        } else if (order < 100) {
          color = 'orange';
        } else {
          color = 'green';
        }

        return (
          <div style={{ textAlign: 'center' }}>
            <Tag color={color} style={{
              fontSize: '11px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              minWidth: '36px',
              textAlign: 'center'
            }}>
              {order}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'status',
      width: 80,
      sorter: (a, b) => Number(b.enabled) - Number(a.enabled),
      render: (enabled: boolean) => (
        <div style={{ textAlign: 'center' }}>
          <Tag color={enabled ? 'green' : 'red'} style={{
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {enabled ? 'Active' : 'Inactive'}
          </Tag>
        </div>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="수정">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditRoute(record);
              }}
            />
          </Tooltip>
          <Tooltip title="삭제">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={(e) => {
                console.log('🗑️ Delete button clicked for route:', record.id);
                e.stopPropagation();
                handleDeleteRoute(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            API Gateway 라우트 ({filteredRoutes.length}개)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            {routes.length}개 라우트 | 활성 {activeRoutes}개 | 서비스 {servicesCount}개
          </span>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refreshRoutes} loading={loading}>
            새로고침
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRoute(undefined);
              setRouteFormModalVisible(true);
            }}
          >
            라우트 추가
          </Button>
        </Space>
      </div>

      {/* 에러 표시 */}
      {error && (
        <Alert
          message="데이터 로드 오류"
          description={error}
          type="error"
          closable
          action={
            <Button size="small" onClick={loadRoutes}>
              다시 시도
            </Button>
          }
        />
      )}

      {/* 필터 및 검색 */}
      <Space style={{ width: '100%' }} size="middle">
        <Select
          placeholder="서비스 필터"
          allowClear
          style={{ width: 250 }}
          value={selectedService}
          onChange={setSelectedService}
          suffixIcon={<FilterOutlined />}
          showSearch
          filterOption={(input, option) => {
            const service = option?.value === 'all' ? '전체 서비스' : option?.value || '';
            return service.toLowerCase().includes(input.toLowerCase());
          }}
          options={[
            { label: `전체 서비스 (${routesWithMetrics.length})`, value: 'all' },
            ...Object.keys(serviceGroups).map(service => ({
              label: `${service} (${serviceGroups[service].length})`,
              value: service,
            })),
          ]}
        />
        <Search
          placeholder="Route ID, URI, Path로 검색"
          allowClear
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ flex: 1, maxWidth: 500 }}
        />
      </Space>

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredRoutes}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: (e) => {
            // 버튼 클릭인 경우 행 클릭 이벤트 무시
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('.ant-btn')) {
              console.log('🚫 Row click ignored - button clicked');
              return;
            }
            handleShowRouteDetail(record);
          },
          style: { cursor: 'pointer' }
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 1200 }}
      />

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
              message.success('라우트가 수정되었습니다');
            } else {
              // 추가 모드
              await gatewayService.addRoute(route);
              message.success('라우트가 추가되었습니다');
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
      <Modal
        title={`라우트 상세 정보: ${selectedRoute?.id}`}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setRouteDetail(null);
        }}
        footer={null}
        width={1000}
      >
        {selectedRoute && (
          <Spin spinning={detailLoading}>
            <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
              {/* 1탭: 기본 정보 + 메트릭스 */}
              <TabPane tab="기본 정보" key="basic">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {/* 라우트 기본 정보 */}
                  <Card size="small" title="라우트 정보">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text strong>Route ID:</Text>
                        <br />
                        <Text code>{selectedRoute.id}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>URI:</Text>
                        <br />
                        <Text>{selectedRoute.uri}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>Order:</Text>
                        <br />
                        <Badge count={selectedRoute.order} color="orange" />
                      </Col>
                    </Row>
                  </Card>

                  {/* 메트릭스 정보 */}
                  <Card size="small" title="라우트 메트릭스">
                    {routeMetrics.find(metric => metric.routeId === selectedRoute.id) ? (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Card>
                            <Statistic
                              title="총 요청 수"
                              value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.requestCount || 0}
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card>
                            <Statistic
                              title="성공 요청"
                              value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.successCount || 0}
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card>
                            <Statistic
                              title="실패 요청"
                              value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.errorCount || 0}
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card>
                            <Statistic
                              title="평균 응답시간"
                              value={routeMetrics.find(metric => metric.routeId === selectedRoute.id)?.averageResponseTime || 0}
                              suffix="ms"
                            />
                          </Card>
                        </Col>
                      </Row>
                    ) : (
                      <Alert message="메트릭스 데이터가 없습니다." type="info" />
                    )}
                  </Card>
                </Space>
              </TabPane>

              {/* 2탭: Predicates */}
              <TabPane tab="Predicates" key="predicates">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card size="small" title={`Predicates (조건) - ${routeDetail ? (parsePredicateString(routeDetail.predicate).length || 0) : '로딩 중...'}개`}>
                    {routeDetail ? (
                      (() => {
                        const parsedPredicates = parsePredicateString(routeDetail.predicate);
                        return parsedPredicates.length > 0 ? (
                          <Space direction="vertical" style={{ width: '100%', gap: '12px' }}>
                            <Select
                              placeholder="조건을 선택하여 상세 정보를 확인하세요"
                              style={{ width: '100%' }}
                              size="small"
                              value={selectedPredicateIndex}
                              onChange={(value) => setSelectedPredicateIndex(value)}
                              allowClear
                              onClear={() => setSelectedPredicateIndex(null)}
                              options={parsedPredicates.map((predicate, index) => ({
                                value: index,
                                label: (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Tag color={getPredicateTypeColor(predicate.type)} style={{ margin: 0 }}>
                                      {predicate.type}
                                    </Tag>
                                    <Text>{predicate.description}</Text>
                                  </div>
                                )
                              }))}
                            />

                            {/* 선택된 Predicate 상세 정보 */}
                            {selectedPredicateIndex !== null && parsedPredicates[selectedPredicateIndex] && (
                              <Card
                                size="small"
                                style={{
                                  background: '#fafafa',
                                  border: '1px solid #d9d9d9'
                                }}
                              >
                                <Descriptions size="small" column={1} bordered>
                                  <Descriptions.Item label="타입">
                                    <Tag color={getPredicateTypeColor(parsedPredicates[selectedPredicateIndex].type)}>
                                      {parsedPredicates[selectedPredicateIndex].type}
                                    </Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="설명">
                                    <Text strong>{parsedPredicates[selectedPredicateIndex].description}</Text>
                                  </Descriptions.Item>

                                  {/* 파싱된 인자들을 키-값 형태로 표시 */}
                                  {Object.keys(parsedPredicates[selectedPredicateIndex].args).length > 0 && (
                                    <Descriptions.Item label="설정 파라미터">
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                                        {Object.entries(parsedPredicates[selectedPredicateIndex].args).map(([key, value]) => (
                                          <div key={key} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            padding: '6px 8px',
                                            background: '#fff',
                                            border: '1px solid #e8e8e8',
                                            borderRadius: '4px',
                                            maxWidth: '100%',
                                            overflow: 'hidden'
                                          }}>
                                            <Text strong style={{ minWidth: '120px', flexShrink: 0, color: '#1890ff' }}>
                                              {key}:
                                            </Text>
                                            <div style={{
                                              flex: 1,
                                              minWidth: 0,
                                              wordBreak: 'break-word',
                                              overflowWrap: 'break-word'
                                            }}>
                                              {Array.isArray(value) ? (
                                                <Space wrap>
                                                  {value.map((v, i) => (
                                                    <Tag key={i} color="green" style={{
                                                      maxWidth: '100%',
                                                      whiteSpace: 'normal',
                                                      wordBreak: 'break-word'
                                                    }}>{v}</Tag>
                                                  ))}
                                                </Space>
                                              ) : typeof value === 'boolean' ? (
                                                <Tag color={value ? 'success' : 'default'}>{value ? 'true' : 'false'}</Tag>
                                              ) : (
                                                <code style={{
                                                  background: '#f5f5f5',
                                                  padding: '2px 6px',
                                                  borderRadius: '3px',
                                                  fontSize: '11px',
                                                  wordBreak: 'break-all',
                                                  whiteSpace: 'pre-wrap',
                                                  display: 'inline-block',
                                                  maxWidth: '100%'
                                                }}>{String(value)}</code>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </Descriptions.Item>
                                  )}

                                  {/* 메타데이터 (참고용) */}
                                  {parsedPredicates[selectedPredicateIndex].metadata && Object.keys(parsedPredicates[selectedPredicateIndex].metadata).length > 0 && (
                                    <Descriptions.Item label="메타데이터 (참고)">
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                                        {Object.entries(parsedPredicates[selectedPredicateIndex].metadata!).map(([key, value]) => (
                                          <div key={key} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            padding: '6px 8px',
                                            background: '#f9f9f9',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '4px',
                                            maxWidth: '100%',
                                            overflow: 'hidden'
                                          }}>
                                            <Text strong style={{ minWidth: '120px', flexShrink: 0, color: '#8c8c8c' }}>
                                              {key}:
                                            </Text>
                                            <div style={{
                                              flex: 1,
                                              minWidth: 0,
                                              wordBreak: 'break-word',
                                              overflowWrap: 'break-word'
                                            }}>
                                              {typeof value === 'boolean' ? (
                                                <Tag color={value ? 'default' : 'default'}>{value ? 'true' : 'false'}</Tag>
                                              ) : (
                                                <Text type="secondary">{String(value)}</Text>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </Descriptions.Item>
                                  )}

                                  <Descriptions.Item label="원시 설정">
                                    <pre style={{
                                      background: '#f9f9f9',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      margin: 0,
                                      fontFamily: 'Monaco, Consolas, monospace',
                                      maxHeight: '150px',
                                      overflow: 'auto'
                                    }}>
                                      {parsedPredicates[selectedPredicateIndex].raw}
                                    </pre>
                                  </Descriptions.Item>
                                </Descriptions>
                              </Card>
                            )}
                          </Space>
                        ) : (
                          <Alert message="설정된 Predicate가 없습니다." type="info" showIcon />
                        );
                      })()
                    ) : (
                      <Alert message="Predicate 정보를 로드하고 있습니다..." type="warning" showIcon />
                    )}
                  </Card>
                </Space>
              </TabPane>

              {/* 3탭: Filters */}
              <TabPane tab="Filters" key="filters">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card size="small" title={`Filters (필터) - ${routeDetail ? routeDetail.filters?.length || 0 : '로딩 중...'}개`}>
                    {routeDetail ? (
                        (() => {
                          const parsedFilters = parseFilterStrings(routeDetail.filters || []);
                          return parsedFilters.length > 0 ? (
                            <Space direction="vertical" style={{ width: '100%', gap: '12px' }}>
                              <Select
                                placeholder="필터를 선택하여 상세 정보를 확인하세요"
                                style={{ width: '100%' }}
                                size="small"
                                value={selectedFilterIndex}
                                onChange={(value) => setSelectedFilterIndex(value)}
                                allowClear
                                onClear={() => setSelectedFilterIndex(null)}
                                options={parsedFilters.map((filter, index) => ({
                                  value: index,
                                  label: (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Tag color={getFilterTypeColor(filter.name)} style={{ margin: 0 }}>
                                        {filter.name}
                                      </Tag>
                                      <Text>{filter.description}</Text>
                                    </div>
                                  )
                                }))}
                              />

                              {/* 선택된 Filter 상세 정보 */}
                              {selectedFilterIndex !== null && parsedFilters[selectedFilterIndex] && (
                                <Card
                                  size="small"
                                  style={{
                                    background: '#fafafa',
                                    border: '1px solid #d9d9d9'
                                  }}
                                >
                                  <Descriptions
                                    size="small"
                                    column={1}
                                    bordered
                                    className={styles.filterDescriptions}
                                  >
                                    <Descriptions.Item label="타입">
                                      <Tag color={getFilterTypeColor(parsedFilters[selectedFilterIndex].name)}>
                                        {parsedFilters[selectedFilterIndex].name}
                                      </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="설명">
                                      <Text strong>{parsedFilters[selectedFilterIndex].description}</Text>
                                    </Descriptions.Item>
                                    {parsedFilters[selectedFilterIndex].order !== undefined && (
                                      <Descriptions.Item label="실행 순서">
                                        <Tag color="blue">{parsedFilters[selectedFilterIndex].order}</Tag>
                                      </Descriptions.Item>
                                    )}

                                    {/* 파싱된 인자들을 키-값 형태로 표시 */}
                                    {Object.keys(parsedFilters[selectedFilterIndex].args).length > 0 && (
                                      <Descriptions.Item label="설정값">
                                        <div className={styles.configValuesContainer}>
                                          {Object.entries(parsedFilters[selectedFilterIndex].args).map(([key, value]) => (
                                            <div key={key} className={styles.configValueItem}>
                                              <Text strong className={styles.configValueKey}>
                                                {key}:
                                              </Text>
                                              <div className={styles.configValueContent}>
                                                {Array.isArray(value) ? (
                                                  <Space wrap>
                                                    {value.map((v, i) => (
                                                      <Tag key={i} color="green">{v}</Tag>
                                                    ))}
                                                  </Space>
                                                ) : typeof value === 'boolean' ? (
                                                  <Tag color={value ? 'success' : 'default'}>{value ? 'true' : 'false'}</Tag>
                                                ) : typeof value === 'number' ? (
                                                  <Tag color="purple">{value}</Tag>
                                                ) : (
                                                  <code className={styles.configValueCode}>{String(value)}</code>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </Descriptions.Item>
                                    )}

                                    <Descriptions.Item label="필터 카테고리">
                                      <Tag color="blue">
                                        {parsedFilters[selectedFilterIndex].name.includes('Request') ? '요청 변환' :
                                         parsedFilters[selectedFilterIndex].name.includes('Response') ? '응답 변환' :
                                         parsedFilters[selectedFilterIndex].name.includes('Path') ? 'URL 변환' :
                                         (parsedFilters[selectedFilterIndex].name.includes('Rate') || parsedFilters[selectedFilterIndex].name.includes('Circuit') || parsedFilters[selectedFilterIndex].name.includes('Retry')) ? '제어 & 안정성' :
                                         '기타'}
                                      </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="원시 설정">
                                      <pre className={styles.rawConfigPre}>
                                        {parsedFilters[selectedFilterIndex].raw}
                                      </pre>
                                    </Descriptions.Item>
                                  </Descriptions>
                                </Card>
                              )}
                            </Space>
                          ) : (
                            <Alert message="적용된 필터가 없습니다." type="info" showIcon />
                          );
                        })()
                      ) : (
                        <Alert message="필터 정보를 로드하고 있습니다..." type="warning" showIcon />
                      )}
                    </Card>
                  </Space>
              </TabPane>

              {/* 4탭: 원시 데이터 */}
              <TabPane tab="원시 데이터" key="raw">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card size="small" title="라우트 정의 (routedefinitions)">
                    <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                      {JSON.stringify(selectedRoute, null, 2)}
                    </pre>
                  </Card>

                  {routeDetail && (
                    <Card size="small" title="실행 시간 정보 (routes/{id})">
                      <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                        {JSON.stringify(routeDetail, null, 2)}
                      </pre>
                    </Card>
                  )}
                </Space>
              </TabPane>
            </Tabs>
          </Spin>
        )}
      </Modal>
    </Space>
  );
};

export default GatewayRoutes;
