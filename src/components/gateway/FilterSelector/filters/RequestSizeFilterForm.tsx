// RequestSize Filter 폼 컴포넌트
import React from 'react';
import { Input, InputNumber, Space, Tag, Select } from 'antd';
import type { ActuatorRequestSizeFilterArgs } from '../../../../types/gateway';

interface RequestSizeFilterFormProps {
  value: ActuatorRequestSizeFilterArgs;
  onChange: (value: ActuatorRequestSizeFilterArgs) => void;
}

export const RequestSizeFilterForm: React.FC<RequestSizeFilterFormProps> = ({
  value,
  onChange
}) => {
  // maxSize를 숫자와 단위로 분리
  const parseMaxSize = (maxSize: string) => {
    const match = maxSize.match(/^(\d+(?:\.\d+)?)(B|KB|MB|GB)?$/i);
    if (match) {
      return { number: parseFloat(match[1]), unit: match[2] || 'B' };
    }
    return { number: 5, unit: 'MB' };
  };

  const { number, unit } = parseMaxSize(value.maxSize || '5MB');

  const handleNumberChange = (val: number | null) => {
    const newNumber = val || 1;
    onChange({ ...value, maxSize: `${newNumber}${unit}` });
  };

  const handleUnitChange = (newUnit: string) => {
    onChange({ ...value, maxSize: `${number}${newUnit}` });
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              최대 요청 크기 (maxSize)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>

          <Space>
            <InputNumber
              value={number}
              onChange={handleNumberChange}
              min={1}
              max={10000}
              style={{ width: '150px' }}
            />
            <Select
              value={unit}
              onChange={handleUnitChange}
              style={{ width: '100px' }}
              options={[
                { label: 'B (Bytes)', value: 'B' },
                { label: 'KB', value: 'KB' },
                { label: 'MB', value: 'MB' },
                { label: 'GB', value: 'GB' }
              ]}
            />
          </Space>

          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
            💡 이 크기를 초과하는 요청은 413 Payload Too Large 응답을 받습니다
          </div>
        </div>

        <div style={{ padding: '8px', background: '#e6f7ff', borderRadius: '4px', border: '1px solid #91d5ff' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            설정된 값:
          </div>
          <code style={{ fontSize: '14px', fontWeight: 'bold' }}>{value.maxSize}</code>
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>RequestSize 설정 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>작은 파일 업로드</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              maxSize = <code>5MB</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 프로필 이미지 같은 작은 파일 업로드용
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>일반 API</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              maxSize = <code>1MB</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → JSON 요청 본문 크기 제한
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>대용량 파일</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              maxSize = <code>100MB</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 동영상, 대용량 문서 업로드용
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="purple" style={{ fontSize: '11px' }}>엄격한 제한</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              maxSize = <code>512KB</code>
            </div>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#52c41a' }}>
              → 작은 메시지만 허용
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 DDoS 공격 방어 및 서버 리소스 보호에 유용
        </div>
      </div>
    </div>
  );
};