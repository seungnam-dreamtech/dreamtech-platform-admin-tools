// RequestRateLimiter Filter 폼 컴포넌트
import React from 'react';
import { Input, InputNumber, Space, Tag, Select } from 'antd';
import type { ActuatorRequestRateLimiterFilterArgs } from '../../../../types/gateway';

interface RequestRateLimiterFilterFormProps {
  value: ActuatorRequestRateLimiterFilterArgs;
  onChange: (value: ActuatorRequestRateLimiterFilterArgs) => void;
}

export const RequestRateLimiterFilterForm: React.FC<RequestRateLimiterFilterFormProps> = ({
  value,
  onChange
}) => {
  const replenishRateValue = typeof value.replenishRate === 'string' ? parseInt(value.replenishRate) : value.replenishRate;
  const burstCapacityValue = typeof value.burstCapacity === 'string' ? parseInt(value.burstCapacity) : value.burstCapacity;
  const requestedTokensValue = typeof value.requestedTokens === 'string' ? parseInt(value.requestedTokens) : (value.requestedTokens || 1);

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Replenish Rate */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              초당 재충전 속도 (replenishRate)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <InputNumber
            value={replenishRateValue}
            onChange={(val) => onChange({ ...value, replenishRate: String(val || 1) })}
            min={1}
            max={10000}
            style={{ width: '200px' }}
            placeholder="예: 10"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 초당 허용되는 요청 수 (평균 처리량)
          </div>
        </div>

        {/* Burst Capacity */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              버스트 용량 (burstCapacity)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <InputNumber
            value={burstCapacityValue}
            onChange={(val) => onChange({ ...value, burstCapacity: String(val || 1) })}
            min={1}
            max={100000}
            style={{ width: '200px' }}
            placeholder="예: 20"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 한 번에 처리 가능한 최대 요청 수 (버킷 크기)
          </div>
        </div>

        {/* Requested Tokens */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              요청당 토큰 소비량 (requestedTokens)
            </span>
          </div>
          <InputNumber
            value={requestedTokensValue}
            onChange={(val) => onChange({ ...value, requestedTokens: String(val || 1) })}
            min={1}
            max={100}
            style={{ width: '200px' }}
            placeholder="기본값: 1"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 각 요청이 소비하는 토큰 수 (기본값: 1)
          </div>
        </div>

        {/* Key Resolver (선택) */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              키 리졸버 (keyResolver Bean 이름)
            </span>
          </div>
          <Input
            value={value.keyResolver || ''}
            onChange={(e) => onChange({ ...value, keyResolver: e.target.value })}
            placeholder="예: userKeyResolver (선택사항)"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 Rate Limiting 대상을 구분하는 키 생성 Bean (비워두면 기본 키 사용)
          </div>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>RequestRateLimiter 설정 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>기본 설정</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              replenishRate = <code>10</code> (초당 10개)
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              burstCapacity = <code>20</code> (최대 20개 버스트)
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 평균 10 req/s, 순간적으로 20개까지 허용
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>엄격한 제한</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              replenishRate = <code>5</code>, burstCapacity = <code>5</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 버스트 없이 정확히 초당 5개만 허용
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>유연한 제한</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              replenishRate = <code>100</code>, burstCapacity = <code>500</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 평균 100 req/s, 트래픽 급증 시 500개까지 수용
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 Token Bucket 알고리즘 사용 (Redis 기반 분산 처리)
        </div>
      </div>
    </div>
  );
};