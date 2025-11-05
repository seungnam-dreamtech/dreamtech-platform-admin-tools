// 서비스 역할 추가/수정 모달

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Alert, message, Tag, Space, Tooltip, Tabs } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ServiceRoleDefinition, ServiceScope } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import PermissionSelector from './PermissionSelector';

interface ServiceRoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (role: ServiceRoleDefinition) => void;
  role?: ServiceRoleDefinition | null;
  services: ServiceScope[]; // 서비스 선택을 위한 서비스 목록
}

export function ServiceRoleFormModal({
  open,
  onCancel,
  onSave,
  role,
  services,
}: ServiceRoleFormModalProps) {
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
          service_id: role.service_id,
          role_name: role.role_name,
          display_name: role.display_name,
          description: role.description,
          is_active: role.is_active,
          is_system_role: role.is_system_role,
        });
        setPermissions(role.permissions || []);
      } else {
        form.resetFields();
        // 신규 추가 시 기본값 설정
        form.setFieldsValue({
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
    const fieldsToCheck = ['display_name', 'description'];
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
      message.warning('권한 형식이 올바르지 않습니다. (예: analysis:read, data:write)');
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
            await userManagementService.toggleServiceRoleActivation(
              role.service_id,
              role.role_name,
              newActivationState
            );
            message.success(`역할이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
          }

          // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
          if (hasChanges) {
            await userManagementService.updateServiceRole(
              role.service_id,
              role.role_name,
              {
                display_name: values.display_name,
                description: values.description,
                permissions: permissions,
              }
            );
            message.success('역할이 수정되었습니다');
          }

          // 목록 새로고침을 위해 onSave 콜백 호출
          onSave({
            ...role,
            display_name: values.display_name,
            description: values.description,
            permissions: permissions,
            is_active: newActivationState !== undefined ? newActivationState : role.is_active,
          });
        } catch (error) {
          message.error('역할 수정에 실패했습니다');
          console.error('Failed to update service role:', error);
          setLoading(false);
          return;
        }
      } else {
        // 생성 모드: 새로운 역할 생성
        const roleData: ServiceRoleDefinition = {
          service_id: values.service_id,
          role_name: values.role_name,
          display_name: values.display_name,
          description: values.description,
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
      title={isEditing ? '서비스 역할 수정' : '새 서비스 역할 추가'}
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      width={700}
      okText={isEditing ? '수정' : '추가'}
      cancelText="취소"
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      destroyOnClose
    >
      <Alert
        message="서비스 역할 정의"
        description="특정 서비스에만 적용되는 역할입니다. (Service ID, Role Name) 조합이 고유해야 합니다."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        onValuesChange={handleFormChange}
      >
        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="서비스 ID"
            name="service_id"
            rules={[{ required: true, message: '서비스를 선택하세요' }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="서비스 선택"
              disabled={isEditing}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={services.map((s) => ({
                label: `${s.service_id} (${s.description})`,
                value: s.service_id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Role Name"
            name="role_name"
            rules={[
              { required: true, message: 'Role Name을 입력하세요' },
              {
                pattern: /^[A-Z][A-Z0-9_]*$/,
                message: '대문자, 숫자, 언더스코어만 사용 가능하며 대문자로 시작해야 합니다',
              },
            ]}
            tooltip="역할 이름 (예: DOCTOR, TECHNICIAN, ADMIN)"
            style={{ flex: 1 }}
          >
            <Input
              placeholder="DOCTOR"
              disabled={isEditing}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
        </Space>

        <Form.Item
          label="표시명"
          name="display_name"
          rules={[{ required: true, message: '표시명을 입력하세요' }]}
        >
          <Input placeholder="의사" />
        </Form.Item>

        <Form.Item
          label="설명"
          name="description"
          rules={[{ required: true, message: '설명을 입력하세요' }]}
        >
          <Input.TextArea rows={3} placeholder="심전도 분석 결과 확인 및 판독 권한" />
        </Form.Item>

        {/* 권한 관리 */}
        <Form.Item
          label={
            <Space>
              권한 설정
              <Tooltip title="서비스의 권한을 선택하거나 수동으로 입력할 수 있습니다">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
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
                    serviceFilter={form.getFieldValue('service_id')}
                  />
                ),
              },
              {
                key: 'manual',
                label: '수동 입력',
                children: (
                  <div>
                    <Input
                      placeholder="권한을 입력하세요 (예: analysis:read)"
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
                    <div style={{ marginTop: 8, minHeight: 40 }}>
                      {permissions.length === 0 ? (
                        <span style={{ color: '#999' }}>권한이 없습니다</span>
                      ) : (
                        <Space wrap>
                          {permissions.map((permission) => (
                            <Tag
                              key={permission}
                              closable
                              onClose={() => handleRemovePermission(permission)}
                              color="blue"
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

        {isEditing && (
          <Alert
            message="참고사항"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>서비스 ID와 Role Name은 수정할 수 없습니다</li>
                <li>활성 상태는 목록에서 토글할 수 있습니다</li>
                {role?.is_system_role && <li>시스템 역할은 삭제할 수 없습니다</li>}
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
}