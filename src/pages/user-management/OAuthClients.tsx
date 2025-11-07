// OAuth2/OIDC 클라이언트 관리 페이지

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  Select,
  Tooltip,
  Popconfirm,
  Badge,
  Switch,
  Modal,
  Form,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CopyOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { OAuthClient, ClientType, ClientAuthorityType, UserTypeDefinition } from '../../types/user-management';
import {
  MOCK_OAUTH_CLIENTS,
  MOCK_SERVICES,
  MOCK_USER_TYPE_DEFINITIONS,
  CLIENT_TYPE_OPTIONS,
  GRANT_TYPE_OPTIONS,
  COMMON_SCOPES,
} from '../../constants/user-management';
import { ClientAuthorityTypesManager } from '../../components/oauth/ClientAuthorityTypesManager';

const { Search } = Input;

export default function OAuthClients() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<OAuthClient[]>([]);
  const [userTypeDefinitions, setUserTypeDefinitions] = useState<UserTypeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<OAuthClient | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterClientType, setFilterClientType] = useState<ClientType | 'ALL'>('ALL');
  const [filterEnabled, setFilterEnabled] = useState<'ALL' | 'enabled' | 'disabled'>('ALL');
  const [form] = Form.useForm();

  // User Type Definitions 조회
  const fetchUserTypeDefinitions = async () => {
    try {
      // TODO: 실제 API 연동
      // const data = await userManagementService.getUserTypeDefinitions();
      const data = MOCK_USER_TYPE_DEFINITIONS.filter(type => type.is_active);
      setUserTypeDefinitions(data);
    } catch (error) {
      message.error('User Type 정의 조회에 실패했습니다');
      console.error(error);
    }
  };

  // 클라이언트 목록 조회
  const fetchClients = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 연동
      // const data = await userManagementService.getOAuthClients();
      const data: OAuthClient[] = [...MOCK_OAUTH_CLIENTS];
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      message.error('OAuth 클라이언트 목록 조회에 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTypeDefinitions();
    fetchClients();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...clients];

    // Client Type 필터
    if (filterClientType !== 'ALL') {
      filtered = filtered.filter(client => client.clientType === filterClientType);
    }

    // Enabled 필터
    if (filterEnabled !== 'ALL') {
      filtered = filtered.filter(client =>
        filterEnabled === 'enabled' ? client.enabled : !client.enabled
      );
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        client =>
          client.clientName.toLowerCase().includes(keyword) ||
          client.clientId.toLowerCase().includes(keyword)
      );
    }

    setFilteredClients(filtered);
  }, [searchKeyword, filterClientType, filterEnabled, clients]);

  // 클라이언트 추가/수정
  const handleSave = async () => {
    try {
      await form.validateFields();
      if (selectedClient) {
        // 수정
        message.success('OAuth 클라이언트가 수정되었습니다');
      } else {
        // 추가
        message.success('새 OAuth 클라이언트가 추가되었습니다');
      }
      fetchClients();
      setModalOpen(false);
      setSelectedClient(null);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // 클라이언트 삭제
  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting client:', id);
      message.success('OAuth 클라이언트가 삭제되었습니다');
      fetchClients();
    } catch (error) {
      message.error('OAuth 클라이언트 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 클라이언트 활성화/비활성화
  const handleToggleEnabled = async (client: OAuthClient) => {
    try {
      message.success(
        client.enabled ? '클라이언트가 비활성화되었습니다' : '클라이언트가 활성화되었습니다'
      );
      fetchClients();
    } catch (error) {
      message.error('클라이언트 상태 변경에 실패했습니다');
      console.error(error);
    }
  };

  // Client Secret 복사
  const handleCopySecret = (clientId: string) => {
    // TODO: 실제로는 API를 통해 실제 secret을 가져와야 함
    navigator.clipboard.writeText(`${clientId}-secret-placeholder`);
    message.success('Client Secret이 클립보드에 복사되었습니다');
  };


  // 모달 열기
  const handleOpenModal = (client?: OAuthClient) => {
    if (client) {
      setSelectedClient(client);
      form.setFieldsValue({
        clientName: client.clientName,
        clientType: client.clientType,
        authorityTypes: client.authorityTypes || [],
        redirectUris: client.redirectUris.join('\n'),
        postLogoutRedirectUris: client.postLogoutRedirectUris?.join('\n') || '',
        scopes: client.scopes,
        grantTypes: client.grantTypes,
        requirePkce: client.requirePkce,
        enabled: client.enabled,
      });
    } else {
      setSelectedClient(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<OAuthClient> = [
    {
      title: <span style={{ fontSize: '11px' }}>클라이언트 정보</span>,
      key: 'client',
      width: 220,
      fixed: 'left',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size="small">
            <ApiOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
            <span style={{ fontSize: '12px', fontWeight: 500 }}>{record.clientName}</span>
          </Space>
          <span style={{ fontSize: '10px', color: '#999' }}>
            {record.clientId}
          </span>
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>타입</span>,
      dataIndex: 'clientType',
      key: 'clientType',
      width: 120,
      render: (type: ClientType) => {
        const typeOption = CLIENT_TYPE_OPTIONS.find(t => t.value === type);
        return <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>{typeOption?.label || type}</Tag>;
      },
    },
    {
      title: <span style={{ fontSize: '11px' }}>상태</span>,
      dataIndex: 'enabled',
      key: 'enabled',
      width: 70,
      align: 'center',
      render: (enabled: boolean, record) => (
        <Switch
          size="small"
          checked={enabled}
          onChange={() => handleToggleEnabled(record)}
        />
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>Grant Types</span>,
      dataIndex: 'grantTypes',
      key: 'grantTypes',
      width: 150,
      render: (types: string[]) => (
        <Tooltip title={types.join(', ')}>
          <Space size={[0, 4]} wrap>
            {types.slice(0, 2).map(type => (
              <Tag key={type} style={{ fontSize: '10px', margin: 0 }}>
                {type}
              </Tag>
            ))}
            {types.length > 2 && (
              <Tag style={{ fontSize: '10px', margin: 0 }}>+{types.length - 2}</Tag>
            )}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>생성 가능 User Type</span>,
      dataIndex: 'authorityTypes',
      key: 'authorityTypes',
      width: 150,
      render: (authorityTypes: ClientAuthorityType[]) => {
        if (!authorityTypes || authorityTypes.length === 0) {
          return <span style={{ fontSize: '11px', color: '#999' }}>없음</span>;
        }
        return (
          <Tooltip
            title={authorityTypes
              .map(
                at => {
                  const userTypeDef = userTypeDefinitions.find(ut => ut.type_id === at.userType);
                  return `${userTypeDef?.display_name || at.userType}${at.isDefault ? ' (기본)' : ''}`;
                }
              )
              .join(', ')}
          >
            <Space size={[0, 4]} wrap>
              {authorityTypes.slice(0, 2).map(at => {
                const userTypeDef = userTypeDefinitions.find(ut => ut.type_id === at.userType);
                return (
                  <Tag
                    key={at.userType}
                    color={at.isDefault ? 'gold' : 'purple'}
                    style={{ fontSize: '10px', margin: 0 }}
                  >
                    {userTypeDef?.display_name || at.userType}
                  </Tag>
                );
              })}
              {authorityTypes.length > 2 && (
                <Tag style={{ fontSize: '10px', margin: 0 }}>+{authorityTypes.length - 2}</Tag>
              )}
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: <span style={{ fontSize: '11px' }}>Scopes</span>,
      dataIndex: 'scopes',
      key: 'scopes',
      width: 80,
      align: 'center',
      render: (scopes: string[]) => (
        <Tooltip title={scopes.join(', ')}>
          <Badge count={scopes.length} showZero color="green" style={{ fontSize: '10px' }} />
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>URIs</span>,
      dataIndex: 'redirectUris',
      key: 'redirectUris',
      width: 80,
      align: 'center',
      render: (uris: string[]) => (
        <Tooltip title={uris.join('\n')}>
          <Badge count={uris.length} showZero color="purple" style={{ fontSize: '10px' }} />
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>PKCE</span>,
      dataIndex: 'requirePkce',
      key: 'requirePkce',
      width: 70,
      align: 'center',
      render: (required: boolean) =>
        required ? (
          <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
            필수
          </Tag>
        ) : (
          <Tag color="default" style={{ fontSize: '10px', margin: 0 }}>
            선택
          </Tag>
        ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>토큰 유효기간</span>,
      key: 'tokenValidity',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '10px', color: '#666' }}>
            Access: {record.accessTokenValidity ? `${record.accessTokenValidity}s` : '-'}
          </span>
          <span style={{ fontSize: '10px', color: '#666' }}>
            Refresh: {record.refreshTokenValidity ? `${record.refreshTokenValidity}s` : '-'}
          </span>
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>작업</span>,
      key: 'actions',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Client Secret 복사">
            <Button
              icon={<CopyOutlined />}
              size="small"
              type="text"
              onClick={() => handleCopySecret(record.clientId)}
            />
          </Tooltip>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="text"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="OAuth 클라이언트 삭제"
            description={`"${record.clientName}" 클라이언트를 삭제하시겠습니까?`}
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
            OAuth 클라이언트 ({filteredClients.length}개)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            OAuth2/OpenID Connect 클라이언트 관리
          </span>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchClients} loading={loading}>
            새로고침
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            클라이언트 추가
          </Button>
        </Space>
      </div>

      {/* 검색 및 필터 */}
      <Space size="middle" wrap>
        <Select
          style={{ width: 200 }}
          value={filterClientType}
          onChange={setFilterClientType}
          options={[
            { label: '전체 타입', value: 'ALL' },
            ...CLIENT_TYPE_OPTIONS,
          ]}
        />
        <Select
          style={{ width: 150 }}
          value={filterEnabled}
          onChange={setFilterEnabled}
          options={[
            { label: '전체 상태', value: 'ALL' },
            { label: '활성', value: 'enabled' },
            { label: '비활성', value: 'disabled' },
          ]}
        />
        <Search
          placeholder="클라이언트명, Client ID, 서비스로 검색"
          allowClear
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          style={{ width: 400 }}
        />
      </Space>

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredClients}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: total => `총 ${total}개`,
        }}
      />

      {/* OAuth 클라이언트 추가/수정 모달 */}
      <Modal
        title={selectedClient ? 'OAuth 클라이언트 수정' : '새 OAuth 클라이언트 추가'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedClient(null);
          form.resetFields();
        }}
        onOk={handleSave}
        width={800}
        okText={selectedClient ? '수정' : '추가'}
        cancelText="취소"
      >
        <Alert
          message="OAuth2/OIDC 클라이언트 설정"
          description="애플리케이션이 인증 서버와 통신하기 위한 클라이언트 설정을 관리합니다."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical">
          <Form.Item
            label="클라이언트 이름"
            name="clientName"
            rules={[{ required: true, message: '클라이언트 이름을 입력하세요' }]}
          >
            <Input placeholder="예: Healthcare Web Application" />
          </Form.Item>

          <Form.Item
            label="클라이언트 타입"
            name="clientType"
            rules={[{ required: true, message: '클라이언트 타입을 선택하세요' }]}
          >
            <Select placeholder="클라이언트 타입 선택" options={[...CLIENT_TYPE_OPTIONS]} />
          </Form.Item>

          <Form.Item
            label="생성 가능한 User Type"
            name="authorityTypes"
            tooltip="이 클라이언트를 통해 생성 가능한 사용자 유형을 설정합니다"
          >
            <ClientAuthorityTypesManager userTypeDefinitions={userTypeDefinitions} />
          </Form.Item>

          <Form.Item label="연결된 서비스" name="serviceId">
            <Select
              placeholder="서비스 선택 (선택사항)"
              allowClear
              options={MOCK_SERVICES.map(service => ({
                label: `${service.icon} ${service.displayName}`,
                value: service.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Redirect URIs"
            name="redirectUris"
            rules={[{ required: true, message: 'Redirect URI를 입력하세요' }]}
            tooltip="각 URI를 줄바꿈으로 구분하여 입력하세요"
          >
            <Input.TextArea
              rows={3}
              placeholder="https://example.com/callback&#10;http://localhost:3000/callback"
            />
          </Form.Item>

          <Form.Item
            label="Post Logout Redirect URIs"
            name="postLogoutRedirectUris"
            tooltip="로그아웃 후 리다이렉트할 URI (선택사항)"
          >
            <Input.TextArea
              rows={2}
              placeholder="https://example.com&#10;http://localhost:3000"
            />
          </Form.Item>

          <Form.Item
            label="Scopes"
            name="scopes"
            rules={[{ required: true, message: '최소 하나 이상의 scope를 선택하세요' }]}
          >
            <Select
              mode="multiple"
              placeholder="Scope 선택"
              options={[...COMMON_SCOPES].map(scope => ({
                label: scope,
                value: scope,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Grant Types"
            name="grantTypes"
            rules={[{ required: true, message: '최소 하나 이상의 grant type을 선택하세요' }]}
          >
            <Select
              mode="multiple"
              placeholder="Grant Type 선택"
              options={[...GRANT_TYPE_OPTIONS]}
            />
          </Form.Item>

          <Form.Item label="PKCE 필수 여부" name="requirePkce" valuePropName="checked">
            <Switch checkedChildren="필수" unCheckedChildren="선택" />
          </Form.Item>

          <Form.Item label="클라이언트 활성화" name="enabled" valuePropName="checked">
            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}