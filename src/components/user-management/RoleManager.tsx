// 역할 및 권한 관리 컴포넌트

import { Tabs, Select, Tag, Space, Alert, Empty, Divider, Typography } from 'antd';
import type { TabsProps } from 'antd';
import { PLATFORM_ROLES, SERVICE_ROLES, MOCK_SERVICES } from '../../constants/user-management';
import type { ServiceSubscription } from '../../types/user-management';

const { Text } = Typography;

interface RoleManagerProps {
  platformRoles: string[];
  onPlatformRolesChange: (roles: string[]) => void;
  serviceSubscriptions: ServiceSubscription[];
  onServiceSubscriptionsChange: (subscriptions: ServiceSubscription[]) => void;
  userType?: string; // 사용자 유형 (User Type 기반 기본 역할 표시용)
}

export function RoleManager({
  platformRoles,
  onPlatformRolesChange,
  serviceSubscriptions,
  onServiceSubscriptionsChange,
  userType,
}: RoleManagerProps) {

  // 플랫폼 역할 변경 핸들러
  const handlePlatformRolesChange = (selectedRoles: string[]) => {
    onPlatformRolesChange(selectedRoles);
  };

  // 서비스별 역할 변경 핸들러
  const handleServiceRoleChange = (serviceId: string, selectedRoles: string[]) => {
    const updated = serviceSubscriptions.map(sub =>
      sub.serviceId === serviceId
        ? { ...sub, roles: selectedRoles }
        : sub
    );
    onServiceSubscriptionsChange(updated);
  };

  // User Type 기반 기본 역할 가져오기
  const getDefaultRoleForUserType = () => {
    if (!userType) return null;

    const defaultRole = PLATFORM_ROLES.find(
      role => role.name === userType || role.name.includes(userType)
    );

    return defaultRole;
  };

  const defaultRole = getDefaultRoleForUserType();

  // 탭 아이템 정의
  const items: TabsProps['items'] = [
    {
      key: 'platform',
      label: '플랫폼 역할',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {defaultRole && (
            <Alert
              message={
                <Space direction="vertical" size={0}>
                  <Text strong>User Type 기반 기본 역할</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    사용자 유형 ({userType})에 따라 자동으로 부여되는 역할입니다.
                  </Text>
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Tag color="blue">{defaultRole.displayName}</Tag>
                  <Text style={{ fontSize: '12px' }}>{defaultRole.description}</Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    권한: {defaultRole.permissions.join(', ')}
                  </Text>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <div>
            <Text strong>추가 플랫폼 역할</Text>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>
              플랫폼 전역에서 적용되는 역할을 선택하세요.
            </Text>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="플랫폼 역할 선택"
              value={platformRoles}
              onChange={handlePlatformRolesChange}
              options={PLATFORM_ROLES.filter(role => !role.isSystem || role.name !== userType).map(role => ({
                label: (
                  <Space direction="vertical" size={0}>
                    <Text>{role.displayName}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{role.description}</Text>
                  </Space>
                ),
                value: role.name,
              }))}
            />
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div>
            <Text strong>현재 보유 플랫폼 역할</Text>
            <div style={{ marginTop: 8 }}>
              {platformRoles.length === 0 && !defaultRole ? (
                <Empty description="선택된 플랫폼 역할이 없습니다" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Space wrap>
                  {defaultRole && (
                    <Tag color="blue" key={defaultRole.name}>
                      {defaultRole.displayName} (기본)
                    </Tag>
                  )}
                  {platformRoles.map(roleName => {
                    const role = PLATFORM_ROLES.find(r => r.name === roleName);
                    return role ? (
                      <Tag color="green" key={roleName}>
                        {role.displayName}
                      </Tag>
                    ) : null;
                  })}
                </Space>
              )}
            </div>
          </div>
        </Space>
      ),
    },
    {
      key: 'service',
      label: '서비스별 역할',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {serviceSubscriptions.length === 0 ? (
            <Empty
              description="가입된 서비스가 없습니다. 먼저 서비스 가입 탭에서 서비스를 선택하세요."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            serviceSubscriptions.map(subscription => {
              const service = MOCK_SERVICES.find(s => s.id === subscription.serviceId);
              const availableRoles = SERVICE_ROLES[subscription.serviceId] || [];
              const defaultServiceRole = service?.defaultRole;

              return (
                <div
                  key={subscription.serviceId}
                  style={{
                    padding: 16,
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    background: '#fafafa',
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <span style={{ fontSize: '18px' }}>{service?.icon}</span>
                      <Text strong>{subscription.serviceName}</Text>
                      <Tag color={subscription.status === 'active' ? 'green' : 'red'}>
                        {subscription.status === 'active' ? '활성' : '비활성'}
                      </Tag>
                    </Space>

                    {defaultServiceRole && (
                      <Alert
                        message={`기본 역할: ${defaultServiceRole}`}
                        type="info"
                        showIcon
                        style={{ fontSize: '12px' }}
                      />
                    )}

                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>역할 선택:</Text>
                      <Select
                        mode="multiple"
                        style={{ width: '100%', marginTop: 4 }}
                        placeholder="서비스 역할 선택"
                        value={subscription.roles}
                        onChange={(roles) => handleServiceRoleChange(subscription.serviceId, roles)}
                        options={availableRoles.map(role => ({
                          label: (
                            <Space direction="vertical" size={0}>
                              <Space>
                                <Text>{role.displayName}</Text>
                                {role.isDefault && <Tag color="blue" style={{ fontSize: '10px' }}>기본</Tag>}
                              </Space>
                              <Text type="secondary" style={{ fontSize: '11px' }}>{role.description}</Text>
                            </Space>
                          ),
                          value: role.name,
                        }))}
                      />
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>현재 역할:</Text>
                      <div style={{ marginTop: 4 }}>
                        {subscription.roles.length === 0 ? (
                          <Text type="secondary" style={{ fontSize: '12px' }}>선택된 역할 없음</Text>
                        ) : (
                          <Space wrap>
                            {subscription.roles.map(roleName => {
                              const role = availableRoles.find(r => r.name === roleName);
                              return role ? (
                                <Tag color="purple" key={roleName}>
                                  {role.displayName}
                                </Tag>
                              ) : (
                                <Tag key={roleName}>{roleName}</Tag>
                              );
                            })}
                          </Space>
                        )}
                      </div>
                    </div>
                  </Space>
                </div>
              );
            })
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Alert
        message="권한 해결 우선순위"
        description={
          <ol style={{ marginLeft: -24, fontSize: '12px' }}>
            <li>User Type 기반 기본 역할 (우선순위: 90) - 자동 부여, 변경 불가</li>
            <li>템플릿 기반 권한 (우선순위: 85) - 시스템 관리자가 설정</li>
            <li>개별 사용자 권한 (최고 우선순위) - 여기서 설정하는 역할</li>
          </ol>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Tabs defaultActiveKey="platform" items={items} />
    </div>
  );
}