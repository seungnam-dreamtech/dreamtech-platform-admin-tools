// 라우트 기본 정보 입력 폼
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Input, InputNumber, Checkbox, Space, Tag } from 'antd';
import { FormSection } from '../common/FormSection';
import { InfoCircleOutlined } from '@ant-design/icons';

export interface RouteBasicInfo {
  id: string;
  displayName?: string;
  uri: string;
  order: number;
  enabled: boolean;
}

interface RouteBasicInfoFormProps {
  value: RouteBasicInfo;
  onChange: (value: RouteBasicInfo) => void;
  readOnly?: boolean; // 수정 모드일 때 Route ID를 읽기 전용으로
}

export const RouteBasicInfoForm: React.FC<RouteBasicInfoFormProps> = ({
  value,
  onChange,
  readOnly = false
}) => {
  const handleFieldChange = (field: keyof RouteBasicInfo, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <FormSection
        title="기본 정보"
        description="라우트의 기본 식별 정보를 입력합니다"
        icon={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
      >
        {/* Route ID */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              Route ID
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              {readOnly && (
                <Tag color="orange" style={{ fontSize: '10px', marginLeft: '8px' }}>
                  수정 불가
                </Tag>
              )}
            </span>
          </div>
          <Input
            value={value.id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            placeholder="예: user-service-route"
            disabled={readOnly}
            style={readOnly ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : undefined}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            {readOnly
              ? '💡 Route ID는 수정할 수 없습니다 (삭제 후 재생성 필요)'
              : '💡 라우트를 식별하는 고유 ID (영문, 숫자, 하이픈만 사용)'}
          </div>
        </div>

        {/* Display Name */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Display Name</span>
          </div>
          <Input
            value={value.displayName}
            onChange={(e) => handleFieldChange('displayName', e.target.value)}
            placeholder="예: User Service"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 관리 화면에 표시될 이름 (선택사항)
          </div>
        </div>

        {/* URI */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              URI (목적지)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.uri}
            onChange={(e) => handleFieldChange('uri', e.target.value)}
            placeholder="예: lb://user-service 또는 http://localhost:8080"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 라우팅할 대상 서비스 URI
            <div style={{ marginTop: '4px' }}>
              <Tag color="blue" style={{ fontSize: '11px' }}>lb://service-name</Tag>
              <span style={{ marginLeft: '4px' }}>로드밸런서 사용</span>
            </div>
            <div style={{ marginTop: '2px' }}>
              <Tag color="green" style={{ fontSize: '11px' }}>http://host:port</Tag>
              <span style={{ marginLeft: '4px' }}>직접 URL 지정</span>
            </div>
          </div>
        </div>

        {/* Order */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Order (우선순위)</span>
          </div>
          <InputNumber
            value={value.order}
            onChange={(val) => handleFieldChange('order', val || 0)}
            placeholder="0"
            style={{ width: '200px' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 숫자가 낮을수록 먼저 실행됩니다 (기본값: 0)
          </div>
        </div>

        {/* Enabled */}
        <div>
          <Checkbox
            checked={value.enabled}
            onChange={(e) => handleFieldChange('enabled', e.target.checked)}
          >
            <span style={{ fontWeight: 'bold' }}>라우트 활성화</span>
          </Checkbox>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '24px', marginTop: '4px' }}>
            💡 비활성화하면 이 라우트는 무시됩니다
          </div>
        </div>
      </FormSection>
    </Space>
  );
};