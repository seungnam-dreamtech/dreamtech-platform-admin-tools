// Permission Template 추가/수정 모달
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Alert,
  message,
  Tooltip,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type {
  PermissionTemplate,
  TemplateCreateRequest,
  TemplateUpdateRequest,
  GlobalRole,
  ServiceRoleDefinition,
} from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';

interface TemplateFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (templateData: TemplateCreateRequest | TemplateUpdateRequest) => void;
  template?: PermissionTemplate | null;
}

export default function TemplateFormModal({
  open,
  onCancel,
  onSave,
  template,
}: TemplateFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activationChanged, setActivationChanged] = useState(false);
  const [newActivationState, setNewActivationState] = useState<boolean | undefined>(undefined);

  // 선택 가능한 데이터
  const [globalRoles, setGlobalRoles] = useState<GlobalRole[]>([]);
  const [serviceRoles, setServiceRoles] = useState<ServiceRoleDefinition[]>([]);

  const isEditing = !!template;

  // 데이터 로드
  useEffect(() => {
    if (open) {
      loadGlobalRoles();
      loadServiceRoles();
    }
  }, [open]);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);

      if (template) {
        // 수정 모드: 기존 템플릿 데이터 로드
        // global_roles와 service_roles는 객체 배열이므로 ID만 추출
        const globalRoleIds = template.global_roles.map((r) => r.role_id);
        const serviceRoleIds = template.service_roles.map(
          (r) => `${r.service_id}:${r.role_name}`
        );

        form.setFieldsValue({
          name: template.name,
          description: template.description,
          category: template.category,
          global_role_ids: globalRoleIds,
          service_role_ids: serviceRoleIds,
          is_active: template.is_active,
        });
      } else {
        // 생성 모드: 폼 초기화
        form.resetFields();
        form.setFieldsValue({
          global_role_ids: [],
          service_role_ids: [],
          is_active: true,
        });
      }
    }
  }, [open, template, form]);

  const loadGlobalRoles = async () => {
    try {
      const data = await userManagementService.getGlobalRoles();
      setGlobalRoles(data.filter((r) => r.is_active));
    } catch (error) {
      console.error('Failed to load global roles:', error);
      message.error('글로벌 역할 목록을 불러오는데 실패했습니다');
    }
  };

  const loadServiceRoles = async () => {
    try {
      const data = await userManagementService.getServiceRoles();
      setServiceRoles(data.filter((r) => r.is_active));
    } catch (error) {
      console.error('Failed to load service roles:', error);
      message.error('서비스 역할 목록을 불러오는데 실패했습니다');
    }
  };

  const handleFormChange = () => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    // 수정 모드: is_active 제외한 필드만 체크
    const fieldsToCheck = ['name', 'description', 'category', 'global_role_ids', 'service_role_ids'];
    const touched = form.isFieldsTouched(fieldsToCheck);
    setHasChanges(touched);
  };


  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditing && template) {
        // 수정 모드: 활성 상태와 일반 필드를 별도로 처리
        try {
          // 1. 활성 상태가 변경되었으면 별도 API 호출
          if (activationChanged && newActivationState !== undefined) {
            await userManagementService.togglePermissionTemplateActivation(
              template.id,
              newActivationState
            );
            message.success(`템플릿이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
          }

          // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
          if (hasChanges) {
            const updateData: TemplateUpdateRequest = {
              name: values.name,
              description: values.description,
              category: values.category,
              global_role_ids: values.global_role_ids || [],
              service_role_ids: values.service_role_ids || [],
            };

            await userManagementService.updatePermissionTemplate(template.id, updateData);
            message.success('템플릿이 수정되었습니다');
          }

          // 목록 새로고침을 위해 onSave 콜백 호출
          onSave(values);
        } catch (error: any) {
          message.error(error?.message || '템플릿 수정에 실패했습니다');
          console.error('Failed to update permission template:', error);
          setLoading(false);
          return;
        }
      } else {
        // 생성 모드: 새로운 템플릿 생성
        const createData: TemplateCreateRequest = {
          name: values.name,
          description: values.description,
          category: values.category,
          global_role_ids: values.global_role_ids || [],
          service_role_ids: values.service_role_ids || [],
        };

        onSave(createData);
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

  const handleCancel = () => {
    form.resetFields();
    setHasChanges(false);
    setActivationChanged(false);
    setNewActivationState(undefined);
    onCancel();
  };

  // 저장 버튼 비활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges && !activationChanged;

  return (
    <Modal
      title={isEditing ? 'Permission Template 수정' : '새 Permission Template 추가'}
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={isEditing ? '수정' : '추가'}
      cancelText="취소"
      width={800}
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      destroyOnClose
    >
      <Alert
        message="Permission Template"
        description="권한 템플릿은 글로벌 역할과 서비스 역할의 조합으로 구성됩니다. 카테고리별로 그룹화하여 관리할 수 있습니다."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        preserve={false}
      >
        {/* 기본 정보 */}
        <Form.Item
          label="템플릿 이름"
          name="name"
          rules={[{ required: true, message: '템플릿 이름을 입력하세요' }]}
        >
          <Input placeholder="예: 의사 기본 권한 세트" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="설명"
          name="description"
        >
          <Input.TextArea
            rows={2}
            placeholder="템플릿에 대한 설명을 입력하세요 (선택사항)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              카테고리
              <Tooltip title="템플릿을 그룹화할 카테고리를 입력하세요 (예: 의료진, 관리자, 기술지원)">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          }
          name="category"
        >
          <Input placeholder="예: 의료진" maxLength={50} />
        </Form.Item>

        {/* 글로벌 역할 선택 */}
        <Form.Item
          label={
            <Space>
              글로벌 역할 (Global Roles)
              <Tooltip title="플랫폼 전체에 적용되는 역할을 선택하세요">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          }
          name="global_role_ids"
        >
          <Select
            mode="multiple"
            placeholder="글로벌 역할 선택 (선택사항)"
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            allowClear
          >
            {globalRoles.map((role) => (
              <Select.Option key={role.role_id} value={role.role_id}>
                <Space>
                  <Tag color="purple">{role.role_id}</Tag>
                  <span>{role.display_name}</span>
                  {role.is_system_role && (
                    <Tag color="red" style={{ fontSize: '9px' }}>
                      SYSTEM
                    </Tag>
                  )}
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    (Level {role.authority_level})
                  </span>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 서비스 역할 선택 */}
        <Form.Item
          label={
            <Space>
              서비스 역할 (Service Roles)
              <Tooltip title="특정 서비스에 적용되는 역할을 선택하세요">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          }
          name="service_role_ids"
        >
          <Select
            mode="multiple"
            placeholder="서비스 역할 선택 (선택사항)"
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={serviceRoles.map((role) => ({
              label: `${role.service_id} - ${role.display_name}`,
              value: `${role.service_id}:${role.role_name}`,
              key: `${role.service_id}:${role.role_name}`,
            }))}
            optionRender={(option) => {
              const [serviceId, roleName] = option.value.split(':');
              const role = serviceRoles.find(
                (r) => r.service_id === serviceId && r.role_name === roleName
              );

              if (!role) return null;

              return (
                <Space>
                  <Tag color="cyan" style={{ fontSize: '10px' }}>
                    {serviceId}
                  </Tag>
                  <Tag color="blue" style={{ fontSize: '10px' }}>
                    {roleName}
                  </Tag>
                  <span style={{ fontSize: '12px' }}>{role.display_name}</span>
                  {role.is_system_role && (
                    <Tag color="red" style={{ fontSize: '9px' }}>
                      SYSTEM
                    </Tag>
                  )}
                </Space>
              );
            }}
          />
        </Form.Item>

        {/* 안내 메시지 */}
        {isEditing && (
          <Alert
            message="참고사항"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>활성 상태는 목록에서 토글할 수 있습니다</li>
                <li>템플릿은 언제든지 수정 가능합니다</li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {!isEditing && (
          <Alert
            message="역할 선택 안내"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>글로벌 역할: 플랫폼 전체에 적용되는 권한</li>
                <li>서비스 역할: 특정 서비스에만 적용되는 권한</li>
                <li>최소 하나 이상의 역할을 선택하는 것을 권장합니다</li>
                <li>서비스 역할 형식: "서비스ID:역할명" (예: ecg-analysis:DOCTOR)</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
}