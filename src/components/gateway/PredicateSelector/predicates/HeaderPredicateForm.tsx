// Header Predicate 폼 컴포넌트
import React from 'react';
import { Input, Space, Tag } from 'antd';
import type { ActuatorHeaderPredicateArgs } from '../../../../types/gateway';

interface HeaderPredicateFormProps {
  value: ActuatorHeaderPredicateArgs;
  onChange: (value: ActuatorHeaderPredicateArgs) => void;
}

export const HeaderPredicateForm: React.FC<HeaderPredicateFormProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Header Name */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              헤더 이름
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.name || value.header}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="예: X-Request-Id"
          />
        </div>

        {/* Header Value (Regexp) */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>헤더 값 (정규식)</span>
          </div>
          <Input
            value={value.value || value.regexp}
            onChange={(e) => onChange({ ...value, regexp: e.target.value })}
            placeholder="예: \\d+"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 정규식으로 헤더 값을 검증합니다 (선택사항)
          </div>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>예시:</strong>
        <div style={{ marginTop: '4px' }}>
          • <Tag color="blue" style={{ fontSize: '11px' }}>X-Request-Id</Tag> + <Tag color="green" style={{ fontSize: '11px' }}>\d+</Tag>
          <div style={{ marginLeft: '8px', marginTop: '2px', color: '#666' }}>→ X-Request-Id 헤더가 숫자만 포함하는 경우</div>
        </div>
        <div style={{ marginTop: '4px' }}>
          • <Tag color="blue" style={{ fontSize: '11px' }}>Authorization</Tag> + <Tag color="green" style={{ fontSize: '11px' }}>Bearer .*</Tag>
          <div style={{ marginLeft: '8px', marginTop: '2px', color: '#666' }}>→ Authorization 헤더가 Bearer로 시작하는 경우</div>
        </div>
      </div>
    </div>
  );
};