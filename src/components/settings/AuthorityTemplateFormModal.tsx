// 권한 템플릿 추가/수정 모달

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Alert, Divider } from 'antd';
import type { AuthorityTemplate, UserType } from '../../types/user-management';
import { USER_TYPES, PLATFORM_ROLES, MOCK_SERVICES } from '../../constants/user-management';

interface TemplateFormData {
  name: string;
  description: string;
  userType: UserType;
  isDefault: boolean;
  roles: string[];
  permissions: string[];
  serviceScopeIds: string[];
}

interface AuthorityTemplateFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (template: TemplateFormData) => void;
  template?: AuthorityTemplate | null;
}

export function AuthorityTemplateFormModal({
  open,
  onCancel,
  onSave,
  template,
}: AuthorityTemplateFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEditing = !!template;

  useEffect(() => {
    if (open) {
      if (template) {
        form.setFieldsValue({
          name: template.name,
          description: template.description,
          userType: template.userType,
          isDefault: template.isDefault,
          roles: template.roles,
          permissions: template.permissions,
          serviceScopeIds: template.serviceScopeIds,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, template, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      onSave(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? '권한 템플릿 수정' : '새 권한 템플릿 추가'}
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      width={700}
      okText={isEditing ? '수정' : '추가'}
      cancelText="취소"
      destroyOnClose
    >
      <Alert
        message="권한 템플릿 우선순위 (Priority: 85)"
        description="템플릿은 User Type 기본 역할(우선순위 90)보다 높고, Individual 권한보다는 낮은 중간 레벨의 권한을 부여합니다."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* 기본 정보 */}
        <Form.Item
          label="템플릿 이름"
          name="name"
          rules={[{ required: true, message: '템플릿 이름을 입력하세요' }]}
        >
          <Input placeholder="예: 의료진 기본 권한" />
        </Form.Item>

        <Form.Item
          label="설명"
          name="description"
          rules={[{ required: true, message: '설명을 입력하세요' }]}
        >
          <Input.TextArea rows={2} placeholder="템플릿의 용도와 포함된 권한을 설명하세요" />
        </Form.Item>

        <Divider orientation="left">대상 및 설정</Divider>

        <Form.Item
          label="사용자 유형 (User Type)"
          name="userType"
          rules={[{ required: true, message: '사용자 유형을 선택하세요' }]}
          tooltip="이 템플릿을 적용할 사용자 유형을 선택합니다"
        >
          <Select
            placeholder="사용자 유형 선택"
            options={USER_TYPES.map(type => ({
              label: `${type.label} (${type.value})`,
              value: type.value,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="기본 템플릿"
          name="isDefault"
          valuePropName="checked"
          tooltip="User Type별로 하나의 기본 템플릿만 지정할 수 있습니다"
        >
          <Switch checkedChildren="기본" unCheckedChildren="일반" />
        </Form.Item>

        <Divider orientation="left">권한 설정</Divider>

        <Form.Item
          label="플랫폼 역할"
          name="roles"
          rules={[{ required: true, message: '최소 하나 이상의 역할을 선택하세요' }]}
          tooltip="이 템플릿이 부여할 플랫폼 레벨 역할을 선택합니다"
        >
          <Select
            mode="multiple"
            placeholder="플랫폼 역할 선택"
            options={PLATFORM_ROLES.map(role => ({
              label: `${role.displayName} (${role.name})`,
              value: role.name,
            }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="권한 (Permissions)"
          name="permissions"
          rules={[{ required: true, message: '최소 하나 이상의 권한을 입력하세요' }]}
          tooltip="resource:action 형식으로 입력 (예: patient:read, diagnosis:write, *:*)"
        >
          <Select
            mode="tags"
            placeholder="권한 입력 (Enter로 추가)"
            style={{ width: '100%' }}
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item
          label="서비스 스코프"
          name="serviceScopeIds"
          rules={[{ required: true, message: '최소 하나 이상의 서비스를 선택하세요' }]}
          tooltip="이 템플릿으로 접근 가능한 서비스를 선택합니다"
        >
          <Select
            mode="multiple"
            placeholder="서비스 선택"
            options={MOCK_SERVICES.map(service => ({
              label: `${service.icon} ${service.displayName} (${service.name})`,
              value: service.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}