// 플랫폼 사용자 관리 페이지
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  Select,
  Badge,
  Tooltip,
  Avatar,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PlatformUser, UserType } from '../../types/user-management';
import { UserDetailModal } from '../../components/user-management/UserDetailModal';
import {
  MOCK_USERS,
  USER_TYPES,
  USER_STATUS_OPTIONS,
} from '../../constants/user-management';

const { Search } = Input;

export default function PlatformUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterUserType, setFilterUserType] = useState<UserType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'inactive' | 'suspended'>('ALL');

  // 사용자 목록 조회
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 연동
      // const data = await userManagementService.getUsers();
      const data: PlatformUser[] = [...MOCK_USERS];
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      message.error('사용자 목록 조회에 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...users];

    // User Type 필터
    if (filterUserType !== 'ALL') {
      filtered = filtered.filter(user => user.userType === filterUserType);
    }

    // Status 필터
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          user.phoneNumber?.toLowerCase().includes(keyword) ||
          user.department?.toLowerCase().includes(keyword)
      );
    }

    setFilteredUsers(filtered);
  }, [searchKeyword, filterUserType, filterStatus, users]);

  // 사용자 삭제
  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting user:', id);
      message.success('사용자가 삭제되었습니다');
      fetchUsers();
    } catch (error) {
      message.error('사용자 삭제에 실패했습니다');
      console.error(error);
    }
  };


  // 테이블 컬럼 정의
  const columns: ColumnsType<PlatformUser> = [
    {
      title: <span style={{ fontSize: '11px' }}>사용자</span>,
      key: 'user',
      width: 220,
      fixed: 'left',
      render: (_, record) => (
        <Space size="small">
          <Avatar size="small" icon={<UserOutlined />} src={record.profileImage} />
          <div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{record.name}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#999' }}>
                {record.email}
              </span>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>User Type</span>,
      dataIndex: 'userType',
      key: 'userType',
      width: 120,
      render: (userType: UserType) => {
        const typeInfo = USER_TYPES.find(t => t.value === userType);
        return (
          <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
            {typeInfo?.label || userType}
          </Tag>
        );
      },
    },
    {
      title: <span style={{ fontSize: '11px' }}>상태</span>,
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: string) => {
        const statusOption = USER_STATUS_OPTIONS.find(s => s.value === status);
        return (
          <Tag color={statusOption?.color || 'default'} style={{ fontSize: '10px', margin: 0 }}>
            {statusOption?.label || status}
          </Tag>
        );
      },
    },
    {
      title: <span style={{ fontSize: '11px' }}>부서/직책</span>,
      key: 'position',
      width: 150,
      render: (_, record) => (
        <div>
          {record.department && (
            <div>
              <span style={{ fontSize: '11px' }}>{record.department}</span>
            </div>
          )}
          {record.position && (
            <div>
              <span style={{ fontSize: '10px', color: '#999' }}>
                {record.position}
              </span>
            </div>
          )}
          {!record.department && !record.position && <span style={{ fontSize: '11px', color: '#999' }}>-</span>}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>플랫폼 역할</span>,
      dataIndex: 'platformRoles',
      key: 'platformRoles',
      width: 130,
      render: (roles: string[]) => (
        <Tooltip title={roles.join(', ')}>
          <Space size={[0, 4]} wrap>
            {roles.slice(0, 2).map(role => (
              <Tag key={role} color="blue" style={{ fontSize: '10px', margin: 0 }}>
                {role}
              </Tag>
            ))}
            {roles.length > 2 && (
              <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
                +{roles.length - 2}
              </Tag>
            )}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>서비스 가입</span>,
      dataIndex: 'serviceSubscriptions',
      key: 'serviceSubscriptions',
      width: 100,
      align: 'center',
      render: (subscriptions: any[]) => (
        <Badge count={subscriptions.length} showZero color="cyan" style={{ fontSize: '10px' }} />
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>연락처</span>,
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 130,
      render: (phone: string) => <span style={{ fontSize: '11px', color: '#666' }}>{phone || '-'}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>최근 로그인</span>,
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 140,
      render: (date: string) => (
        <span style={{ fontSize: '10px', color: '#999' }}>
          {date ? new Date(date).toLocaleString('ko-KR') : '-'}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>작업</span>,
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<SearchOutlined />}
            size="small"
            type="text"
            onClick={() => {
              setSelectedUser(record);
              setModalOpen(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            type="text"
            onClick={() => {
              setSelectedUser(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="사용자 삭제"
            description={`"${record.name}" 사용자를 삭제하시겠습니까?`}
            onConfirm={() => handleDelete(record.id)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" type="text" danger />
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
            플랫폼 사용자 ({filteredUsers.length}명)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            플랫폼에 등록된 모든 사용자 관리
          </span>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
            새로고침
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedUser(null);
              setModalOpen(true);
            }}
          >
            사용자 추가
          </Button>
        </Space>
      </div>

      {/* 검색 및 필터 */}
      <Space size="middle" wrap>
        <Select
          style={{ width: 200 }}
          value={filterUserType}
          onChange={setFilterUserType}
          options={[
            { label: '전체 User Type', value: 'ALL' },
            ...USER_TYPES.map(type => ({
              label: type.label,
              value: type.value,
            })),
          ]}
        />
        <Select
          style={{ width: 150 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: '전체 상태', value: 'ALL' },
            ...USER_STATUS_OPTIONS.map(status => ({
              label: status.label,
              value: status.value,
            })),
          ]}
        />
        <Search
          placeholder="이름, 이메일, 연락처, 부서로 검색"
          allowClear
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          style={{ width: 400 }}
        />
      </Space>

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: total => `총 ${total}명`,
        }}
      />

      {/* 사용자 상세/추가/수정 모달 */}
      <UserDetailModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUsers();
          setModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Space>
  );
}