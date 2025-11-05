// SetPath Filter 폼 컴포넌트
import React from 'react';
import { Input, Tag } from 'antd';
import type { ActuatorSetPathFilterArgs } from '../../../../types/gateway';

interface SetPathFilterFormProps {
  value: ActuatorSetPathFilterArgs;
  onChange: (value: ActuatorSetPathFilterArgs) => void;
}

export const SetPathFilterForm: React.FC<SetPathFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          새로운 경로 템플릿
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <Input
        value={value.template}
        onChange={(e) => onChange({ ...value, template: e.target.value })}
        placeholder="예: /api/{segment}"
        style={{ width: '100%' }}
      />

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
        💡 경로 변수를 사용할 수 있습니다 (Spring URI Template 문법)
      </div>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>SetPath 동작 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>경로 고정</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              template = <code>/api/fixed</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              • 모든 요청 → <code style={{ color: '#52c41a' }}>/api/fixed</code>
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>경로 변수 활용</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              Path Predicate = <code>/users/{'{'}id{'}'}</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              template = <code>/api/v2/users/{'{'}id{'}'}</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → <code>/users/123</code> ⇒ <code>/api/v2/users/123</code>
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>다중 변수</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              Path = <code>/{'{'}service{'}'}/{'{'}id{'}'}</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              template = <code>/backend/{'{'}service{'}'}/get/{'{'}id{'}'}</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → <code>/users/123</code> ⇒ <code>/backend/users/get/123</code>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 요청 경로를 템플릿 기반으로 완전히 재작성합니다
        </div>
      </div>
    </div>
  );
};