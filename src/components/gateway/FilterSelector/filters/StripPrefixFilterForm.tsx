// StripPrefix Filter 폼 컴포넌트
import React from 'react';
import { InputNumber, Tag } from 'antd';
import type { ActuatorStripPrefixFilterArgs } from '../../../../types/gateway';

interface StripPrefixFilterFormProps {
  value: ActuatorStripPrefixFilterArgs;
  onChange: (value: ActuatorStripPrefixFilterArgs) => void;
}

export const StripPrefixFilterForm: React.FC<StripPrefixFilterFormProps> = ({
  value,
  onChange
}) => {
  const partsValue = typeof value.parts === 'string' ? parseInt(value.parts) : value.parts;

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          제거할 경로 세그먼트 수
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <InputNumber
        value={partsValue}
        onChange={(val) => onChange({ ...value, parts: String(val || 1) })}
        min={1}
        max={10}
        style={{ width: '200px' }}
      />

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>동작 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            Parts = <Tag color="blue" style={{ fontSize: '11px' }}>1</Tag>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/api/users/123</code> → <code style={{ color: '#52c41a' }}>/users/123</code>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/api/docs/swagger</code> → <code style={{ color: '#52c41a' }}>/docs/swagger</code>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            Parts = <Tag color="blue" style={{ fontSize: '11px' }}>2</Tag>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/api/v1/users/123</code> → <code style={{ color: '#52c41a' }}>/users/123</code>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/api/v1/docs</code> → <code style={{ color: '#52c41a' }}>/docs</code>
          </div>
        </div>

        <div style={{ marginTop: '12px', color: '#fa8c16' }}>
          💡 주의: 경로 세그먼트가 부족하면 빈 경로(/)가 됩니다
        </div>
      </div>
    </div>
  );
};