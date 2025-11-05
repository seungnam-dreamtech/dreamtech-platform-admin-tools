// PrefixPath Filter 폼 컴포넌트
import React from 'react';
import { Input, Tag } from 'antd';
import type { ActuatorPrefixPathFilterArgs } from '../../../../types/gateway';

interface PrefixPathFilterFormProps {
  value: ActuatorPrefixPathFilterArgs;
  onChange: (value: ActuatorPrefixPathFilterArgs) => void;
}

export const PrefixPathFilterForm: React.FC<PrefixPathFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          경로 앞에 추가할 접두사
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <Input
        value={value.prefix}
        onChange={(e) => onChange({ ...value, prefix: e.target.value })}
        placeholder="예: /api"
        style={{ width: '100%' }}
      />

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>PrefixPath 동작 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>prefix = /api</Tag>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/users/123</code> → <code style={{ color: '#52c41a' }}>/api/users/123</code>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/products</code> → <code style={{ color: '#52c41a' }}>/api/products</code>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>prefix = /v2</Tag>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/users</code> → <code style={{ color: '#52c41a' }}>/v2/users</code>
          </div>
          <div style={{ marginLeft: '8px', color: '#666' }}>
            • <code>/orders/list</code> → <code style={{ color: '#52c41a' }}>/v2/orders/list</code>
          </div>
        </div>

        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 요청 경로 앞에 접두사를 추가합니다 (백엔드 서비스의 버전 관리나 네임스페이스 지정에 유용)
        </div>
      </div>
    </div>
  );
};