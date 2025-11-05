// 플랫폼 사용자 관리 페이지

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  Typography,
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
const { Title, Text } = Typography;

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

  // 사용자 추가/수정
  const handleSave = async (userData: any) => {
    try {
      if (selectedUser) {
        // 수정
        message.success('사용자 정보가 수정되었습니다');
      } else {
        // 추가
        message.success('새 사용자가 추가되었습니다');
      }
      fetchUsers();
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      message.error('사용자 저장에 실패했습니다');
      console.error(error);
    }
  };

  // 사용자 삭제
  const handleDelete = async (id: string) => {
    try {
      message.success('사용자가 삭제되었습니다');
      fetchUsers();
    } catch (error) {
      message.error('사용자 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 사용자 상태별 통계
  const statusStats = USER_STATUS_OPTIONS.map(status => ({
    ...status,
    count: users.filter(u => u.status === status.value).length,
  }));

  // User Type별 통계
  const userTypeStats = USER_TYPES.map(userType => ({
    ...userType,
    count: users.filter(u => u.userType === userType.value).length,
  }));

  // 상태 태그 렌더링
  const renderStatusTag = (status: string) => {
    const statusOption = USER_STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Tag color={statusOption?.color || 'default'}>
        {statusOption?.label || status}
      </Tag>
    );
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<PlatformUser> = [
    {
      title: '사용자',
      key: 'user',
      width: 250,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.profileImage} />
          <div>
            <div>
              <Text strong>{record.name}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      width: 150,
      render: (userType: UserType) => {
        const typeInfo = USER_TYPES.find(t => t.value === userType);
        return (
          <Tag color="purple" style={{ fontSize: '12px' }}>
            {typeInfo?.label || userType}
          </Tag>
        );
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag,
    },
    {
      title: '부서/직책',
      key: 'position',
      width: 180,
      render: (_, record) => (
        <div>
          {record.department && (
            <div>
              <Text>{record.department}</Text>
            </div>
          )}
          {record.position && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.position}
              </Text>
            </div>
          )}
          {!record.department && !record.position && <Text type="secondary">-</Text>}
        </div>
      ),
    },
    {
      title: '플랫폼 역할',
      dataIndex: 'platformRoles',
      key: 'platformRoles',
      width: 150,
      render: (roles: string[]) => (
        <Tooltip title={roles.join(', ')}>
          <Space size={[0, 4]} wrap>
            {roles.slice(0, 2).map(role => (
              <Tag key={role} color="blue" style={{ fontSize: '11px', margin: 0 }}>
                {role}
              </Tag>
            ))}
            {roles.length > 2 && (
              <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>
                +{roles.length - 2}
              </Tag>
            )}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '서비스 가입',
      dataIndex: 'serviceSubscriptions',
      key: 'serviceSubscriptions',
      width: 120,
      render: (subscriptions: any[]) => (
        <Badge count={subscriptions.length} showZero color="cyan" />
      ),
    },
    {
      title: '연락처',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
      render: (phone: string) => <Text style={{ fontSize: '12px' }}>{phone || '-'}</Text>,
    },
    {
      title: '최근 로그인',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (date: string) => (
        <Text style={{ fontSize: '12px' }}>
          {date ? new Date(date).toLocaleString('ko-KR') : '-'}
        </Text>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<SearchOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(record);
              setModalOpen(true);
            }}
          >
            상세
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(record);
              setModalOpen(true);
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="사용자 삭제"
            description={`"${record.name}" 사용자를 삭제하시겠습니까?`}
            onConfirm={() => handleDelete(record.id)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 통계 카드 */}
          <Card title="사용자 통계" size="small">
            <Space size="large" wrap>
              <div>
                <Text type="secondary">전체 사용자</Text>
                <div>
                  <Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                    {users.length}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 4 }}>
                    명
                  </Text>
                </div>
              </div>
              {statusStats.map(stat => (
                <div key={stat.value}>
                  <Text type="secondary">{stat.label}</Text>
                  <div>
                    <Text strong style={{ fontSize: '24px', color: stat.color }}>
                      {stat.count}
                    </Text>
                    <Text type="secondary" style={{ marginLeft: 4 }}>
                      명
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          {/* User Type별 통계 */}
          <Card title="User Type별 분포" size="small">
            <Space size="large" wrap>
              {userTypeStats.map(stat => (
                <div key={stat.value}>
                  <Text type="secondary">{stat.label}</Text>
                  <div>
                    <Text strong style={{ fontSize: '20px' }}>
                      {stat.count}
                    </Text>
                    <Text type="secondary" style={{ marginLeft: 4 }}>
                      명
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                플랫폼 사용자 관리
              </Title>
              <Text type="secondary">플랫폼에 등록된 모든 사용자를 관리합니다</Text>
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

          {/* 필터링 결과 */}
          <div>
            <Text type="secondary">검색 결과: </Text>
            <Text strong style={{ fontSize: '16px' }}>
              {filteredUsers.length}명
            </Text>
          </div>

          {/* 테이블 */}
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1600 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `총 ${total}명`,
            }}
          />
        </Space>
      </Card>

      {/* 사용자 상세/추가/수정 모달 */}
      <UserDetailModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSave}
        user={selectedUser}
      />
    </div>
  );
}