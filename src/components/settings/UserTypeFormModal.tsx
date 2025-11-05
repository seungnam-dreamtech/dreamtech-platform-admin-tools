// 사용자 유형 추가/수정 모달

import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Alert, Space, message } from 'antd';
import type { UserTypeDefinition } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';

interface UserTypeFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (userType: UserTypeDefinition) => void;
  userType?: UserTypeDefinition | null;
}

export function UserTypeFormModal({ open, onCancel, onSave, userType }: UserTypeFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activationChanged, setActivationChanged] = useState(false);
  const [newActivationState, setNewActivationState] = useState<boolean | undefined>(undefined);

  const isEditing = !!userType;

  useEffect(() => {
    if (open) {
      // 상태 초기화
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);

      if (userType) {
        form.setFieldsValue({
          type_id: userType.type_id,
          display_name: userType.display_name,
          description: userType.description,
          display_order: userType.display_order,
          is_active: userType.is_active,
          is_system_type: userType.is_system_type,
          default_template_names: userType.default_template_names || [],
        });
      } else {
        form.resetFields();
        // 신규 추가 시 기본값 설정
        form.setFieldsValue({
          display_order: 50,
          is_active: true,
          is_system_type: false,
          default_template_names: [],
        });
      }
    }
  }, [open, userType, form]);

  // 폼 필드 변경 감지
  const handleFormChange = () => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    // 수정 모드: 활성 상태를 제외한 필드만 체크
    const fieldsToCheck = ['display_name', 'description', 'display_order'];
    const touched = form.isFieldsTouched(fieldsToCheck);
    setHasChanges(touched);
  };

  // 활성 상태 변경 처리
  const handleActivationChange = (checked: boolean) => {
    if (isEditing && userType && checked !== userType.is_active) {
      setActivationChanged(true);
      setNewActivationState(checked);
    } else {
      setActivationChanged(false);
      setNewActivationState(undefined);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditing && userType) {
        // 수정 모드: 활성 상태와 일반 필드를 별도로 처리
        try {
          // 1. 활성 상태가 변경되었으면 별도 API 호출
          if (activationChanged && newActivationState !== undefined) {
            await userManagementService.toggleUserTypeActivation(userType.type_id, newActivationState);
            message.success(`사용자 유형이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
          }

          // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
          if (hasChanges) {
            await userManagementService.updateUserTypeDefinition(userType.type_id, {
              display_name: values.display_name,
              description: values.description,
              display_order: values.display_order,
              // is_active는 제외!
            });
            message.success('사용자 유형이 수정되었습니다');
          }

          // 목록 새로고침을 위해 onSave 콜백 호출
          onSave({
            ...userType,
            display_name: values.display_name,
            description: values.description,
            display_order: values.display_order,
            is_active: newActivationState !== undefined ? newActivationState : userType.is_active,
          });
        } catch (error) {
          message.error('사용자 유형 수정에 실패했습니다');
          console.error('Failed to update user type:', error);
          setLoading(false);
          return;
        }
      } else {
        // 생성 모드: 기존과 동일
        const userTypeData: UserTypeDefinition = {
          type_id: values.type_id,
          display_name: values.display_name,
          description: values.description,
          display_order: values.display_order,
          is_active: values.is_active,
          is_system_type: values.is_system_type || false,
          default_template_names: values.default_template_names || [],
          created_at: new Date().toISOString(),
          created_by: 'ADMIN',
        };

        onSave(userTypeData);
      }

      form.resetFields();
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
      title={isEditing ? '사용자 유형 수정' : '새 사용자 유형 추가'}
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      width={600}
      okText={isEditing ? '수정' : '추가'}
      cancelText="취소"
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      destroyOnClose
    >
      <Alert
        message="사용자 유형 정의"
        description="사용자 유형은 AuthX 권한 시스템에서 사용자를 분류하고 기본 역할을 부여하는 데 사용됩니다."
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
        <Form.Item
          label="유형 ID (Type ID)"
          name="type_id"
          rules={[
            { required: true, message: '유형 ID를 입력하세요' },
            { pattern: /^[A-Z][A-Z0-9_]*$/, message: '대문자와 숫자, 언더스코어만 사용 가능하며 대문자로 시작해야 합니다' },
          ]}
          tooltip="시스템에서 사용하는 고유 식별자 (예: EAL_DOCTOR, ADMIN)"
        >
          <Input
            placeholder="EAL_DOCTOR"
            disabled={isEditing}
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>

        <Form.Item
          label="표시명 (Display Name)"
          name="display_name"
          rules={[{ required: true, message: '표시명을 입력하세요' }]}
        >
          <Input placeholder="ECG Assist Lite 서비스 소속 의사" />
        </Form.Item>

        <Form.Item
          label="설명 (Description)"
          name="description"
          rules={[{ required: true, message: '설명을 입력하세요' }]}
        >
          <Input.TextArea rows={3} placeholder="ECG Assist Lite 서비스의 의사" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            label="표시 순서 (Display Order)"
            name="display_order"
            rules={[{ required: true, message: '표시 순서를 입력하세요' }]}
            tooltip="낮은 숫자일수록 먼저 표시됩니다"
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={1} max={999} placeholder="50" style={{ width: 120 }} />
          </Form.Item>

          <Form.Item
            label="활성 상태"
            name="is_active"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch
              onChange={handleActivationChange}
              disabled={!isEditing || (isEditing && userType?.is_system_type)}
            />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              label="시스템 타입"
              name="is_system_type"
              valuePropName="checked"
              tooltip="시스템 타입은 삭제할 수 없습니다"
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          )}
        </Space>

        {isEditing && userType?.is_system_type && (
          <Alert
            message="시스템 타입"
            description="이 사용자 유형은 시스템 타입으로 삭제할 수 없습니다."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
}
