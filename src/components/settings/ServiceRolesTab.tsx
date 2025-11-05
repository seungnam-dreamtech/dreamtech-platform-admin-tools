// 서비스 역할 관리 탭

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
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ServiceRoleFormModal } from './ServiceRoleFormModal';
import { userManagementService } from '../../services/userManagementService';
import type { ServiceRoleDefinition, ServiceScope } from '../../types/user-management';

const { Search } = Input;

export default function ServiceRolesTab() {
  const [roles, setRoles] = useState<ServiceRoleDefinition[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<ServiceRoleDefinition[]>([]);
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ServiceRoleDefinition | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string | undefined>(undefined);

  // 서비스 목록 조회 (역할 추가 시 서비스 선택용)
  const fetchServices = async () => {
    try {
      const data = await userManagementService.getServiceScopes();
      setServices(data.filter((s) => s.is_active)); // 활성화된 서비스만
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  // 역할 목록 조회
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getServiceRoles();
      console.log('📋 Service Roles API response:', data);

      let rolesList: ServiceRoleDefinition[] = [];

      if (Array.isArray(data)) {
        // API 응답: [{ service_id, role_count, roles: [...] }, ...]
        // roles 배열을 평탄화
        rolesList = data.flatMap((serviceGroup: any) => {
          if (serviceGroup.roles && Array.isArray(serviceGroup.roles)) {
            console.log(`📦 Service ${serviceGroup.service_id}: ${serviceGroup.roles.length} roles`);
            return serviceGroup.roles;
          }
          return [];
        });

        console.log(`✅ Total flattened service roles: ${rolesList.length}`);

        if (rolesList.length > 0) {
          console.log('📋 First role sample:', rolesList[0]);
        }
      } else {
        console.error('⚠️ API response is not an array:', data);
        message.warning('API 응답 형식이 올바르지 않습니다.');
      }

      setRoles(rolesList);
      setFilteredRoles(rolesList);
    } catch (error) {
      message.error('서비스 역할 목록 조회에 실패했습니다');
      console.error('Failed to fetch service roles:', error);
      setRoles([]);
      setFilteredRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchRoles();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...roles];

    // 서비스 필터
    if (selectedServiceFilter) {
      filtered = filtered.filter((role) => role.service_id === selectedServiceFilter);
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.role_name.toLowerCase().includes(keyword) ||
          role.display_name.toLowerCase().includes(keyword) ||
          (role.description?.toLowerCase().includes(keyword) ?? false) ||
          role.service_id.toLowerCase().includes(keyword)
      );
    }

    setFilteredRoles(filtered);
  }, [searchKeyword, selectedServiceFilter, roles]);

  // 역할 추가/수정
  const handleSave = async (roleData: ServiceRoleDefinition) => {
    try {
      if (selectedRole) {
        // 수정 모드: 모달에서 API 호출을 처리하므로 목록만 새로고침
        fetchRoles();
      } else {
        // 추가 모드: 새로운 역할 생성
        await userManagementService.createServiceRole(roleData.service_id, {
          role_name: roleData.role_name,
          display_name: roleData.display_name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        message.success('새 서비스 역할이 추가되었습니다');
        fetchRoles();
      }
      setModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      message.error('역할 저장에 실패했습니다');
      console.error('Failed to save service role:', error);
    }
  };

  // 역할 활성화/비활성화 토글
  const handleToggleActive = async (
    serviceId: string,
    roleName: string,
    isActive: boolean
  ) => {
    try {
      await userManagementService.toggleServiceRoleActivation(serviceId, roleName, isActive);
      message.success(`역할이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchRoles();
    } catch (error) {
      message.error('역할 상태 변경에 실패했습니다');
      console.error('Failed to toggle service role:', error);
    }
  };

  // 역할 삭제
  const handleDelete = async (
    serviceId: string,
    roleName: string,
    isSystemRole: boolean
  ) => {
    if (isSystemRole) {
      message.warning('시스템 역할은 삭제할 수 없습니다');
      return;
    }

    try {
      await userManagementService.deleteServiceRole(serviceId, roleName);
      message.success('역할이 삭제되었습니다');
      fetchRoles();
    } catch (error) {
      message.error('역할 삭제에 실패했습니다');
      console.error('Failed to delete service role:', error);
    }
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<ServiceRoleDefinition> = [
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
      title: <span style={{ fontSize: '11px' }}>Role Name</span>,
      dataIndex: 'role_name',
      key: 'role_name',
      width: 120,
      sorter: (a, b) => a.role_name.localeCompare(b.role_name),
      render: (roleName) => (
        <span style={{ fontWeight: 500, fontSize: '12px' }}>{roleName}</span>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>타입</span>,
      dataIndex: 'is_system_role',
      key: 'is_system_role',
      width: 85,
      align: 'center',
      filters: [
        { text: '시스템', value: true },
        { text: '사용자', value: false },
      ],
      onFilter: (value, record) => record.is_system_role === value,
      render: (isSystemRole: boolean) =>
        isSystemRole ? (
          <Tooltip title="시스템 역할 (삭제/비활성화 불가)">
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
      title: <span style={{ fontSize: '11px' }}>표시명</span>,
      dataIndex: 'display_name',
      key: 'display_name',
      width: 130,
      ellipsis: true,
      render: (text) => <span style={{ fontSize: '12px' }}>{text}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>설명</span>,
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text) => <span style={{ fontSize: '11px', color: '#666' }}>{text || '-'}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>권한 수</span>,
      dataIndex: 'permissions',
      key: 'permissions',
      width: 70,
      align: 'center',
      render: (permissions: string[]) => (
        <span style={{ fontSize: '11px', color: '#666' }}>{permissions?.length || 0}</span>
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
          onChange={(checked) =>
            handleToggleActive(record.service_id, record.role_name, checked)
          }
          disabled={record.is_system_role}
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
            onClick={() => {
              setSelectedRole(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="역할 삭제"
            description="정말로 이 역할을 삭제하시겠습니까?"
            onConfirm={() =>
              handleDelete(record.service_id, record.role_name, record.is_system_role)
            }
            okText="삭제"
            cancelText="취소"
            disabled={record.is_system_role}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              type="text"
              danger
              disabled={record.is_system_role}
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
            서비스 역할 ({filteredRoles.length}개)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            특정 서비스에만 적용되는 역할
          </span>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchRoles} loading={loading}>
            새로고침
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedRole(null);
              setModalOpen(true);
            }}
          >
            역할 추가
          </Button>
        </Space>
      </div>

      {/* 필터 및 검색 */}
      <Space style={{ width: '100%' }} size="middle">
        <Select
          placeholder="서비스 필터"
          allowClear
          style={{ width: 250 }}
          value={selectedServiceFilter}
          onChange={setSelectedServiceFilter}
          suffixIcon={<FilterOutlined />}
          options={[
            { label: '전체 서비스', value: undefined },
            ...services.map((s) => ({
              label: `${s.service_id} (${s.description})`,
              value: s.service_id,
            })),
          ]}
        />
        <Search
          placeholder="Role Name, 표시명 또는 설명으로 검색"
          allowClear
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ flex: 1, maxWidth: 400 }}
        />
      </Space>

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredRoles}
        rowKey={(record) => `${record.service_id}:${record.role_name}`}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
        }}
        scroll={{ x: 1500 }}
      />

      {/* 역할 추가/수정 모달 */}
      <ServiceRoleFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSave}
        role={selectedRole}
        services={services}
      />
    </Space>
  );
}