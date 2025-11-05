// 플랫폼 역할 추가/수정 모달

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Space, Button, Tag, Alert } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { PlatformRole } from '../../types/user-management';

interface PlatformRoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (role: Partial<PlatformRole>) => void;
  role?: PlatformRole | null;
}

export function PlatformRoleFormModal({ open, onCancel, onSave, role }: PlatformRoleFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEditing = !!role;
  const isSystemRole = role?.isSystem;

  useEffect(() => {
    if (open) {
      if (role) {
        form.setFieldsValue({
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          permissions: role.permissions,
          isSystem: role.isSystem,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          isSystem: false,
          permissions: [],
        });
      }
    }
  }, [open, role, form]);

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
      title={isEditing ? '플랫폼 역할 수정' : '새 플랫폼 역할 추가'}
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      width={700}
      okText={isEditing ? '수정' : '추가'}
      cancelText="취소"
      destroyOnClose
    >
      {isSystemRole && (
        <Alert
          message="시스템 역할"
          description="시스템 역할은 역할 이름(name)을 수정할 수 없으며, 삭제가 제한됩니다."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="역할 이름 (Name)"
          name="name"
          rules={[
            { required: true, message: '역할 이름을 입력하세요' },
            { pattern: /^[A-Z_]+$/, message: '대문자와 언더스코어만 사용 가능합니다' },
          ]}
          tooltip="역할을 식별하는 고유 이름 (예: PLATFORM_ADMIN, DEVELOPER)"
        >
          <Input
            placeholder="PLATFORM_ADMIN"
            disabled={isEditing && isSystemRole}
          />
        </Form.Item>

        <Form.Item
          label="표시명 (Display Name)"
          name="displayName"
          rules={[{ required: true, message: '표시명을 입력하세요' }]}
        >
          <Input placeholder="플랫폼 관리자" />
        </Form.Item>

        <Form.Item
          label="설명"
          name="description"
          rules={[{ required: true, message: '설명을 입력하세요' }]}
        >
          <Input.TextArea rows={3} placeholder="플랫폼 전체에 대한 최고 관리 권한" />
        </Form.Item>

        <Form.Item
          label="권한 (Permissions)"
          tooltip="이 역할이 가지는 권한 목록을 정의합니다"
        >
          <Form.List name="permissions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        { required: true, message: '권한을 입력하세요' },
                        { pattern: /^[a-z*:]+$/, message: '소문자, 콜론, 별표만 사용 가능' },
                      ]}
                      style={{ marginBottom: 0, flex: 1 }}
                    >
                      <Input placeholder="user:read 또는 *:* (전체 권한)" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                  </Space>
                ))}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    권한 추가
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item
          label="시스템 역할"
          name="isSystem"
          valuePropName="checked"
          tooltip="시스템 역할은 삭제가 제한되며, User Type 기반 기본 역할로 사용됩니다"
        >
          <Switch
            checkedChildren="시스템 역할"
            unCheckedChildren="일반 역할"
            disabled={isEditing && isSystemRole}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}