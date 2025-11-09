// 글로벌 역할 상세 조회 Modal

import { useMemo } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Tree,
  Typography,
  Space,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  SafetyOutlined,
  ApartmentOutlined,
  KeyOutlined,
  CodeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { GlobalRole } from '../../types/user-management';
import type { DataNode } from 'antd/es/tree';
import { RoleHierarchyGraph } from './RoleHierarchyGraph';

const { Text } = Typography;

interface GlobalRoleDetailDrawerProps {
  open: boolean;
  role: GlobalRole | null;
  allRoles: GlobalRole[];
  onClose: () => void;
}

export function GlobalRoleDetailDrawer({
  open,
  role,
  allRoles,
  onClose,
}: GlobalRoleDetailDrawerProps) {
  // 역할 계층 구조 생성 (부모 → 자식)
  const roleHierarchy = useMemo(() => {
    if (!role) return [];

    const hierarchy: GlobalRole[] = [];
    let currentRole: GlobalRole | undefined = role;

    // 현재 역할부터 최상위 부모까지 역순으로 추적
    while (currentRole) {
      hierarchy.unshift(currentRole);

      if (currentRole.parent_role?.role_id) {
        currentRole = allRoles.find((r) => r.role_id === currentRole!.parent_role!.role_id);
      } else {
        break;
      }
    }

    return hierarchy;
  }, [role, allRoles]);

  // 모든 상속된 권한 수집 (중복 제거)
  const allInheritedPermissions = useMemo(() => {
    const permissionsMap = new Map<string, { permission: string; from: string }>();

    roleHierarchy.forEach((r) => {
      r.permissions.forEach((perm) => {
        if (!permissionsMap.has(perm)) {
          permissionsMap.set(perm, { permission: perm, from: r.role_id });
        }
      });
    });

    return Array.from(permissionsMap.values());
  }, [roleHierarchy]);

  // 권한을 리소스별로 그룹화
  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, { permission: string; from: string }[]>();

    allInheritedPermissions.forEach((item) => {
      const [resource] = item.permission.split(':');
      if (!groups.has(resource)) {
        groups.set(resource, []);
      }
      groups.get(resource)!.push(item);
    });

    return groups;
  }, [allInheritedPermissions]);

  // Tree 데이터 생성
  const treeData: DataNode[] = useMemo(() => {
    return Array.from(groupedPermissions.entries()).map(([resource, perms]) => ({
      key: resource,
      title: (
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: '13px' }}>
            {resource}
          </Text>
          <Tag color="blue" style={{ fontSize: '10px' }}>
            {perms.length}
          </Tag>
        </Space>
      ),
      children: perms.map((item, idx) => ({
        key: `${resource}-${idx}`,
        title: (
          <Space>
            <Text style={{ fontSize: '12px' }}>{item.permission}</Text>
            {item.from !== role?.role_id && (
              <Tag color="orange" style={{ fontSize: '10px' }}>
                from {item.from}
              </Tag>
            )}
          </Space>
        ),
        icon: <KeyOutlined style={{ fontSize: '12px', color: '#52c41a' }} />,
        isLeaf: true,
      })),
    }));
  }, [groupedPermissions, role]);

  // JWT 토큰 페이로드 시뮬레이션 (실제 표준 형식)
  const jwtPayloadPreview = useMemo(() => {
    if (!role) return null;

    const now = Math.floor(Date.now() / 1000);

    return {
      sub: 'user@example.com',
      roles: [role.role_id],
      iss: 'https://api.cardiacinsight.com',
      uuid: '01987921-53c4-7c42-9486-f0903807d05b',
      aud: 'platform-management-client',
      user_type: 'PLATFORM_ADMIN',
      service_scopes: ['ecg-assist-lite', 'notification', 'medical-data', 'schedule', 'auth'],
      permissions: allInheritedPermissions.map((p) => p.permission),
      azp: 'platform-management-client',
      scope: 'openid profile email',
      svc_act: 63,
      exp: now + 21600, // 6시간 후
      iat: now,
      svc_reg: 63,
      jti: '0199eb6c-ad75-7b61-af1c-c7043505f0a9',
    };
  }, [role, allInheritedPermissions]);

  if (!role) return null;

  return (
    <Modal
      title={
        <Space>
          <ApartmentOutlined />
          <span>역할 상세 정보: {role.role_id}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnClose
      centered
    >
      <div style={{ width: '100%' }}>
        {/* 상단: 역할 정보 */}
        <Card
          size="small"
          title={
            <Space>
              <InfoCircleOutlined />
              <span style={{ fontSize: '13px' }}>역할 정보</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Row gutter={[24, 0]}>
            <Col span={12}>
              <Descriptions size="small" column={1} colon={false} labelStyle={{ width: '70px' }}>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>Role ID</Text>}>
                  <Text strong style={{ fontSize: '12px' }}>
                    {role.role_id}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>표시명</Text>}>
                  <Text style={{ fontSize: '12px' }}>{role.display_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>권한 레벨</Text>}>
                  <Space size={4}>
                    <Tag
                      color={
                        role.authority_level <= 10
                          ? 'red'
                          : role.authority_level <= 50
                          ? 'orange'
                          : 'green'
                      }
                      style={{ fontSize: '10px' }}
                    >
                      Level {role.authority_level}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      (낮을수록 높은 권한)
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>생성일시</Text>}>
                  <Text style={{ fontSize: '11px' }}>
                    {new Date(role.created_at).toLocaleString('ko-KR')}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={12}>
              <Descriptions size="small" column={1} colon={false} labelStyle={{ width: '70px' }}>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>타입</Text>}>
                  {role.is_system_role ? (
                    <Tag color="red" style={{ fontSize: '10px' }}>
                      SYSTEM
                    </Tag>
                  ) : (
                    <Tag color="green" style={{ fontSize: '10px' }}>
                      사용자 정의
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>상태</Text>}>
                  {role.is_active ? (
                    <Tag color="success" style={{ fontSize: '10px' }}>
                      활성
                    </Tag>
                  ) : (
                    <Tag color="default" style={{ fontSize: '10px' }}>
                      비활성
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>생성자</Text>}>
                  <Text style={{ fontSize: '11px' }}>{role.created_by || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>수정자</Text>}>
                  <Text style={{ fontSize: '11px' }}>{role.updated_by || '-'}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          {/* 설명은 전체 너비로 */}
          <Descriptions size="small" column={1} colon={false} labelStyle={{ width: '70px' }} style={{ marginTop: 8 }}>
            <Descriptions.Item label={<Text style={{ fontSize: '11px' }}>설명</Text>}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {role.description || '-'}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 하단: 역할 계층 그래프 & 권한/JWT 정보 */}
        <Row gutter={16}>
          <Col span={12}>
            <Card
              size="small"
              title={
                <Space>
                  <ApartmentOutlined />
                  <span style={{ fontSize: '13px' }}>역할 계층 구조</span>
                  {roleHierarchy.length > 1 && (
                    <Tooltip title="하위 역할은 상위 역할의 모든 권한을 자동으로 상속받습니다. 드래그, 줌, 팬 가능">
                      <QuestionCircleOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
                    </Tooltip>
                  )}
                </Space>
              }
              style={{ height: '496px' }}
              bodyStyle={{ height: 'calc(100% - 38px)', padding: 0, overflow: 'hidden' }}
            >
              <RoleHierarchyGraph allRoles={allRoles} currentRoleId={role.role_id} />
            </Card>
          </Col>

          <Col span={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Card
                size="small"
                title={
                  <Space>
                    <SafetyOutlined />
                    <span style={{ fontSize: '13px' }}>권한 목록</span>
                    <Tag color="purple" style={{ fontSize: '10px' }}>
                      총 {allInheritedPermissions.length}개
                    </Tag>
                    {roleHierarchy.length > 1 && (
                      <Tooltip
                        title={`직접 권한 ${role.permissions.length}개 + 상속 권한 ${
                          allInheritedPermissions.length - role.permissions.length
                        }개`}
                      >
                        <QuestionCircleOutlined style={{ fontSize: '12px', color: '#52c41a' }} />
                      </Tooltip>
                    )}
                  </Space>
                }
                style={{ height: '240px' }}
                bodyStyle={{ height: 'calc(100% - 38px)', overflowY: 'auto' }}
              >
                <Tree
                  showIcon
                  defaultExpandAll
                  treeData={treeData}
                  style={{ fontSize: '12px' }}
                />
              </Card>

              <Card
                size="small"
                title={
                  <Space>
                    <CodeOutlined />
                    <span style={{ fontSize: '13px' }}>JWT 페이로드 미리보기</span>
                    <Tooltip title="사용자에게 이 역할이 할당되면 JWT 토큰에 다음과 같은 형태로 포함됩니다">
                      <QuestionCircleOutlined style={{ fontSize: '12px', color: '#faad14' }} />
                    </Tooltip>
                  </Space>
                }
                style={{ height: '240px' }}
                bodyStyle={{ height: 'calc(100% - 38px)', overflowY: 'auto' }}
              >
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(jwtPayloadPreview, null, 2)}
                </pre>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
}