// Cookie Predicate 폼 컴포넌트
import React from 'react';
import { Input, Space, Tag } from 'antd';
import type { ActuatorCookiePredicateArgs } from '../../../../types/gateway';

interface CookiePredicateFormProps {
  value: ActuatorCookiePredicateArgs;
  onChange: (value: ActuatorCookiePredicateArgs) => void;
}

export const CookiePredicateForm: React.FC<CookiePredicateFormProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 쿠키 이름 */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              쿠키 이름
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="예: session_id"
            style={{ width: '100%' }}
          />
        </div>

        {/* 정규식 */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              값 패턴 (정규식)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.regexp}
            onChange={(e) => onChange({ ...value, regexp: e.target.value })}
            placeholder="예: [a-f0-9]{32}"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 Java 정규식 문법 사용
          </div>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Cookie Predicate 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>세션 쿠키</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              name = <code>JSESSIONID</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              regexp = <code>[A-Z0-9]+</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → Cookie: JSESSIONID=ABC123DEF456 ✓
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>사용자 ID</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              name = <code>user_id</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              regexp = <code>\d+</code> (숫자만)
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → Cookie: user_id=12345 ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};