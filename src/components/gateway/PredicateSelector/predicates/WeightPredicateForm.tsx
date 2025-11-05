// Weight Predicate 폼 컴포넌트
import React from 'react';
import { Input, InputNumber, Space, Tag, Slider } from 'antd';
import type { ActuatorWeightPredicateArgs } from '../../../../types/gateway';

interface WeightPredicateFormProps {
  value: ActuatorWeightPredicateArgs;
  onChange: (value: ActuatorWeightPredicateArgs) => void;
}

export const WeightPredicateForm: React.FC<WeightPredicateFormProps> = ({
  value,
  onChange
}) => {
  const weightValue = typeof value.weight === 'string' ? parseInt(value.weight) : value.weight;

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 그룹 이름 */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              가중치 그룹 이름
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.group}
            onChange={(e) => onChange({ ...value, group: e.target.value })}
            placeholder="예: service-a"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 같은 그룹명을 가진 라우트들 간에 가중치가 적용됩니다
          </div>
        </div>

        {/* 가중치 */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              가중치 (1-100)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Slider
              value={weightValue}
              onChange={(val) => onChange({ ...value, weight: String(val) })}
              min={1}
              max={100}
              marks={{
                1: '1',
                25: '25',
                50: '50',
                75: '75',
                100: '100'
              }}
              style={{ width: '100%' }}
            />
            <InputNumber
              value={weightValue}
              onChange={(val) => onChange({ ...value, weight: String(val || 1) })}
              min={1}
              max={100}
              style={{ width: '120px' }}
            />
          </Space>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Weight Predicate 사용 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>A/B 테스팅</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              • Route A: group=<code>test-group</code>, weight=<code>90</code> (기존 버전)
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              • Route B: group=<code>test-group</code>, weight=<code>10</code> (신규 버전)
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 90%는 Route A로, 10%는 Route B로 분산됩니다
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>카나리 배포</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              • Stable: group=<code>prod</code>, weight=<code>95</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              • Canary: group=<code>prod</code>, weight=<code>5</code>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 가중치 합계가 100일 필요는 없으며, 비율로 동작합니다
        </div>
      </div>
    </div>
  );
};