// Before Predicate 폼 컴포넌트
import React from 'react';
import { DatePicker, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import type { ActuatorBeforePredicateArgs } from '../../../../types/gateway';

interface BeforePredicateFormProps {
  value: ActuatorBeforePredicateArgs;
  onChange: (value: ActuatorBeforePredicateArgs) => void;
}

export const BeforePredicateForm: React.FC<BeforePredicateFormProps> = ({
  value,
  onChange
}) => {
  const datetimeValue = value.datetime ? dayjs(value.datetime) : null;

  const handleDateTimeChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      onChange({ ...value, datetime: date.toISOString() });
    } else {
      onChange({ ...value, datetime: '' });
    }
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              이 시각 이전에만 매칭
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <DatePicker
            showTime
            value={datetimeValue}
            onChange={handleDateTimeChange}
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="날짜와 시간 선택"
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 선택한 시각 이전의 요청만 이 라우트로 전달됩니다
          </div>
        </div>

        {value.datetime && (
          <div style={{ padding: '8px', background: '#e6f7ff', borderRadius: '4px', border: '1px solid #91d5ff' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              ISO 8601 형식:
            </div>
            <code style={{ fontSize: '12px' }}>{value.datetime}</code>
          </div>
        )}
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Before Predicate 사용 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>서비스 종료</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              2025-12-31 23:59:59 이전 → 구 API 라우트 유효
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>기간 한정 이벤트</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              이벤트 종료일 이전 → 이벤트 페이지로 라우팅
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};