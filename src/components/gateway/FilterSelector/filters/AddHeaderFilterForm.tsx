// AddRequestHeader / AddResponseHeader / AddRequestParameter 공통 폼
import React from 'react';
import { Input, Space, Tag } from 'antd';
import type { ActuatorAddHeaderFilterArgs } from '../../../../types/gateway';

interface AddHeaderFilterFormProps {
  value: ActuatorAddHeaderFilterArgs;
  onChange: (value: ActuatorAddHeaderFilterArgs) => void;
  type: 'request-header' | 'response-header' | 'request-parameter';
}

export const AddHeaderFilterForm: React.FC<AddHeaderFilterFormProps> = ({
  value,
  onChange,
  type
}) => {
  const isParameter = type === 'request-parameter';
  const nameLabel = isParameter ? '파라미터 이름' : '헤더 이름';
  const valueLabel = isParameter ? '파라미터 값' : '헤더 값';
  const namePlaceholder = isParameter ? '예: userId' : '예: X-Request-Id';
  const valuePlaceholder = isParameter ? '예: 12345' : '예: {requestId}';

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Name */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              {nameLabel}
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder={namePlaceholder}
          />
        </div>

        {/* Value */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              {valueLabel}
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.value}
            onChange={(e) => onChange({ ...value, value: e.target.value })}
            placeholder={valuePlaceholder}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 SpEL 표현식 사용 가능 (예: <code>{'#{T(java.util.UUID).randomUUID().toString()}'}</code>)
          </div>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>예시:</strong>
        <div style={{ marginTop: '4px' }}>
          {isParameter ? (
            <>
              • <Tag color="blue" style={{ fontSize: '11px' }}>version</Tag> = <Tag color="green" style={{ fontSize: '11px' }}>v1</Tag>
              <div style={{ marginLeft: '8px', marginTop: '2px', color: '#666' }}>→ ?version=v1 추가</div>
            </>
          ) : (
            <>
              • <Tag color="blue" style={{ fontSize: '11px' }}>X-Response-Time</Tag> = <Tag color="green" style={{ fontSize: '11px' }}>{'#{T(System).currentTimeMillis()}'}</Tag>
              <div style={{ marginLeft: '8px', marginTop: '2px', color: '#666' }}>→ 응답 시간 헤더 추가</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};