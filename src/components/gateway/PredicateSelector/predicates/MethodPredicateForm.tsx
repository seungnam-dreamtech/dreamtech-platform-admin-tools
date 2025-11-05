// Method Predicate 폼 컴포넌트
import React from 'react';
import { Checkbox, Space, Tag } from 'antd';
import type { ActuatorMethodPredicateArgs } from '../../../../types/gateway';

interface MethodPredicateFormProps {
  value: ActuatorMethodPredicateArgs;
  onChange: (value: ActuatorMethodPredicateArgs) => void;
}

const HTTP_METHODS = [
  { value: 'GET', color: 'green' },
  { value: 'POST', color: 'blue' },
  { value: 'PUT', color: 'orange' },
  { value: 'DELETE', color: 'red' },
  { value: 'PATCH', color: 'purple' },
  { value: 'OPTIONS', color: 'cyan' },
  { value: 'HEAD', color: 'geekblue' }
];

export const MethodPredicateForm: React.FC<MethodPredicateFormProps> = ({
  value,
  onChange
}) => {
  // methods가 배열이 아닌 경우 배열로 변환
  const methods = Array.isArray(value.methods)
    ? value.methods
    : value.methods
      ? [value.methods as string]
      : [];

  const handleMethodToggle = (method: string) => {
    const newMethods = methods.includes(method)
      ? methods.filter(m => m !== method)
      : [...methods, method];

    onChange({
      ...value,
      methods: newMethods
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          HTTP 메서드 선택
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <Space wrap size="middle">
        {HTTP_METHODS.map(({ value: methodValue, color }) => (
          <Checkbox
            key={methodValue}
            checked={methods.includes(methodValue)}
            onChange={() => handleMethodToggle(methodValue)}
          >
            <Tag color={color} style={{ margin: 0, fontWeight: 'bold' }}>
              {methodValue}
            </Tag>
          </Checkbox>
        ))}
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px' }}>
        💡 선택한 HTTP 메서드만 이 라우트로 전달됩니다
        <div style={{ marginTop: '4px' }}>
          선택된 메서드: {methods.length > 0 ? (
            <Space wrap style={{ marginTop: '4px' }}>
              {methods.map(m => {
                const methodConfig = HTTP_METHODS.find(hm => hm.value === m);
                return (
                  <Tag key={m} color={methodConfig?.color} style={{ fontSize: '11px' }}>
                    {m}
                  </Tag>
                );
              })}
            </Space>
          ) : (
            <span style={{ color: '#ff4d4f' }}>없음 (최소 1개 선택 필요)</span>
          )}
        </div>
      </div>
    </div>
  );
};