// Query Predicate 폼 컴포넌트
import React from 'react';
import { Input, Space, Tag, Checkbox } from 'antd';
import type { ActuatorQueryPredicateArgs } from '../../../../types/gateway';

interface QueryPredicateFormProps {
  value: ActuatorQueryPredicateArgs;
  onChange: (value: ActuatorQueryPredicateArgs) => void;
}

export const QueryPredicateForm: React.FC<QueryPredicateFormProps> = ({
  value,
  onChange
}) => {
  const handleParamChange = (newValue: string) => {
    onChange({ ...value, param: newValue });
  };

  const handleRegexpChange = (newValue: string) => {
    onChange({ ...value, regexp: newValue });
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 파라미터 이름 */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              쿼리 파라미터 이름
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.param}
            onChange={(e) => handleParamChange(e.target.value)}
            placeholder="예: userId"
            style={{ width: '100%' }}
          />
        </div>

        {/* 정규식 (선택) */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              값 패턴 (정규식, 선택사항)
            </span>
          </div>
          <Input
            value={value.regexp || ''}
            onChange={(e) => handleRegexpChange(e.target.value)}
            placeholder="예: \\d+ (숫자만 허용)"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 비워두면 파라미터 존재 여부만 체크
          </div>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Query Predicate 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>파라미터 존재 확인</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              param = <code>userId</code>, regexp = (비워둠)
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              → <code>/api/users?userId=123</code> ✓ 매칭
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>값 패턴 매칭</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              param = <code>userId</code>, regexp = <code>\d+</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              → <code>/api/users?userId=123</code> ✓ 매칭
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              → <code>/api/users?userId=abc</code> ✗ 불일치
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};