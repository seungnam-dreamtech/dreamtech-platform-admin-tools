// CircuitBreaker Filter 폼 컴포넌트
import React from 'react';
import { Input, Space, Tag, Select } from 'antd';
import type { ActuatorCircuitBreakerFilterArgs } from '../../../../types/gateway';

interface CircuitBreakerFilterFormProps {
  value: ActuatorCircuitBreakerFilterArgs;
  onChange: (value: ActuatorCircuitBreakerFilterArgs) => void;
}

export const CircuitBreakerFilterForm: React.FC<CircuitBreakerFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Name */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              Circuit Breaker 이름
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="예: myCircuitBreaker"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 Resilience4j 설정에서 참조할 Circuit Breaker 이름
          </div>
        </div>

        {/* Fallback URI */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              폴백 URI (선택사항)
            </span>
          </div>
          <Input
            value={value.fallbackUri || ''}
            onChange={(e) => onChange({ ...value, fallbackUri: e.target.value })}
            placeholder="예: forward:/fallback 또는 forward:/error"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 Circuit이 Open되었을 때 리다이렉트될 URI
          </div>
        </div>

        {/* Status Codes (선택) */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              실패로 간주할 HTTP 상태 코드 (선택사항)
            </span>
          </div>
          <Input
            value={value.statusCodes || ''}
            onChange={(e) => onChange({ ...value, statusCodes: e.target.value })}
            placeholder="예: 500,502,503,504"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 쉼표로 구분하여 입력 (비워두면 5xx 에러만 실패로 간주)
          </div>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>CircuitBreaker 설정 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>기본 설정</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              name = <code>backendService</code>
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              fallbackUri = <code>forward:/service-unavailable</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 백엔드 장애 시 폴백 페이지로 리다이렉트
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>커스텀 상태 코드</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              statusCodes = <code>500,503,504</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 지정한 상태 코드만 실패로 간주
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>폴백 없음</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              fallbackUri = (비워둠)
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → Circuit Open 시 503 Service Unavailable 반환
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 Resilience4j와 통합되어 동작 (application.yml에서 세부 설정 필요)
        </div>
      </div>
    </div>
  );
};