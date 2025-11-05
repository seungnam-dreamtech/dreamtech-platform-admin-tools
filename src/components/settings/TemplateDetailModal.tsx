// Permission Template 상세 모달
import { Modal, Descriptions, Tag, Space, Empty } from 'antd';
import type { PermissionTemplate } from '../../types/user-management';

interface TemplateDetailModalProps {
  open: boolean;
  onClose: () => void;
  template: PermissionTemplate | null;
}

export default function TemplateDetailModal({
  open,
  onClose,
  template,
}: TemplateDetailModalProps) {
  if (!template) {
    return null;
  }

  return (
    <Modal
      title={
        <Space>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>{template.name}</span>
          {template.is_active ? (
            <Tag color="green">활성</Tag>
          ) : (
            <Tag color="default">비활성</Tag>
          )}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="ID">
          <span style={{ fontSize: '12px', color: '#666' }}>{template.id}</span>
        </Descriptions.Item>

        <Descriptions.Item label="템플릿 이름">
          <span style={{ fontSize: '12px', fontWeight: 500 }}>{template.name}</span>
        </Descriptions.Item>

        {template.category && (
          <Descriptions.Item label="카테고리">
            <Tag color="blue">{template.category}</Tag>
          </Descriptions.Item>
        )}

        {template.description && (
          <Descriptions.Item label="설명">
            <span style={{ fontSize: '12px', color: '#666' }}>{template.description}</span>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="글로벌 역할">
          {template.global_roles.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="글로벌 역할 없음"
              style={{ margin: '8px 0' }}
            />
          ) : (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {template.global_roles.map((role) => (
                <div
                  key={role.role_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#fafafa',
                    borderRadius: '4px',
                  }}
                >
                  <Space>
                    <Tag color="purple" style={{ fontSize: '11px', margin: 0 }}>
                      {role.role_id}
                    </Tag>
                    <span style={{ fontSize: '12px' }}>{role.display_name}</span>
                  </Space>
                  {role.description && (
                    <span style={{ fontSize: '11px', color: '#999' }}>{role.description}</span>
                  )}
                </div>
              ))}
            </Space>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="서비스 역할">
          {template.service_roles.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="서비스 역할 없음"
              style={{ margin: '8px 0' }}
            />
          ) : (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {template.service_roles.map((role) => (
                <div
                  key={`${role.service_id}:${role.role_name}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#fafafa',
                    borderRadius: '4px',
                  }}
                >
                  <Space>
                    <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
                      {role.service_id}
                    </Tag>
                    <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
                      {role.role_name}
                    </Tag>
                  </Space>
                  {role.description && (
                    <span style={{ fontSize: '11px', color: '#999' }}>{role.description}</span>
                  )}
                </div>
              ))}
            </Space>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="생성 정보">
          <Space direction="vertical" size={0}>
            <span style={{ fontSize: '11px', color: '#666' }}>
              생성자: {template.created_by}
            </span>
            <span style={{ fontSize: '11px', color: '#999' }}>
              생성일: {new Date(template.created_at).toLocaleString('ko-KR')}
            </span>
          </Space>
        </Descriptions.Item>

        {template.updated_at && (
          <Descriptions.Item label="수정 정보">
            <Space direction="vertical" size={0}>
              <span style={{ fontSize: '11px', color: '#666' }}>
                수정자: {template.updated_by}
              </span>
              <span style={{ fontSize: '11px', color: '#999' }}>
                수정일: {new Date(template.updated_at).toLocaleString('ko-KR')}
              </span>
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
}