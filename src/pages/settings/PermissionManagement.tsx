// 권한 정의 관리 페이지

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  Switch,
  Popconfirm,
  Select,
  Collapse,
  Card,
  Tooltip,
  Badge,
  App,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
  SafetyOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userManagementService } from '../../services/userManagementService';
import type {
  PermissionDefinition,
  ServiceScope,
  PermissionSearchFilter,
} from '../../types/user-management';
import PermissionFormModal from '../../components/settings/PermissionFormModal';

const { Search } = Input;
const { Panel } = Collapse;

export default function PermissionManagement() {
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<PermissionDefinition[]>([]);
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string | undefined>(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(
    undefined
  );
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionDefinition | null>(null);

  // 서비스 목록 조회
  const fetchServices = async () => {
    try {
      const data = await userManagementService.getServiceScopes();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  // 권한 목록 조회
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const filter: PermissionSearchFilter = {
        keyword: searchKeyword || undefined,
        service_id: selectedServiceFilter,
        category: selectedCategoryFilter,
      };

      const data = await userManagementService.getPermissions(filter);
      console.log('📋 Permissions fetched:', data);

      const permissionsList = Array.isArray(data) ? data : [];

      if (!Array.isArray(data)) {
        console.error('⚠️ API response is not an array:', data);
        message.warning('API 응답 형식이 올바르지 않습니다. 빈 목록으로 표시합니다.');
      }

      setPermissions(permissionsList);
      setFilteredPermissions(permissionsList);
    } catch (error) {
      message.error('권한 목록 조회에 실패했습니다');
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
      setFilteredPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPermissions();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...permissions];

    // 서비스 필터
    if (selectedServiceFilter) {
      filtered = filtered.filter((perm) => perm.service_id === selectedServiceFilter);
    }

    // 카테고리 필터
    if (selectedCategoryFilter) {
      filtered = filtered.filter((perm) => perm.category === selectedCategoryFilter);
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (perm) =>
          perm.permission_string.toLowerCase().includes(keyword) ||
          perm.display_name.toLowerCase().includes(keyword) ||
          (perm.description?.toLowerCase().includes(keyword) ?? false) ||
          perm.resource.toLowerCase().includes(keyword) ||
          perm.action.toLowerCase().includes(keyword)
      );
    }

    setFilteredPermissions(filtered);
  }, [searchKeyword, selectedServiceFilter, selectedCategoryFilter, permissions]);

  // 권한 활성화/비활성화 토글
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await userManagementService.togglePermissionActivation(id, isActive);
      message.success(`권한이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchPermissions();
    } catch (error) {
      message.error('권한 상태 변경에 실패했습니다');
      console.error('Failed to toggle permission:', error);
    }
  };

  // 권한 삭제
  const handleDelete = async (id: number, isSystemPermission: boolean) => {
    if (isSystemPermission) {
      message.warning('시스템 권한은 삭제할 수 없습니다');
      return;
    }

    try {
      await userManagementService.deletePermission(id);
      message.success('권한이 삭제되었습니다');
      fetchPermissions();
    } catch (error) {
      message.error('권한 삭제에 실패했습니다');
      console.error('Failed to delete permission:', error);
    }
  };

  // 모달 열기 (권한 추가)
  const handleOpenAddModal = () => {
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  // 모달 열기 (권한 수정)
  const handleOpenEditModal = (permission: PermissionDefinition) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPermission(null);
  };

  // 모달 저장 완료
  const handleModalSave = () => {
    handleCloseModal();
    fetchPermissions();
  };

  // 고유 카테고리 목록
  const uniqueCategories = Array.from(new Set(permissions.map((p) => p.category)));

  // 서비스별/카테고리별 그룹화
  const groupedByService = permissions.reduce((acc, perm) => {
    if (!acc[perm.service_id]) {
      acc[perm.service_id] = {};
    }
    if (!acc[perm.service_id][perm.category]) {
      acc[perm.service_id][perm.category] = [];
    }
    acc[perm.service_id][perm.category].push(perm);
    return acc;
  }, {} as Record<string, Record<string, PermissionDefinition[]>>);

  // 테이블 컬럼 정의
  const columns: ColumnsType<PermissionDefinition> = [
    {
      title: <span style={{ fontSize: '11px' }}>ID</span>,
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
      render: (id) => <span style={{ fontSize: '11px', color: '#999' }}>{id}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>서비스</span>,
      dataIndex: 'service_id',
      key: 'service_id',
      width: 110,
      sorter: (a, b) => a.service_id.localeCompare(b.service_id),
      render: (serviceId) => (
        <span style={{ fontSize: '11px', color: '#1890ff', fontWeight: 500 }}>{serviceId}</span>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>권한 문자열</span>,
      dataIndex: 'permission_string',
      key: 'permission_string',
      width: 140,
      sorter: (a, b) => a.permission_string.localeCompare(b.permission_string),
      render: (permString) => (
        <code
          style={{
            fontSize: '11px',
            background: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '3px',
            color: '#52c41a',
            fontWeight: 500,
          }}
        >
          {permString}
        </code>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>표시명</span>,
      dataIndex: 'display_name',
      key: 'display_name',
      width: 130,
      ellipsis: true,
      render: (text) => <span style={{ fontSize: '12px' }}>{text}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>카테고리</span>,
      dataIndex: 'category',
      key: 'category',
      width: 110,
      ellipsis: true,
      render: (category) => (
        <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
          {category}
        </Tag>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>리소스</span>,
      dataIndex: 'resource',
      key: 'resource',
      width: 90,
      render: (resource) => <span style={{ fontSize: '11px', color: '#666' }}>{resource}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>액션</span>,
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action) => <span style={{ fontSize: '11px', color: '#666' }}>{action}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>타입</span>,
      dataIndex: 'is_system_permission',
      key: 'is_system_permission',
      width: 85,
      align: 'center',
      filters: [
        { text: '시스템', value: true },
        { text: '사용자', value: false },
      ],
      onFilter: (value, record) => record.is_system_permission === value,
      render: (isSystemPermission: boolean) =>
        isSystemPermission ? (
          <Tooltip title="시스템 권한 (삭제/비활성화 불가)">
            <Tag color="red" style={{ fontSize: '10px', margin: 0 }}>
              SYSTEM
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
            사용자
          </Tag>
        ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>상태</span>,
      dataIndex: 'is_active',
      key: 'is_active',
      width: 70,
      align: 'center',
      filters: [
        { text: '활성', value: true },
        { text: '비활성', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive: boolean, record) => (
        <Switch
          size="small"
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          disabled={record.is_system_permission}
        />
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>생성일</span>,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date) => (
        <span style={{ fontSize: '10px', color: '#999' }}>
          {new Date(date).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>작업</span>,
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="text"
            onClick={() => handleOpenEditModal(record)}
          />
          <Popconfirm
            title="권한 삭제"
            description="정말로 이 권한을 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.id, record.is_system_permission)}
            okText="삭제"
            cancelText="취소"
            disabled={record.is_system_permission}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              type="text"
              danger
              disabled={record.is_system_permission}
            />
          </Popconfirm>
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
            권한 정의 ({filteredPermissions.length}개)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            플랫폼 및 서비스 권한 관리
          </span>
        </div>
        <Space>
          <Button.Group>
            <Button
              type={viewMode === 'table' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('table')}
            >
              목록
            </Button>
            <Button
              type={viewMode === 'grouped' ? 'primary' : 'default'}
              icon={<SafetyOutlined />}
              onClick={() => setViewMode('grouped')}
            >
              그룹
            </Button>
          </Button.Group>
          <Button icon={<ReloadOutlined />} onClick={fetchPermissions} loading={loading}>
            새로고침
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
          >
            권한 추가
          </Button>
        </Space>
      </div>

      {/* 필터 및 검색 */}
      <Space style={{ width: '100%' }} size="middle">
        <Select
          placeholder="서비스 필터"
          allowClear
          style={{ width: 200 }}
          value={selectedServiceFilter}
          onChange={setSelectedServiceFilter}
          suffixIcon={<FilterOutlined />}
          options={[
            { label: '전체 서비스', value: undefined },
            ...services.map((s) => ({
              label: s.service_id,
              value: s.service_id,
            })),
          ]}
        />
        <Select
          placeholder="카테고리 필터"
          allowClear
          style={{ width: 200 }}
          value={selectedCategoryFilter}
          onChange={setSelectedCategoryFilter}
          suffixIcon={<FilterOutlined />}
          options={[
            { label: '전체 카테고리', value: undefined },
            ...uniqueCategories.map((cat) => ({
              label: cat,
              value: cat,
            })),
          ]}
        />
        <Search
          placeholder="권한 문자열, 표시명, 리소스, 액션 등으로 검색"
          allowClear
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ flex: 1, maxWidth: 500 }}
        />
      </Space>

      {/* 테이블 뷰 */}
      {viewMode === 'table' && (
        <Table
          columns={columns}
          dataSource={filteredPermissions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개`,
          }}
          scroll={{ x: 1600 }}
        />
      )}

      {/* 그룹 뷰 (서비스별 > 카테고리별) */}
      {viewMode === 'grouped' && (
        <div>
          {Object.entries(groupedByService).map(([serviceId, categories]) => (
            <Card
              key={serviceId}
              title={
                <Space>
                  <SafetyOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{serviceId}</span>
                  <Badge
                    count={Object.values(categories).flat().length}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </Space>
              }
              style={{ marginBottom: 16 }}
              size="small"
            >
              <Collapse>
                {Object.entries(categories).map(([category, perms]) => (
                  <Panel
                    header={
                      <Space>
                        <Tag color="purple" style={{ fontSize: '11px' }}>
                          {category}
                        </Tag>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {perms.length}개 권한
                        </span>
                      </Space>
                    }
                    key={`${serviceId}-${category}`}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      {perms.map((perm) => (
                        <div
                          key={perm.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#fafafa',
                            borderRadius: '4px',
                          }}
                        >
                          <Space>
                            <code
                              style={{
                                fontSize: '11px',
                                background: '#f0f0f0',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                color: '#52c41a',
                                fontWeight: 500,
                              }}
                            >
                              {perm.permission_string}
                            </code>
                            <span style={{ fontSize: '12px' }}>{perm.display_name}</span>
                            {perm.is_system_permission && (
                              <Tag color="red" style={{ fontSize: '10px', margin: 0 }}>
                                SYSTEM
                              </Tag>
                            )}
                          </Space>
                          <Space size={4}>
                            <Switch
                              size="small"
                              checked={perm.is_active}
                              onChange={(checked) => handleToggleActive(perm.id, checked)}
                              disabled={perm.is_system_permission}
                            />
                            <Button
                              icon={<EditOutlined />}
                              size="small"
                              type="text"
                              onClick={() => handleOpenEditModal(perm)}
                            />
                            <Popconfirm
                              title="권한 삭제"
                              description="정말로 이 권한을 삭제하시겠습니까?"
                              onConfirm={() => handleDelete(perm.id, perm.is_system_permission)}
                              okText="삭제"
                              cancelText="취소"
                              disabled={perm.is_system_permission}
                            >
                              <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                type="text"
                                danger
                                disabled={perm.is_system_permission}
                              />
                            </Popconfirm>
                          </Space>
                        </div>
                      ))}
                    </Space>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          ))}
        </div>
      )}

      {/* 권한 추가/수정 모달 */}
      <PermissionFormModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onSave={handleModalSave}
        permission={editingPermission}
      />
    </Space>
  );
}