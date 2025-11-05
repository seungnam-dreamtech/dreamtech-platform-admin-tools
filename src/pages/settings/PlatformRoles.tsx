// 플랫폼 역할 관리 페이지

import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Popconfirm, Input, Typography, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PlatformRoleFormModal } from '../../components/settings/PlatformRoleFormModal';
import type { PlatformRole } from '../../types/user-management';
import { PLATFORM_ROLES } from '../../constants/user-management';

const { Search } = Input;
const { Title, Text } = Typography;

export default function PlatformRoles() {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PlatformRole | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 역할 목록 조회
  const fetchRoles = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 연동
      // const data = await userManagementService.getPlatformRoles();
      const data = [...PLATFORM_ROLES];
      setRoles(data);
      setFilteredRoles(data);
    } catch (error) {
      message.error('역할 목록 조회에 실패했습니다');
      console.error(error);
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
          role.displayName.toLowerCase().includes(keyword) ||
          role.name.toLowerCase().includes(keyword) ||
          role.description.toLowerCase().includes(keyword)
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [searchKeyword, roles]);

  // 역할 추가/수정
  const handleSave = async (roleData: Partial<PlatformRole>) => {
    try {
      if (selectedRole) {
        // 수정
        message.success('역할이 수정되었습니다');
      } else {
        // 추가
        message.success('새 역할이 추가되었습니다');
      }
      fetchRoles();
      setModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      message.error('역할 저장에 실패했습니다');
      console.error(error);
    }
  };

  // 역할 삭제
  const handleDelete = async (roleId: string) => {
    try {
      message.success('역할이 삭제되었습니다');
      fetchRoles();
    } catch (error) {
      message.error('역할 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<PlatformRole> = [
    {
      title: '역할 이름',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <Space>
          {record.isSystem && <LockOutlined style={{ color: '#faad14' }} />}
          <Tag color={record.isSystem ? 'gold' : 'blue'} style={{ fontSize: '13px' }}>
            {record.name}
          </Tag>
        </Space>
      ),
    },
    {
      title: '표시명',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '권한',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 300,
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.slice(0, 3).map((permission, index) => (
            <Tag key={index} color="purple" style={{ fontSize: '11px' }}>
              {permission}
            </Tag>
          ))}
          {permissions.length > 3 && (
            <Tag color="default" style={{ fontSize: '11px' }}>
              +{permissions.length - 3}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '유형',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 100,
      render: (isSystem) => (
        <Tag color={isSystem ? 'gold' : 'default'}>
          {isSystem ? '시스템' : '일반'}
        </Tag>
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
              setSelectedRole(record);
              setModalOpen(true);
            }}
          >
            수정
          </Button>
          {!record.isSystem && (
            <Popconfirm
              title="역할 삭제"
              description="이 역할을 삭제하시겠습니까? 이 역할을 사용 중인 사용자가 있을 수 있습니다."
              onConfirm={() => handleDelete(record.id)}
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
            message="플랫폼 역할 관리"
            description={
              <div>
                <p>플랫폼 역할은 플랫폼 전역에서 적용되는 역할입니다.</p>
                <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                  <li><strong>시스템 역할</strong>: User Type 기반 기본 역할로 사용되며 삭제가 제한됩니다</li>
                  <li><strong>일반 역할</strong>: 사용자에게 개별적으로 부여 가능한 추가 역할입니다</li>
                  <li><strong>권한 형식</strong>: resource:action (예: user:read, service:manage) 또는 *:* (전체 권한)</li>
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
                플랫폼 역할 관리
              </Title>
              <Text type="secondary">
                플랫폼 전역에서 사용되는 역할과 권한을 관리합니다
              </Text>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRoles}
                loading={loading}
              >
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
            placeholder="역할명 또는 설명으로 검색"
            allowClear
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 400 }}
          />

          {/* 통계 */}
          <Space size="large">
            <div>
              <Text type="secondary">전체 역할: </Text>
              <Text strong style={{ fontSize: '16px' }}>{roles.length}개</Text>
            </div>
            <div>
              <Text type="secondary">시스템 역할: </Text>
              <Text strong style={{ fontSize: '16px', color: '#faad14' }}>
                {roles.filter(r => r.isSystem).length}개
              </Text>
            </div>
            <div>
              <Text type="secondary">일반 역할: </Text>
              <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                {roles.filter(r => !r.isSystem).length}개
              </Text>
            </div>
          </Space>

          {/* 테이블 */}
          <Table
            columns={columns}
            dataSource={filteredRoles}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}개`,
            }}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>

      {/* 역할 추가/수정 모달 */}
      <PlatformRoleFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSave}
        role={selectedRole}
      />
    </div>
  );
}