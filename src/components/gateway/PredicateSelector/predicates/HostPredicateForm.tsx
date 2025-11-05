// Host Predicate 폼 컴포넌트
import React from 'react';
import { Input, Button, Space, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ActuatorHostPredicateArgs } from '../../../../types/gateway';

interface HostPredicateFormProps {
  value: ActuatorHostPredicateArgs;
  onChange: (value: ActuatorHostPredicateArgs) => void;
}

export const HostPredicateForm: React.FC<HostPredicateFormProps> = ({
  value,
  onChange
}) => {
  // patterns가 배열이 아닌 경우 배열로 변환
  const patterns = Array.isArray(value.patterns)
    ? (value.patterns.length > 0 ? value.patterns : [''])
    : value.patterns
      ? [value.patterns as string]
      : [''];

  const handlePatternChange = (index: number, newValue: string) => {
    const newPatterns = [...patterns];
    newPatterns[index] = newValue;
    onChange({ ...value, patterns: newPatterns });
  };

  const handleAddPattern = () => {
    onChange({ ...value, patterns: [...patterns, ''] });
  };

  const handleRemovePattern = (index: number) => {
    const newPatterns = patterns.filter((_, i) => i !== index);
    onChange({ ...value, patterns: newPatterns.length > 0 ? newPatterns : [''] });
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          호스트 패턴
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {patterns.map((pattern, index) => (
          <Space key={index} style={{ width: '100%' }}>
            <Input
              value={pattern}
              onChange={(e) => handlePatternChange(index, e.target.value)}
              placeholder="예: **.example.com"
              style={{ width: '400px' }}
            />
            {patterns.length > 1 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemovePattern(index)}
              />
            )}
          </Space>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddPattern}
          style={{ width: '100%' }}
        >
          패턴 추가
        </Button>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>호스트 패턴 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>단일 호스트</Tag>
            <code>api.example.com</code>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>와일드카드</Tag>
            <code>**.example.com</code> (모든 서브도메인)
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>다중 패턴</Tag>
            <code>api.example.com</code>, <code>*.test.com</code>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 Ant Path 스타일 패턴 사용 (**, *, ?)
        </div>
      </div>
    </div>
  );
};