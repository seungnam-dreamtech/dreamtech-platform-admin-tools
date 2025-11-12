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
  Row,
  Col,
  Divider,
  InputNumber,
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
  CLIENT_TYPE_OPTIONS,
  GRANT_TYPE_OPTIONS,
  COMMON_SCOPES,
} from '../../constants/user-management';
import { ClientAuthorityTypesManager } from '../../components/oauth/ClientAuthorityTypesManager';
import { userManagementService } from '../../services/userManagementService';
import { formatTokenDuration } from '../../utils/tokenUtils';

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
      const data = await userManagementService.getUserTypeDefinitions();
      const activeTypes = data.filter(type => type.is_active);
      setUserTypeDefinitions(activeTypes);
    } catch (error) {
      message.error('User Type 정의 조회에 실패했습니다');
      console.error(error);
    }
  };

  // 클라이언트 목록 조회 (비활성화된 것 포함)
  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getClients({ includeDeleted: true });
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

    // Client Type 필터 (optional 필드이므로 존재 여부 체크)
    if (filterClientType !== 'ALL') {
      filtered = filtered.filter(client => client.client_type === filterClientType);
    }

    // Enabled 필터 (deleted_at 기반: null이면 활성, 값 있으면 비활성)
    if (filterEnabled !== 'ALL') {
      filtered = filtered.filter(client =>
        filterEnabled === 'enabled' ? !client.deleted_at : !!client.deleted_at
      );
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        client =>
          client.client_name.toLowerCase().includes(keyword) ||
          client.client_id.toLowerCase().includes(keyword)
      );
    }

    setFilteredClients(filtered);
  }, [searchKeyword, filterClientType, filterEnabled, clients]);

  // 클라이언트 추가/수정
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (selectedClient) {
        // 수정: PUT /v1/management/clients/{clientId}
        const updateData: import('../../types/user-management').ClientUpdateRequest = {
          client_name: values.clientName,
          redirect_uris: values.redirectUris?.split('\n').filter((uri: string) => uri.trim()),
          post_logout_redirect_uris: values.postLogoutRedirectUris?.split('\n').filter((uri: string) => uri.trim()),
          scopes: values.scopes,
          authorization_grant_types: values.grantTypes,
          client_authentication_methods: values.authMethods || ['CLIENT_SECRET_BASIC'],
          access_token_time_to_live: values.accessTokenTTL,
          refresh_token_time_to_live: values.refreshTokenTTL,
          use_public_client: values.requirePkce || false,
          reuse_refresh_tokens: values.reuseRefreshTokens ?? false,
        };

        await userManagementService.updateClient(selectedClient.id, updateData);
        message.success('OAuth 클라이언트가 수정되었습니다');
      } else {
        // 추가: POST /v1/management/clients
        const createData: import('../../types/user-management').ClientCreateRequest = {
          client_id: values.clientId,
          client_name: values.clientName,
          redirect_uris: values.redirectUris?.split('\n').filter((uri: string) => uri.trim()),
          post_logout_redirect_uris: values.postLogoutRedirectUris?.split('\n').filter((uri: string) => uri.trim()),
          scopes: values.scopes,
          authorization_grant_types: values.grantTypes,
          client_authentication_methods: values.authMethods || ['CLIENT_SECRET_BASIC'],
          access_token_time_to_live: values.accessTokenTTL || '1H',
          refresh_token_time_to_live: values.refreshTokenTTL || '24H',
          use_public_client: values.requirePkce || false,
          reuse_refresh_tokens: values.reuseRefreshTokens ?? false,
        };

        await userManagementService.createClient(createData);
        message.success('새 OAuth 클라이언트가 추가되었습니다');
      }

      fetchClients();
      setModalOpen(false);
      setSelectedClient(null);
      form.resetFields();
    } catch (error) {
      message.error('OAuth 클라이언트 저장에 실패했습니다');
      console.error('Form save failed:', error);
    }
  };

  // 클라이언트 삭제 (소프트 삭제)
  const handleDelete = async (id: string) => {
    try {
      await userManagementService.deleteClient(id);
      message.success('OAuth 클라이언트가 삭제되었습니다');
      fetchClients();
    } catch (error) {
      message.error('OAuth 클라이언트 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 클라이언트 활성화/비활성화 (deleted_at 기반)
  const handleToggleEnabled = async (client: OAuthClient) => {
    try {
      const isCurrentlyActive = !client.deleted_at;

      if (isCurrentlyActive) {
        // 비활성화 = 삭제
        await userManagementService.deleteClient(client.id);
        message.success('클라이언트가 비활성화되었습니다');
      } else {
        // 활성화 = 복원 (백엔드 API 필요)
        // TODO: 백엔드에 PATCH /v1/management/clients/{clientId}/restore API 추가 필요
        message.warning('클라이언트 활성화 API가 아직 구현되지 않았습니다');
        console.warn('Restore API not implemented yet');
      }

      fetchClients();
    } catch (error) {
      message.error('클라이언트 상태 변경에 실패했습니다');
      console.error(error);
    }
  };

  // Client Secret 복사
  const handleCopySecret = (clientId: string) => {
    if (clientId) {
      // 마스킹된 시크릿이므로 그대로 복사 (실제로는 regenerate API 호출 필요)
      navigator.clipboard.writeText('********');
      message.info('Client Secret은 보안상 마스킹되어 있습니다. 재생성 기능을 사용하세요.');
    }
  };


  // 모달 열기
  const handleOpenModal = (client?: OAuthClient) => {
    if (client) {
      setSelectedClient(client);
      form.setFieldsValue({
        clientId: client.client_id,
        clientName: client.client_name,
        clientType: client.client_type,
        authorityTypes: client.authority_types || [],
        redirectUris: client.redirect_uris?.join('\n') || '',
        postLogoutRedirectUris: client.post_logout_redirect_uris?.join('\n') || '',
        scopes: client.scopes,
        grantTypes: client.authorization_grant_types,
        authMethods: client.client_authentication_methods,
        accessTokenTTL: client.access_token_time_to_live,
        refreshTokenTTL: client.refresh_token_time_to_live,
        requirePkce: client.use_public_client,
        reuseRefreshTokens: client.reuse_refresh_tokens,
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
            <span style={{ fontSize: '12px', fontWeight: 500 }}>{record.client_name}</span>
          </Space>
          <span style={{ fontSize: '10px', color: '#999' }}>
            {record.client_id}
          </span>
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>타입</span>,
      dataIndex: 'client_type',
      key: 'client_type',
      width: 120,
      render: (type?: ClientType) => {
        if (!type) return <Tag style={{ fontSize: '10px', margin: 0 }}>-</Tag>;
        const typeOption = CLIENT_TYPE_OPTIONS.find(t => t.value === type);
        return <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>{typeOption?.label || type}</Tag>;
      },
    },
    {
      title: <span style={{ fontSize: '11px' }}>상태</span>,
      key: 'status',
      width: 70,
      align: 'center',
      render: (_, record) => {
        const isActive = !record.deleted_at;
        return (
          <Switch
            size="small"
            checked={isActive}
            onChange={() => handleToggleEnabled(record)}
          />
        );
      },
    },
    {
      title: <span style={{ fontSize: '11px' }}>Grant Types</span>,
      dataIndex: 'authorization_grant_types',
      key: 'authorization_grant_types',
      width: 150,
      render: (types: string[]) => (
        <Tooltip title={types?.join(', ') || ''}>
          <Space size={[0, 4]} wrap>
            {types?.slice(0, 2).map(type => (
              <Tag key={type} style={{ fontSize: '10px', margin: 0 }}>
                {type.replace('_', ' ')}
              </Tag>
            ))}
            {types && types.length > 2 && (
              <Tag style={{ fontSize: '10px', margin: 0 }}>+{types.length - 2}</Tag>
            )}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>생성 가능 User Type</span>,
      dataIndex: 'authority_types',
      key: 'authority_types',
      width: 150,
      render: (authorityTypes?: ClientAuthorityType[]) => {
        if (!authorityTypes || authorityTypes.length === 0) {
          return <span style={{ fontSize: '11px', color: '#999' }}>없음</span>;
        }
        return (
          <Tooltip
            title={authorityTypes
              .map(
                at => {
                  const userTypeDef = userTypeDefinitions.find(ut => ut.type_id === at.user_type);
                  return `${userTypeDef?.display_name || at.user_type}${at.is_default ? ' (기본)' : ''}`;
                }
              )
              .join(', ')}
          >
            <Space size={[0, 4]} wrap>
              {authorityTypes.slice(0, 2).map(at => {
                const userTypeDef = userTypeDefinitions.find(ut => ut.type_id === at.user_type);
                return (
                  <Tag
                    key={at.user_type}
                    color={at.is_default ? 'gold' : 'purple'}
                    style={{ fontSize: '10px', margin: 0 }}
                  >
                    {userTypeDef?.display_name || at.user_type}
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
      render: (scopes?: string[]) => (
        <Tooltip title={scopes?.join(', ') || ''}>
          <Badge count={scopes?.length || 0} showZero color="green" style={{ fontSize: '10px' }} />
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>URIs</span>,
      dataIndex: 'redirect_uris',
      key: 'redirect_uris',
      width: 80,
      align: 'center',
      render: (uris?: string[]) => (
        <Tooltip title={uris?.join('\n') || ''}>
          <Badge count={uris.length} showZero color="purple" style={{ fontSize: '10px' }} />
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>PKCE</span>,
      dataIndex: 'use_public_client',
      key: 'use_public_client',
      width: 70,
      align: 'center',
      render: (usePublic: boolean) =>
        usePublic ? (
          <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
            Public
          </Tag>
        ) : (
          <Tag color="default" style={{ fontSize: '10px', margin: 0 }}>
            Confidential
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
            Access: {formatTokenDuration(record.access_token_time_to_live)}
          </span>
          <span style={{ fontSize: '10px', color: '#666' }}>
            Refresh: {formatTokenDuration(record.refresh_token_time_to_live)}
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
          {/* 기본 정보 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Client ID"
                name="clientId"
                rules={[
                  { required: !selectedClient, message: 'Client ID를 입력하세요' },
                  { pattern: /^[a-zA-Z0-9-_]+$/, message: '영문, 숫자, -, _ 만 사용 가능합니다' },
                ]}
              >
                <Input
                  placeholder="예: healthcare-web-app"
                  disabled={!!selectedClient}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="클라이언트 이름"
                name="clientName"
                rules={[{ required: true, message: '클라이언트 이름을 입력하세요' }]}
              >
                <Input placeholder="예: Healthcare Web Application" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="클라이언트 타입"
                name="clientType"
                tooltip="UI 분류용 (선택사항)"
              >
                <Select
                  placeholder="타입 선택 (선택사항)"
                  allowClear
                  options={CLIENT_TYPE_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">OAuth2 설정</Divider>

          {/* URIs */}
          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                label="Post Logout Redirect URIs"
                name="postLogoutRedirectUris"
                tooltip="로그아웃 후 리다이렉트할 URI (선택사항)"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="https://example.com&#10;http://localhost:3000"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Scopes & Grant Types */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Scopes"
                name="scopes"
                rules={[{ required: true, message: '최소 하나 이상의 scope를 선택하세요' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Scope 선택 또는 직접 입력"
                  options={[...COMMON_SCOPES].map(scope => ({
                    label: scope,
                    value: scope,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Grant Types"
                name="grantTypes"
                rules={[{ required: true, message: '최소 하나 이상의 grant type을 선택하세요' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Grant Type 선택"
                  options={GRANT_TYPE_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Authentication Methods */}
          <Form.Item
            label="Client Authentication Methods"
            name="authMethods"
            rules={[{ required: true, message: '인증 방식을 선택하세요' }]}
            initialValue={['CLIENT_SECRET_BASIC']}
          >
            <Select
              mode="multiple"
              placeholder="인증 방식 선택"
              options={[
                { label: 'Client Secret Basic', value: 'CLIENT_SECRET_BASIC' },
                { label: 'Client Secret Post', value: 'CLIENT_SECRET_POST' },
                { label: 'Client Secret JWT', value: 'CLIENT_SECRET_JWT' },
                { label: 'Private Key JWT', value: 'PRIVATE_KEY_JWT' },
                { label: 'None (Public Client)', value: 'NONE' },
              ]}
            />
          </Form.Item>

          <Divider orientation="left">토큰 설정</Divider>

          {/* Token Validity */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Access Token 유효기간"
                name="accessTokenTTL"
                tooltip="예: 1H (1시간), 30M (30분), 3600S (3600초)"
                initialValue="1H"
              >
                <Input placeholder="예: 1H" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Refresh Token 유효기간"
                name="refreshTokenTTL"
                tooltip="예: 24H (24시간), 7D (7일)"
                initialValue="24H"
              >
                <Input placeholder="예: 24H" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Refresh Token 재사용"
                name="reuseRefreshTokens"
                valuePropName="checked"
                tooltip="Refresh Token을 재사용할지 여부"
                initialValue={false}
              >
                <Switch checkedChildren="재사용" unCheckedChildren="일회용" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">클라이언트 설정</Divider>

          {/* Client Settings */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Public Client (PKCE)"
                name="requirePkce"
                valuePropName="checked"
                tooltip="Public Client는 PKCE를 필수로 사용합니다 (예: 모바일 앱, SPA)"
                initialValue={false}
              >
                <Switch checkedChildren="Public" unCheckedChildren="Confidential" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">허용된 User Type 관리</Divider>

          {/* Authority Types */}
          <Form.Item
            label="생성 가능한 User Type"
            name="authorityTypes"
            tooltip="이 클라이언트를 통해 회원가입 시 생성 가능한 사용자 유형을 설정합니다"
          >
            <ClientAuthorityTypesManager userTypeDefinitions={userTypeDefinitions} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}