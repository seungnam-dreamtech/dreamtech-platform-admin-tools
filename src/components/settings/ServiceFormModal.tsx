// 플랫폼 서비스 추가/수정 모달

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Alert, message } from 'antd';
import type { ServiceScope } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';

interface ServiceFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (service: ServiceScope) => void;
  service?: ServiceScope | null;
}

export function ServiceFormModal({ open, onCancel, onSave, service }: ServiceFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isEditing = !!service;

  useEffect(() => {
    if (open) {
      // 상태 초기화
      setHasChanges(false);

      if (service) {
        form.setFieldsValue({
          service_id: service.service_id,
          description: service.description,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, service, form]);

  // 폼 필드 변경 감지
  const handleFormChange = () => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    // 수정 모드: description 필드만 체크
    const touched = form.isFieldsTouched(['description']);
    setHasChanges(touched);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditing && service) {
        // 수정 모드: description만 업데이트
        try {
          if (hasChanges) {
            await userManagementService.updateServiceScope(service.service_id, {
              description: values.description,
            });
            message.success('서비스가 수정되었습니다');
          }

          // 목록 새로고침을 위해 onSave 콜백 호출
          onSave({
            ...service,
            description: values.description,
          });
        } catch (error) {
          message.error('서비스 수정에 실패했습니다');
          console.error('Failed to update service:', error);
          setLoading(false);
          return;
        }
      } else {
        // 생성 모드: 새로운 서비스 생성
        const serviceData: ServiceScope = {
          id: 0, // 서버에서 자동 생성
          service_id: values.service_id,
          description: values.description,
          bit_position: 0, // 서버에서 자동 할당
          is_active: true, // 기본값
          created_at: new Date().toISOString(),
        };

        onSave(serviceData);
      }

      form.resetFields();
      setHasChanges(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges;

  return (
    <Modal
      title={isEditing ? '서비스 스코프 수정' : '새 서비스 스코프 추가'}
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
        message="서비스 스코프 정의"
        description="플랫폼의 마이크로서비스를 정의합니다. 서비스 ID는 고유해야 하며 비트 위치는 서버에서 자동으로 할당됩니다."
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
          label="서비스 ID (Service ID)"
          name="service_id"
          rules={[
            { required: true, message: '서비스 ID를 입력하세요' },
            { pattern: /^[a-z][a-z0-9-]*$/, message: '소문자, 숫자, 하이픈만 사용 가능하며 소문자로 시작해야 합니다' },
          ]}
          tooltip="시스템에서 사용하는 고유 식별자 (예: auth, notification, ecg-analysis)"
        >
          <Input
            placeholder="ecg-analysis"
            disabled={isEditing}
          />
        </Form.Item>

        <Form.Item
          label="설명 (Description)"
          name="description"
          rules={[{ required: true, message: '설명을 입력하세요' }]}
        >
          <Input.TextArea rows={3} placeholder="ECG 신호 분석 및 진단 서비스" />
        </Form.Item>

        {isEditing && (
          <Alert
            message="참고사항"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>서비스 ID는 수정할 수 없습니다</li>
                <li>비트 위치는 자동으로 관리됩니다</li>
                <li>활성 상태는 목록에서 토글할 수 있습니다</li>
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