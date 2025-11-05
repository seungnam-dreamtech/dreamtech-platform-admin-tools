// RewritePath Filter 폼 컴포넌트
import React from 'react';
import { Input, Space, Tag } from 'antd';
import type { ActuatorRewritePathFilterArgs } from '../../../../types/gateway';

interface RewritePathFilterFormProps {
  value: ActuatorRewritePathFilterArgs;
  onChange: (value: ActuatorRewritePathFilterArgs) => void;
}

export const RewritePathFilterForm: React.FC<RewritePathFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Regexp */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              정규식 패턴
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.regexp}
            onChange={(e) => onChange({ ...value, regexp: e.target.value })}
            placeholder="예: /api/(?<segment>.*)"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 Java 정규식 문법 사용 (그룹 캡처 가능)
          </div>
        </div>

        {/* Replacement */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              치환 패턴
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.replacement}
            onChange={(e) => onChange({ ...value, replacement: e.target.value })}
            placeholder="예: /${segment}"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 캡처된 그룹을 사용할 수 있습니다
          </div>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>예시:</strong>

        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>정규식</Tag>
            <code>/api/(?{'<'}segment{'>'}.*)</code>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>치환</Tag>
            <code>/${'{'} segment {'}'}</code>
          </div>
          <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
            → <code>/api/users/123</code> ⇒ <code style={{ color: '#52c41a' }}>/users/123</code>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>정규식</Tag>
            <code>/v[0-9]+/(?{'<'}path{'>'}.*)</code>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>치환</Tag>
            <code>/${'{'} path {'}'}</code>
          </div>
          <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
            → <code>/v1/users/profile</code> ⇒ <code style={{ color: '#52c41a' }}>/users/profile</code>
          </div>
        </div>
      </div>
    </div>
  );
};