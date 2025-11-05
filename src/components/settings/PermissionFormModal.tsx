// 권한 정의 추가/수정 모달
import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message, App } from 'antd';
import type { PermissionDefinition, ServiceScope } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';

const { TextArea } = Input;

interface PermissionFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (permission: PermissionDefinition) => void;
  permission?: PermissionDefinition | null;
}

export default function PermissionFormModal({
  open,
  onCancel,
  onSave,
  permission,
}: PermissionFormModalProps) {
  const [form] = Form.useForm();
  const { message: messageApi } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const isEditing = !!permission;

  // 서비스 목록 로드
  useEffect(() => {
    if (open) {
      loadServices();
    }
  }, [open]);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      setHasChanges(false);

      if (permission) {
        // 수정 모드: 기존 권한 데이터 로드
        form.setFieldsValue({
          service_id: permission.service_id,
          resource: permission.resource,
          action: permission.action,
          display_name: permission.display_name,
          description: permission.description,
          category: permission.category,
        });
      } else {
        // 생성 모드: 폼 초기화
        form.resetFields();
      }
    }
  }, [open, permission, form]);

  const loadServices = async () => {
    try {
      const data = await userManagementService.getServiceScopes();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
      messageApi.error('서비스 목록을 불러오는데 실패했습니다');
    }
  };

  const handleFormChange = () => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    // 수정 모드: 수정 가능한 필드만 체크
    const fieldsToCheck = ['display_name', 'description', 'category'];
    const touched = form.isFieldsTouched(fieldsToCheck);
    setHasChanges(touched);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditing && permission) {
        // 수정 모드: display_name, description, category만 수정 가능
        const updateData = {
          display_name: values.display_name,
          description: values.description,
          category: values.category,
        };

        const updated = await userManagementService.updatePermission(
          permission.id,
          updateData
        );

        messageApi.success('권한이 수정되었습니다');
        onSave(updated);
      } else {
        // 생성 모드: 모든 필드 전송
        const createData = {
          service_id: values.service_id,
          resource: values.resource,
          action: values.action,
          display_name: values.display_name,
          description: values.description,
          category: values.category,
        };

        const created = await userManagementService.createPermission(createData);
        messageApi.success('권한이 생성되었습니다');
        onSave(created);
      }

      form.resetFields();
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to save permission:', error);

      if (error?.errorFields) {
        // 폼 검증 오류
        return;
      }

      messageApi.error(
        error?.message || '권한 저장에 실패했습니다'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setHasChanges(false);
    onCancel();
  };

  // 저장 버튼 비활성화 조건: 수정 모드에서 변경사항 없을 때
  const isSaveButtonDisabled = isEditing && !hasChanges;

  return (
    <Modal
      title={isEditing ? '권한 수정' : '권한 추가'}
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="저장"
      cancelText="취소"
      width={600}
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        preserve={false}
      >
        {/* 서비스 ID */}
        <Form.Item
          label="서비스"
          name="service_id"
          rules={[{ required: true, message: '서비스를 선택해주세요' }]}
          tooltip="권한이 속한 서비스를 선택합니다"
        >
          <Select
            placeholder="서비스 선택"
            disabled={isEditing} // 수정 시 변경 불가
            showSearch
            optionFilterProp="children"
          >
            {services.map((service) => (
              <Select.Option key={service.service_id} value={service.service_id}>
                {service.service_name} ({service.service_id})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Resource */}
        <Form.Item
          label="리소스 (Resource)"
          name="resource"
          rules={[
            { required: true, message: '리소스를 입력해주세요' },
            {
              pattern: /^[a-z*][a-z0-9_*]*$/,
              message: '소문자, 숫자, 언더스코어, *만 사용 가능합니다',
            },
          ]}
          tooltip="권한이 적용되는 리소스 (예: user, hospital, report). *는 모든 리소스를 의미합니다"
        >
          <Input
            placeholder="예: user, hospital, *"
            disabled={isEditing} // 수정 시 변경 불가
            maxLength={50}
          />
        </Form.Item>

        {/* Action */}
        <Form.Item
          label="액션 (Action)"
          name="action"
          rules={[
            { required: true, message: '액션을 입력해주세요' },
            {
              pattern: /^[a-z*][a-z0-9_*:]*$/,
              message: '소문자, 숫자, 언더스코어, :, *만 사용 가능합니다',
            },
          ]}
          tooltip="수행할 작업 (예: read, write, manage, *). *는 모든 액션을 의미합니다"
        >
          <Input
            placeholder="예: read, write, manage, *"
            disabled={isEditing} // 수정 시 변경 불가
            maxLength={50}
          />
        </Form.Item>

        {/* 표시명 */}
        <Form.Item
          label="표시명"
          name="display_name"
          rules={[{ required: true, message: '표시명을 입력해주세요' }]}
          tooltip="사용자에게 보여질 권한 이름"
        >
          <Input
            placeholder="예: 사용자 관리 권한"
            maxLength={100}
          />
        </Form.Item>

        {/* 설명 */}
        <Form.Item
          label="설명"
          name="description"
          rules={[{ required: true, message: '설명을 입력해주세요' }]}
          tooltip="권한에 대한 자세한 설명"
        >
          <TextArea
            placeholder="이 권한의 역할과 범위를 설명해주세요"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 카테고리 */}
        <Form.Item
          label="카테고리"
          name="category"
          rules={[{ required: true, message: '카테고리를 입력해주세요' }]}
          tooltip="권한을 그룹화할 카테고리 (예: 사용자 관리, 병원 관리)"
        >
          <Input
            placeholder="예: 사용자 관리, 병원 관리"
            maxLength={50}
          />
        </Form.Item>

        {/* 안내 메시지 */}
        {isEditing && (
          <div style={{
            padding: '12px',
            background: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#666',
          }}>
            <strong>참고:</strong> 서비스, 리소스, 액션은 수정할 수 없습니다.
            표시명, 설명, 카테고리만 수정 가능합니다.
          </div>
        )}

        {!isEditing && (
          <div style={{
            padding: '12px',
            background: '#e6f7ff',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#0050b3',
          }}>
            <strong>권한 문자열 형식:</strong> <code>resource:action</code><br />
            입력한 리소스와 액션이 결합되어 권한 문자열이 생성됩니다.<br />
            예: resource="user", action="manage" → "user:manage"
          </div>
        )}
      </Form>
    </Modal>
  );
}