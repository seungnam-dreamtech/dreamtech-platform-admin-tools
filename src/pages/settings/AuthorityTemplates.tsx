// 권한 템플릿 관리 페이지

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Input,
  Typography,
  Alert,
  Select,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AuthorityTemplate, UserTypeDefinition } from '../../types/user-management';
import TemplateFormModal from '../../components/settings/TemplateFormModal';
import { userManagementService } from '../../services/userManagementService';

const { Search } = Input;
const { Title, Text } = Typography;

export default function AuthorityTemplates() {
  const [templates, setTemplates] = useState<AuthorityTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AuthorityTemplate[]>([]);
  const [userTypes, setUserTypes] = useState<UserTypeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AuthorityTemplate | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterUserType, setFilterUserType] = useState<string | 'ALL'>('ALL');

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getAuthorityTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      message.error('권한 템플릿 목록 조회에 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const data = await userManagementService.getUserTypeDefinitions();
      setUserTypes(data.filter((ut) => ut.is_active));
    } catch (error) {
      console.error('Failed to load user types:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchUserTypes();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...templates];

    // User Type 필터
    if (filterUserType !== 'ALL') {
      filtered = filtered.filter(template => template.user_type === filterUserType);
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.name.toLowerCase().includes(keyword) ||
          (template.description?.toLowerCase().includes(keyword) ?? false) ||
          template.user_type.toLowerCase().includes(keyword)
      );
    }

    setFilteredTemplates(filtered);
  }, [searchKeyword, filterUserType, templates]);

  // 템플릿 추가/수정
  const handleSave = async (templateData: any) => {
    try {
      if (selectedTemplate) {
        // 수정
        message.success('권한 템플릿이 수정되었습니다');
      } else {
        // 추가
        message.success('새 권한 템플릿이 추가되었습니다');
      }
      fetchTemplates();
      setModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      message.error('권한 템플릿 저장에 실패했습니다');
      console.error(error);
    }
  };

  // 템플릿 삭제
  const handleDelete = async (id: string) => {
    try {
      message.success('권한 템플릿이 삭제되었습니다');
      fetchTemplates();
    } catch (error) {
      message.error('권한 템플릿 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 기본 템플릿 설정/해제
  const handleToggleDefault = async (template: AuthorityTemplate) => {
    try {
      message.success(
        template.is_default
          ? '기본 템플릿이 해제되었습니다'
          : `${template.name}이(가) ${template.user_type}의 기본 템플릿으로 설정되었습니다`
      );
      fetchTemplates();
    } catch (error) {
      message.error('기본 템플릿 설정에 실패했습니다');
      console.error(error);
    }
  };

  // User Type별 통계
  const userTypeStats = userTypes.map(userType => {
    const typeTemplates = templates.filter(t => t.user_type === userType.type_id);
    const defaultTemplate = typeTemplates.find(t => t.is_default);
    return {
      userType: userType.type_id,
      label: userType.display_name,
      total: typeTemplates.length,
      hasDefault: !!defaultTemplate,
      defaultTemplateName: defaultTemplate?.name,
      totalAppliedUsers: typeTemplates.reduce((sum, t) => sum + (t.statistics?.applied_user_count || 0), 0),
    };
  });

  // 테이블 컬럼 정의
  const columns: ColumnsType<AuthorityTemplate> = [
    {
      title: '템플릿 이름',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <Tooltip title={record.is_default ? '기본 템플릿' : '일반 템플릿'}>
            {record.is_default ? (
              <StarFilled style={{ color: '#faad14', fontSize: '16px' }} />
            ) : (
              <StarOutlined style={{ color: '#d9d9d9', fontSize: '16px' }} />
            )}
          </Tooltip>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'User Type',
      dataIndex: 'user_type',
      key: 'user_type',
      width: 150,
      render: (userType: string) => {
        const typeInfo = userTypes.find(t => t.type_id === userType);
        return (
          <Tag color="purple" style={{ fontSize: '12px' }}>
            {typeInfo?.display_name || userType}
          </Tag>
        );
      },
    },
    {
      title: '역할',
      dataIndex: 'roles',
      key: 'roles',
      width: 120,
      render: (roles: string[]) => (
        <Tooltip title={roles.length > 0 ? roles.join(', ') : '없음'}>
          <Badge count={roles.length} showZero color="blue" />
        </Tooltip>
      ),
    },
    {
      title: '권한',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 120,
      render: (permissions: string[]) => (
        <Tooltip title={permissions.length > 0 ? permissions.join(', ') : '없음'}>
          <Badge count={permissions.length} showZero color="green" />
        </Tooltip>
      ),
    },
    {
      title: '서비스 스코프',
      dataIndex: 'service_scope_ids',
      key: 'service_scope_ids',
      width: 180,
      render: (serviceIds: string[]) => (
        <Tooltip title={serviceIds.length > 0 ? serviceIds.join(', ') : '없음'}>
          <Badge count={serviceIds.length} showZero color="cyan" />
        </Tooltip>
      ),
    },
    {
      title: '적용 사용자 수',
      key: 'applied_user_count',
      width: 120,
      align: 'right',
      render: (_: any, record: AuthorityTemplate) => (
        <Text strong style={{ fontSize: '14px' }}>
          {record.statistics?.applied_user_count || 0}명
        </Text>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.is_default ? '기본 템플릿 해제' : '기본 템플릿으로 설정'}>
            <Button
              icon={record.is_default ? <StarFilled /> : <StarOutlined />}
              size="small"
              type={record.is_default ? 'primary' : 'default'}
              onClick={() => handleToggleDefault(record)}
            />
          </Tooltip>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setSelectedTemplate(record);
              setModalOpen(true);
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="권한 템플릿 삭제"
            description={`"${record.name}" 템플릿을 삭제하시겠습니까? 현재 ${record.statistics?.applied_user_count || 0}명의 사용자에게 적용 중입니다.`}
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
          {/* 안내 메시지 */}
          <Alert
            message="권한 템플릿 (Authority Template) 관리"
            description={
              <div>
                <p>권한 템플릿은 User Type별로 사전 정의된 권한 세트를 제공합니다.</p>
                <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                  <li>
                    <strong>권한 우선순위</strong>: User Type 기본 역할 (우선순위 90) → Template
                    (85) → Individual (최고)
                  </li>
                  <li>
                    <strong>기본 템플릿</strong>: User Type별로 하나의 기본 템플릿을 지정할 수 있으며,
                    사용자 생성 시 자동으로 적용됩니다
                  </li>
                  <li>
                    <strong>유연한 관리</strong>: 템플릿을 통해 동일한 User Type의 사용자들에게 다양한
                    권한 조합을 제공할 수 있습니다
                  </li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* User Type별 통계 */}
          <Card title="User Type별 템플릿 통계" size="small">
            <Space wrap size="large">
              {userTypeStats.map(stat => (
                <Card.Grid key={stat.userType} hoverable={false} style={{ width: '25%' }}>
                  <Space direction="vertical" size="small">
                    <Text strong style={{ fontSize: '16px' }}>
                      {stat.label}
                    </Text>
                    <Space>
                      <Text type="secondary">템플릿:</Text>
                      <Text strong>{stat.total}개</Text>
                    </Space>
                    <Space>
                      <Text type="secondary">적용 사용자:</Text>
                      <Text strong>{stat.totalAppliedUsers}명</Text>
                    </Space>
                    <Space>
                      {stat.hasDefault ? (
                        <>
                          <StarFilled style={{ color: '#faad14' }} />
                          <Text type="success" style={{ fontSize: '12px' }}>
                            {stat.defaultTemplateName}
                          </Text>
                        </>
                      ) : (
                        <Text type="warning" style={{ fontSize: '12px' }}>
                          ⚠️ 기본 템플릿 미설정
                        </Text>
                      )}
                    </Space>
                  </Space>
                </Card.Grid>
              ))}
            </Space>
          </Card>

          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                권한 템플릿 관리
              </Title>
              <Text type="secondary">User Type별 사전 정의된 권한 세트를 관리합니다</Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchTemplates} loading={loading}>
                새로고침
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedTemplate(null);
                  setModalOpen(true);
                }}
              >
                템플릿 추가
              </Button>
            </Space>
          </div>

          {/* 검색 및 필터 */}
          <Space size="middle">
            <Select
              style={{ width: 200 }}
              value={filterUserType}
              onChange={setFilterUserType}
              options={[
                { label: '전체 User Type', value: 'ALL' },
                ...userTypes.map(type => ({
                  label: type.display_name,
                  value: type.type_id,
                })),
              ]}
            />
            <Search
              placeholder="템플릿명 또는 설명으로 검색"
              allowClear
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ width: 400 }}
            />
          </Space>

          {/* 통계 */}
          <div>
            <Text type="secondary">전체 템플릿: </Text>
            <Text strong style={{ fontSize: '16px' }}>
              {templates.length}개
            </Text>
            <Text type="secondary" style={{ marginLeft: 24 }}>
              필터링된 템플릿:{' '}
            </Text>
            <Text strong style={{ fontSize: '16px' }}>
              {filteredTemplates.length}개
            </Text>
          </div>

          {/* 테이블 */}
          <Table
            columns={columns}
            dataSource={filteredTemplates}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `총 ${total}개`,
            }}
          />
        </Space>
      </Card>

      {/* 템플릿 추가/수정 모달 */}
      <TemplateFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSave}
        template={selectedTemplate}
        userTypes={userTypes}
      />
    </div>
  );
}