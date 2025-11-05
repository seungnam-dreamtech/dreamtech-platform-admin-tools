// Path Predicate 폼 컴포넌트
import React from 'react';
import { Space, Input, Button, Tag } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ActuatorPathPredicateArgs } from '../../../../types/gateway';

interface PathPredicateFormProps {
  value: ActuatorPathPredicateArgs;
  onChange: (value: ActuatorPathPredicateArgs) => void;
}

export const PathPredicateForm: React.FC<PathPredicateFormProps> = ({
  value,
  onChange
}) => {
  // patterns가 배열이 아닌 경우(문자열 등) 배열로 변환
  const patterns = Array.isArray(value.patterns)
    ? value.patterns
    : value.patterns
      ? [value.patterns as string]
      : [];

  const handleAddPattern = () => {
    onChange({
      ...value,
      patterns: [...patterns, '']
    });
  };

  const handleRemovePattern = (index: number) => {
    onChange({
      ...value,
      patterns: patterns.filter((_, i) => i !== index)
    });
  };

  const handlePatternChange = (index: number, newValue: string) => {
    const newPatterns = [...patterns];
    newPatterns[index] = newValue;
    onChange({
      ...value,
      patterns: newPatterns
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          경로 패턴
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {patterns.map((pattern, index) => (
          <Space key={index} style={{ width: '100%' }}>
            <Input
              value={pattern}
              onChange={(e) => handlePatternChange(index, e.target.value)}
              placeholder="/api/users/**"
              style={{ width: '400px' }}
            />
            {patterns.length > 1 && (
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
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
          경로 패턴 추가
        </Button>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
        💡 경로 패턴 예시:
        <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <Tag color="blue" style={{ fontSize: '11px' }}>/api/users/**</Tag>
          <Tag color="blue" style={{ fontSize: '11px' }}>/api/*/profile</Tag>
          <Tag color="blue" style={{ fontSize: '11px' }}>/docs/**</Tag>
        </div>
        <div style={{ marginTop: '4px' }}>
          • <code>**</code>: 여러 경로 세그먼트 매칭
          <br />
          • <code>*</code>: 단일 경로 세그먼트 매칭
        </div>
      </div>
    </div>
  );
};