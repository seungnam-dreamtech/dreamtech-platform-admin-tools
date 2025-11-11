// 글로벌 역할 관리 탭

import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Input, Switch, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { GlobalRoleFormModal } from './GlobalRoleFormModal';
import { GlobalRoleDetailDrawer } from './GlobalRoleDetailDrawer';
import { userManagementService } from '../../services/userManagementService';
import type { GlobalRole } from '../../types/user-management';

const { Search } = Input;

export default function GlobalRolesTab() {
  const [roles, setRoles] = useState<GlobalRole[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<GlobalRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<GlobalRole | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 상세 보기 Drawer 상태
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailRole, setDetailRole] = useState<GlobalRole | null>(null);

  // 역할 목록 조회
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getGlobalRoles();
      console.log('📋 Global Roles fetched:', data);
      console.log('📋 Data type:', typeof data, 'Is Array:', Array.isArray(data));

      // 배열이 아닌 경우 빈 배열로 처리
      const rolesList = Array.isArray(data) ? data : [];

      if (!Array.isArray(data)) {
        console.error('⚠️ API response is not an array:', data);
        message.warning('API 응답 형식이 올바르지 않습니다. 빈 목록으로 표시합니다.');
      }

      // parent_role_id 필드 확인
      if (rolesList.length > 0) {
        console.log('🔍 First role sample:', rolesList[0]);
        console.log('🔍 Roles with parent_role_id:', rolesList.filter(r => r.parent_role_id));
        console.log('🔍 Roles with parent_role:', rolesList.filter(r => r.parent_role));
        console.log('🔍 모든 역할의 부모 정보:', rolesList.map(r => ({
          id: r.role_id,
          parent_role_id: r.parent_role_id,
          parent_role: r.parent_role,
          has_parent: !!(r.parent_role_id || r.parent_role),
        })));
      }

      setRoles(rolesList);
      setFilteredRoles(rolesList);
    } catch (error) {
      message.error('글로벌 역할 목록 조회에 실패했습니다');
      console.error('Failed to fetch global roles:', error);
      setRoles([]);
      setFilteredRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const filtered = roles.filter(
        role =>
          role.role_id.toLowerCase().includes(keyword) ||
          role.display_name.toLowerCase().includes(keyword) ||
          (role.description?.toLowerCase().includes(keyword) ?? false)
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [searchKeyword, roles]);

  // 역할 추가/수정
  const handleSave = async (roleData: GlobalRole) => {
    try {
      if (selectedRole) {
        // 수정 모드: 모달에서 API 호출을 처리하므로 목록만 새로고침
        fetchRoles();
      } else {
        // 추가 모드: 새로운 역할 생성
        await userManagementService.createGlobalRole({
          role_id: roleData.role_id,
          display_name: roleData.display_name,
          description: roleData.description,
          authority_level: roleData.authority_level,
          permissions: roleData.permissions,
          parent_role_id: roleData.parent_role_id,
        });
        message.success('새 글로벌 역할이 추가되었습니다');
        fetchRoles();
      }
      setModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      message.error('역할 저장에 실패했습니다');
      console.error('Failed to save global role:', error);
    }
  };

  // 역할 활성화/비활성화 토글
  const handleToggleActive = async (roleId: string, isActive: boolean) => {
    try {
      await userManagementService.toggleGlobalRoleActivation(roleId, isActive);
      message.success(`역할이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchRoles();
    } catch (error) {
      message.error('역할 상태 변경에 실패했습니다');
      console.error('Failed to toggle global role:', error);
    }
  };

  // 역할 삭제
  const handleDelete = async (roleId: string, isSystemRole: boolean) => {
    if (isSystemRole) {
      message.warning('시스템 역할은 삭제할 수 없습니다');
      return;
    }

    try {
      await userManagementService.deleteGlobalRole(roleId);
      message.success('역할이 삭제되었습니다');
      fetchRoles();
    } catch (error) {
      message.error('역할 삭제에 실패했습니다');
      console.error('Failed to delete global role:', error);
    }
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<GlobalRole> = [
    {
      title: <span style={{ fontSize: '11px' }}>Role ID</span>,
      dataIndex: 'role_id',
      key: 'role_id',
      width: 140,
      sorter: (a, b) => a.role_id.localeCompare(b.role_id),
      render: (roleId) => (
        <span style={{ fontWeight: 500, fontSize: '12px' }}>{roleId}</span>
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
      width: 140,
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
      title: <span style={{ fontSize: '11px' }}>레벨</span>,
      dataIndex: 'authority_level',
      key: 'authority_level',
      width: 70,
      align: 'center',
      sorter: (a, b) => a.authority_level - b.authority_level,
      render: (level) => (
        <Tooltip title="1-100 범위, 낮을수록 높은 권한">
          <Tag color={level <= 10 ? 'red' : level <= 50 ? 'orange' : 'green'} style={{ fontSize: '10px', margin: 0 }}>
            {level}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>부모</span>,
      dataIndex: 'parent_role',
      key: 'parent_role',
      width: 120,
      ellipsis: true,
      render: (parentRole) => {
        if (parentRole && parentRole.role_id) {
          return (
            <Tooltip title={`${parentRole.display_name} (Level ${parentRole.authority_level})`}>
              <span style={{ fontSize: '11px', color: '#1890ff' }}>{parentRole.role_id}</span>
            </Tooltip>
          );
        }
        return <span style={{ color: '#ccc', fontSize: '11px' }}>-</span>;
      },
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
          onChange={(checked) => handleToggleActive(record.role_id, checked)}
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
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="상세 보기">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="text"
              onClick={() => {
                setDetailRole(record);
                setDetailDrawerOpen(true);
              }}
            />
          </Tooltip>
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
            onConfirm={() => handleDelete(record.role_id, record.is_system_role)}
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
            글로벌 역할 ({filteredRoles.length}개)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            플랫폼 전체에 적용되는 역할
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

      {/* 검색 */}
      <Search
        placeholder="Role ID, 표시명 또는 설명으로 검색"
        allowClear
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ width: 400 }}
      />

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredRoles}
        rowKey="role_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
        }}
        scroll={{ x: 1600 }}
      />

      {/* 역할 추가/수정 모달 */}
      <GlobalRoleFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSave}
        role={selectedRole}
        existingRoles={roles}
      />

      {/* 역할 상세 조회 Drawer */}
      <GlobalRoleDetailDrawer
        open={detailDrawerOpen}
        role={detailRole}
        allRoles={roles}
        onClose={() => {
          setDetailDrawerOpen(false);
          setDetailRole(null);
        }}
      />
    </Space>
  );
}