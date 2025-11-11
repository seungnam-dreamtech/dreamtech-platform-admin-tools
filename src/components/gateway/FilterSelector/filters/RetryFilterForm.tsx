// Retry Filter 폼 컴포넌트
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Input, InputNumber, Space, Tag, Select, Checkbox } from 'antd';
import type { ActuatorRetryFilterArgs } from '../../../../types/gateway';

interface RetryFilterFormProps {
  value: ActuatorRetryFilterArgs;
  onChange: (value: ActuatorRetryFilterArgs) => void;
}

export const RetryFilterForm: React.FC<RetryFilterFormProps> = ({
  value,
  onChange
}) => {
  const retriesValue = typeof value.retries === 'string' ? parseInt(value.retries) : (value.retries || 3);
  const backoffValue = value.backoff ? JSON.parse(JSON.stringify(value.backoff)) : { firstBackoff: '5ms', maxBackoff: '50ms', factor: 2, basedOnPreviousValue: false };

  const handleBackoffChange = (field: string, newValue: any) => {
    const newBackoff = { ...backoffValue, [field]: newValue };
    onChange({ ...value, backoff: newBackoff });
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Retries */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              재시도 횟수 (retries)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <InputNumber
            value={retriesValue}
            onChange={(val) => onChange({ ...value, retries: String(val || 3) })}
            min={1}
            max={10}
            style={{ width: '200px' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 최대 재시도 횟수 (기본값: 3)
          </div>
        </div>

        {/* HTTP Methods */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              재시도할 HTTP 메서드
            </span>
          </div>
          <Select
            mode="multiple"
            value={value.methods || ['GET']}
            onChange={(val) => onChange({ ...value, methods: val })}
            style={{ width: '100%' }}
            placeholder="메서드 선택"
            options={[
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'DELETE', value: 'DELETE' },
              { label: 'PATCH', value: 'PATCH' }
            ]}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 재시도를 허용할 HTTP 메서드 (기본값: GET만)
          </div>
        </div>

        {/* Status Codes */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              재시도할 HTTP 상태 코드
            </span>
          </div>
          <Input
            value={value.statuses || ''}
            onChange={(e) => onChange({ ...value, statuses: e.target.value })}
            placeholder="예: 500,502,503,504"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 쉼표로 구분 (비워두면 5xx 에러에 대해 재시도)
          </div>
        </div>

        {/* Exceptions */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              재시도할 예외 클래스
            </span>
          </div>
          <Input
            value={value.exceptions || ''}
            onChange={(e) => onChange({ ...value, exceptions: e.target.value })}
            placeholder="예: java.io.IOException,java.util.concurrent.TimeoutException"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 쉼표로 구분 (완전한 클래스명 사용)
          </div>
        </div>

        {/* Backoff 설정 */}
        <div style={{ padding: '12px', background: '#fafafa', borderRadius: '4px', border: '1px dashed #d9d9d9' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1890ff' }}>
            ⏱️ Backoff 설정 (재시도 간격)
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px' }}>첫 번째 지연 (firstBackoff)</div>
              <Input
                value={backoffValue.firstBackoff}
                onChange={(e) => handleBackoffChange('firstBackoff', e.target.value)}
                placeholder="예: 5ms, 1s"
                style={{ width: '200px' }}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px' }}>최대 지연 (maxBackoff)</div>
              <Input
                value={backoffValue.maxBackoff}
                onChange={(e) => handleBackoffChange('maxBackoff', e.target.value)}
                placeholder="예: 50ms, 10s"
                style={{ width: '200px' }}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px' }}>증가 배수 (factor)</div>
              <InputNumber
                value={backoffValue.factor}
                onChange={(val) => handleBackoffChange('factor', val || 2)}
                min={1}
                max={10}
                step={0.1}
                style={{ width: '200px' }}
              />
            </div>

            <Checkbox
              checked={backoffValue.basedOnPreviousValue}
              onChange={(e) => handleBackoffChange('basedOnPreviousValue', e.target.checked)}
            >
              이전 값 기반 계산 (basedOnPreviousValue)
            </Checkbox>
          </Space>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Retry 설정 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>기본 재시도</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              retries = <code>3</code>, methods = <code>GET</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → GET 요청 실패 시 최대 3번 재시도
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>Exponential Backoff</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              firstBackoff = <code>5ms</code>, maxBackoff = <code>50ms</code>, factor = <code>2</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 5ms → 10ms → 20ms → 40ms (최대 50ms)
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 네트워크 일시 장애나 타임아웃 상황에서 자동 재시도
        </div>
      </div>
    </div>
  );
};