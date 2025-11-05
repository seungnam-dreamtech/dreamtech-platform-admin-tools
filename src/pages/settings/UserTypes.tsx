// 사용자 유형 관리 페이지

import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Popconfirm, Input, Typography, Alert, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { UserTypeFormModal } from '../../components/settings/UserTypeFormModal';
import { userManagementService } from '../../services/userManagementService';
import type { UserTypeDefinition } from '../../types/user-management';

const { Search } = Input;
const { Title, Text } = Typography;

export default function UserTypes() {
  const [userTypes, setUserTypes] = useState<UserTypeDefinition[]>([]);
  const [filteredUserTypes, setFilteredUserTypes] = useState<UserTypeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserTypeDefinition | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // User Type 목록 조회
  const fetchUserTypes = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getUserTypeDefinitions();
      console.log('📋 User Type Definitions fetched:', data);
      setUserTypes(data);
      setFilteredUserTypes(data);
    } catch (error) {
      message.error('사용자 유형 목록 조회에 실패했습니다');
      console.error('Failed to fetch user types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const filtered = userTypes.filter(
        type =>
          type.display_name.toLowerCase().includes(keyword) ||
          type.type_id.toLowerCase().includes(keyword) ||
          type.description.toLowerCase().includes(keyword)
      );
      setFilteredUserTypes(filtered);
    } else {
      setFilteredUserTypes(userTypes);
    }
  }, [searchKeyword, userTypes]);

  // User Type 추가/수정
  const handleSave = async (userTypeData: UserTypeDefinition) => {
    try {
      if (selectedUserType) {
        // 수정 모드: 모달 내부에서 이미 API 호출을 처리하므로 여기서는 목록만 새로고침
        fetchUserTypes();
      } else {
        // 추가 모드: 새로운 유형 생성
        await userManagementService.createUserTypeDefinition(userTypeData);
        message.success('새 사용자 유형이 추가되었습니다');
        fetchUserTypes();
      }
      setModalOpen(false);
      setSelectedUserType(null);
    } catch (error) {
      message.error('사용자 유형 저장에 실패했습니다');
      console.error('Failed to save user type:', error);
    }
  };

  // User Type 활성화/비활성화 토글
  const handleToggleActive = async (typeId: string, isActive: boolean) => {
    try {
      await userManagementService.toggleUserTypeActivation(typeId, isActive);
      message.success(`사용자 유형이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchUserTypes();
    } catch (error) {
      message.error('사용자 유형 상태 변경에 실패했습니다');
      console.error('Failed to toggle user type:', error);
    }
  };

  // User Type 삭제
  const handleDelete = async (typeId: string) => {
    try {
      await userManagementService.deleteUserTypeDefinition(typeId);
      message.success('사용자 유형이 삭제되었습니다');
      fetchUserTypes();
    } catch (error) {
      message.error('사용자 유형 삭제에 실패했습니다');
      console.error('Failed to delete user type:', error);
    }
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<UserTypeDefinition> = [
    {
      title: '유형 ID',
      dataIndex: 'type_id',
      key: 'type_id',
      width: 180,
      sorter: (a, b) => a.type_id.localeCompare(b.type_id),
      render: (typeId, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="cyan" style={{ fontSize: '13px', fontWeight: 'bold' }}>
            {typeId}
          </Tag>
          {record.is_system_type && (
            <Tag color="gold" style={{ fontSize: '11px' }}>
              시스템 타입
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '표시명',
      dataIndex: 'display_name',
      key: 'display_name',
      width: 200,
      sorter: (a, b) => a.display_name.localeCompare(b.display_name),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '표시 순서',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.display_order - b.display_order,
      defaultSortOrder: 'ascend',
      render: (order) => <Text type="secondary">{order}</Text>,
    },
    {
      title: '활성 상태',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      filters: [
        { text: '활성', value: true },
        { text: '비활성', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.type_id, checked)}
          disabled={record.is_system_type}
        />
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setSelectedUserType(record);
              setModalOpen(true);
            }}
          >
            수정
          </Button>
          {!record.is_system_type && (
            <Popconfirm
              title="사용자 유형 삭제"
              description="이 사용자 유형을 삭제하시겠습니까? 이 유형의 사용자가 있을 경우 삭제할 수 없습니다."
              onConfirm={() => handleDelete(record.type_id)}
              okText="삭제"
              cancelText="취소"
              okButtonProps={{ danger: true }}
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 안내 메시지 */}
          <Alert
            message="사용자 유형 (User Type) 관리"
            description={
              <div>
                <p>사용자 유형은 AuthX 권한 시스템의 기초입니다.</p>
                <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                  <li><strong>권한 우선순위</strong>: User Type 기반 기본 역할 (우선순위 90) → Template (85) → Individual (최고)</li>
                  <li><strong>자동 역할 부여</strong>: 사용자 생성 시 User Type에 따라 기본 플랫폼 역할이 자동으로 할당됩니다</li>
                  <li><strong>변경 불가</strong>: 사용자 생성 후에는 User Type을 변경할 수 없으므로 신중하게 설정하세요</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                사용자 유형 관리
              </Title>
              <Text type="secondary">
                사용자 유형과 기본 역할 매핑을 관리합니다
              </Text>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchUserTypes}
                loading={loading}
              >
                새로고침
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedUserType(null);
                  setModalOpen(true);
                }}
              >
                사용자 유형 추가
              </Button>
            </Space>
          </div>

          {/* 검색 */}
          <Search
            placeholder="유형명 또는 설명으로 검색"
            allowClear
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 400 }}
          />

          {/* 통계 */}
          <div>
            <Text type="secondary">전체 사용자 유형: </Text>
            <Text strong style={{ fontSize: '16px' }}>{userTypes.length}개</Text>
          </div>

          {/* 테이블 */}
          <Table
            columns={columns}
            dataSource={filteredUserTypes}
            rowKey="type_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}개`,
            }}
          />
        </Space>
      </Card>

      {/* 사용자 유형 추가/수정 모달 */}
      <UserTypeFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedUserType(null);
        }}
        onSave={handleSave}
        userType={selectedUserType}
      />
    </div>
  );
}