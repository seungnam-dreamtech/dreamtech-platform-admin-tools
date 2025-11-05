// 글로벌 역할 추가/수정 모달

import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Alert, message, Tag, Space, Tooltip, Tabs } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { GlobalRole } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import PermissionSelector from './PermissionSelector';

interface GlobalRoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (role: GlobalRole) => void;
  role?: GlobalRole | null;
  existingRoles: GlobalRole[]; // 부모 역할 선택을 위한 기존 역할 목록
}

export function GlobalRoleFormModal({
  open,
  onCancel,
  onSave,
  role,
  existingRoles,
}: GlobalRoleFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activationChanged, setActivationChanged] = useState(false);
  const [newActivationState, setNewActivationState] = useState<boolean | undefined>(undefined);

  // 권한 입력을 위한 상태
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState('');

  const isEditing = !!role;

  useEffect(() => {
    if (open) {
      // 상태 초기화
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);

      if (role) {
        form.setFieldsValue({
          role_id: role.role_id,
          display_name: role.display_name,
          description: role.description,
          authority_level: role.authority_level,
          parent_role_id: role.parent_role_id,
          is_active: role.is_active,
          is_system_role: role.is_system_role,
        });
        setPermissions(role.permissions || []);
      } else {
        form.resetFields();
        // 신규 추가 시 기본값 설정
        form.setFieldsValue({
          authority_level: 50,
          is_active: true,
          is_system_role: false,
        });
        setPermissions([]);
      }
      setPermissionInput('');
    }
  }, [open, role, form]);

  // 폼 필드 변경 감지
  const handleFormChange = () => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    // 수정 모드: 활성 상태를 제외한 필드만 체크
    const fieldsToCheck = ['display_name', 'description', 'authority_level', 'parent_role_id'];
    const touched = form.isFieldsTouched(fieldsToCheck);
    setHasChanges(touched);
  };

  // 활성 상태 변경 처리
  const handleActivationChange = (checked: boolean) => {
    if (isEditing && role && checked !== role.is_active) {
      setActivationChanged(true);
      setNewActivationState(checked);
    } else {
      setActivationChanged(false);
      setNewActivationState(undefined);
    }
  };

  // 권한 추가
  const handleAddPermission = () => {
    const trimmed = permissionInput.trim();
    if (!trimmed) {
      return;
    }

    // 권한 형식 검증: resource:action 또는 *:*
    const permissionPattern = /^[a-z*][a-z0-9_*]*:[a-z*][a-z0-9_*:]*$/;
    if (!permissionPattern.test(trimmed)) {
      message.warning('권한 형식이 올바르지 않습니다. (예: user:manage, *:*)');
      return;
    }

    if (permissions.includes(trimmed)) {
      message.warning('이미 추가된 권한입니다');
      return;
    }

    setPermissions([...permissions, trimmed]);
    setPermissionInput('');
    setHasChanges(true);
  };

  // 권한 제거
  const handleRemovePermission = (permission: string) => {
    setPermissions(permissions.filter((p) => p !== permission));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditing && role) {
        // 수정 모드: 활성 상태와 일반 필드를 별도로 처리
        try {
          // 1. 활성 상태가 변경되었으면 별도 API 호출
          if (activationChanged && newActivationState !== undefined) {
            await userManagementService.toggleGlobalRoleActivation(role.role_id, newActivationState);
            message.success(`역할이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
          }

          // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
          if (hasChanges) {
            await userManagementService.updateGlobalRole(role.role_id, {
              display_name: values.display_name,
              description: values.description,
              authority_level: values.authority_level,
              parent_role_id: values.parent_role_id,
              permissions: permissions,
            });
            message.success('역할이 수정되었습니다');
          }

          // 목록 새로고침을 위해 onSave 콜백 호출
          onSave({
            ...role,
            display_name: values.display_name,
            description: values.description,
            authority_level: values.authority_level,
            parent_role_id: values.parent_role_id,
            permissions: permissions,
            is_active: newActivationState !== undefined ? newActivationState : role.is_active,
          });
        } catch (error) {
          message.error('역할 수정에 실패했습니다');
          console.error('Failed to update global role:', error);
          setLoading(false);
          return;
        }
      } else {
        // 생성 모드: 새로운 역할 생성
        const roleData: GlobalRole = {
          role_id: values.role_id,
          display_name: values.display_name,
          description: values.description,
          authority_level: values.authority_level,
          parent_role_id: values.parent_role_id,
          permissions: permissions,
          is_system_role: values.is_system_role || false,
          is_active: values.is_active,
          created_at: new Date().toISOString(),
          created_by: 'ADMIN',
        };

        onSave(roleData);
      }

      form.resetFields();
      setPermissions([]);
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges && !activationChanged;

  return (
    <Modal
      title={isEditing ? '글로벌 역할 수정' : '새 글로벌 역할 추가'}
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      width={900}
      okText={isEditing ? '수정' : '추가'}
      cancelText="취소"
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
      >
        {/* 기본 정보 - 2단 레이아웃 */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label={
              <Space size={4}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Role ID</span>
                <Tooltip
                  title={
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>시스템 고유 식별자</div>
                      <div style={{ color: '#e6f7ff' }}>• 대문자로 시작 (A-Z)</div>
                      <div style={{ color: '#e6f7ff' }}>• 대문자, 숫자, 언더스코어(_)만 사용</div>
                      <div style={{ color: '#e6f7ff' }}>• 예: HOSPITAL_ADMIN, PLATFORM_USER</div>
                      {isEditing && (
                        <div style={{ marginTop: 6, color: '#ffd666', fontWeight: 500 }}>
                          ⚠️ 수정 불가 항목
                        </div>
                      )}
                    </div>
                  }
                  overlayInnerStyle={{
                    backgroundColor: '#1890ff',
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: '12px', color: '#1890ff', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            name="role_id"
            rules={[
              { required: true, message: 'Role ID를 입력하세요' },
              {
                pattern: /^[A-Z][A-Z0-9_]*$/,
                message: '대문자, 숫자, 언더스코어만 사용 가능',
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="HOSPITAL_ADMIN"
              disabled={isEditing}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space size={4}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>표시명</span>
                <Tooltip
                  title={
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>사용자 친화적 이름</div>
                      <div style={{ color: '#e6f7ff' }}>UI에 표시되는 역할의 한글명</div>
                      <div style={{ color: '#e6f7ff', marginTop: 4 }}>예: 병원 관리자, 플랫폼 사용자</div>
                    </div>
                  }
                  overlayInnerStyle={{
                    backgroundColor: '#52c41a',
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: '12px', color: '#52c41a', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            name="display_name"
            rules={[{ required: true, message: '표시명을 입력하세요' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="병원 관리자" />
          </Form.Item>
        </div>

        {/* 권한 레벨 & 부모 역할 */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label={
              <Space size={4}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>권한 레벨</span>
                <Tooltip
                  title={
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>권한 우선순위 (1-100)</div>
                      <div style={{ color: '#fff4e6' }}>• 낮을수록 높은 권한 (1 = 최고 권한)</div>
                      <div style={{ color: '#fff4e6' }}>• 1-10: 시스템 관리자급</div>
                      <div style={{ color: '#fff4e6' }}>• 11-50: 중급 관리자</div>
                      <div style={{ color: '#fff4e6' }}>• 51-100: 일반 사용자</div>
                    </div>
                  }
                  overlayInnerStyle={{
                    backgroundColor: '#fa8c16',
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: '12px', color: '#fa8c16', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            name="authority_level"
            rules={[
              { required: true, message: '권한 레벨을 입력하세요' },
              { type: 'number', min: 1, max: 100, message: '1-100 범위로 입력하세요' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber min={1} max={100} placeholder="50" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label={
              <Space size={4}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>부모 역할</span>
                <Tooltip
                  title={
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>권한 상속 (선택사항)</div>
                      <div style={{ color: '#e6fffb' }}>상위 역할의 모든 권한을 자동으로 상속받습니다</div>
                      <div style={{ color: '#e6fffb', marginTop: 4 }}>
                        예: SERVICE_ADMIN을 부모로 선택하면<br/>
                        해당 역할의 모든 권한을 포함하게 됩니다
                      </div>
                    </div>
                  }
                  overlayInnerStyle={{
                    backgroundColor: '#13c2c2',
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: '12px', color: '#13c2c2', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            name="parent_role_id"
            style={{ flex: 1 }}
          >
            <Select
              placeholder="부모 역할 선택 (선택사항)"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={existingRoles
                .filter((r) => r.role_id !== role?.role_id)
                .map((r) => ({
                  label: `${r.role_id} (Level ${r.authority_level})`,
                  value: r.role_id,
                }))}
            />
          </Form.Item>
        </div>

        {/* 설명 - 전체 너비 */}
        <Form.Item
          label={<span style={{ fontSize: '12px', fontWeight: 500 }}>설명</span>}
          name="description"
          rules={[{ required: true, message: '설명을 입력하세요' }]}
        >
          <Input.TextArea rows={2} placeholder="역할에 대한 설명을 입력하세요" />
        </Form.Item>

        {/* 권한 관리 - Tabs로 수동 입력과 목록 선택 분리 */}
        <Form.Item
          label={
            <Space size={4}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>권한 설정</span>
              <Tooltip
                title={
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>두 가지 방식 지원</div>
                    <div style={{ color: '#f9f0ff' }}>• 목록에서 선택: 정의된 권한을 트리 구조로 선택</div>
                    <div style={{ color: '#f9f0ff' }}>• 수동 입력: 권한 문자열을 직접 입력</div>
                  </div>
                }
                overlayInnerStyle={{
                  backgroundColor: '#722ed1',
                  borderRadius: '6px',
                  padding: '10px 12px'
                }}
              >
                <InfoCircleOutlined style={{ fontSize: '12px', color: '#722ed1', cursor: 'help' }} />
              </Tooltip>
            </Space>
          }
        >
          <Tabs
            defaultActiveKey="selector"
            items={[
              {
                key: 'selector',
                label: '목록에서 선택',
                children: (
                  <PermissionSelector
                    value={permissions}
                    onChange={(selected) => {
                      setPermissions(selected);
                      setHasChanges(true);
                    }}
                  />
                ),
              },
              {
                key: 'manual',
                label: '수동 입력',
                children: (
                  <div>
                    <Input
                      placeholder="권한을 입력하세요 (예: user:manage)"
                      value={permissionInput}
                      onChange={(e) => setPermissionInput(e.target.value)}
                      onPressEnter={handleAddPermission}
                      suffix={
                        <PlusOutlined
                          style={{ color: '#1890ff', cursor: 'pointer' }}
                          onClick={handleAddPermission}
                        />
                      }
                    />
                    <div
                      style={{
                        marginTop: 8,
                        minHeight: 60,
                        maxHeight: 120,
                        overflowY: 'auto',
                        padding: '8px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      {permissions.length === 0 ? (
                        <span style={{ color: '#999', fontSize: '11px' }}>권한이 없습니다</span>
                      ) : (
                        <Space wrap size={[4, 4]}>
                          {permissions.map((permission) => (
                            <Tag
                              key={permission}
                              closable
                              onClose={() => handleRemovePermission(permission)}
                              color="blue"
                              style={{ fontSize: '11px', margin: 0 }}
                            >
                              {permission}
                            </Tag>
                          ))}
                        </Space>
                      )}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}