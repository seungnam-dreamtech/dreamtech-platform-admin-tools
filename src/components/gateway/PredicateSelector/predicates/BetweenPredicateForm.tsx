// Between Predicate 폼 컴포넌트
import React from 'react';
import { DatePicker, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import type { ActuatorBetweenPredicateArgs } from '../../../../types/gateway';

const { RangePicker } = DatePicker;

interface BetweenPredicateFormProps {
  value: ActuatorBetweenPredicateArgs;
  onChange: (value: ActuatorBetweenPredicateArgs) => void;
}

export const BetweenPredicateForm: React.FC<BetweenPredicateFormProps> = ({
  value,
  onChange
}) => {
  const datetimeStart = value.datetime1 ? dayjs(value.datetime1) : null;
  const datetimeEnd = value.datetime2 ? dayjs(value.datetime2) : null;

  const handleRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      onChange({
        ...value,
        datetime1: dates[0].toISOString(),
        datetime2: dates[1].toISOString()
      });
    } else {
      onChange({
        ...value,
        datetime1: '',
        datetime2: ''
      });
    }
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              기간 설정 (시작 ~ 종료)
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <RangePicker
            showTime
            value={datetimeStart && datetimeEnd ? [datetimeStart, datetimeEnd] : null}
            onChange={handleRangeChange}
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder={['시작 시각', '종료 시각']}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 설정한 기간 내의 요청만 이 라우트로 전달됩니다
          </div>
        </div>

        {value.datetime1 && value.datetime2 && (
          <div style={{ padding: '8px', background: '#e6f7ff', borderRadius: '4px', border: '1px solid #91d5ff' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              ISO 8601 형식:
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Tag color="green" style={{ fontSize: '10px' }}>시작</Tag>
                <code style={{ fontSize: '11px' }}>{value.datetime1}</code>
              </div>
              <div>
                <Tag color="red" style={{ fontSize: '10px' }}>종료</Tag>
                <code style={{ fontSize: '11px' }}>{value.datetime2}</code>
              </div>
            </Space>
          </div>
        )}
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Between Predicate 사용 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>기간 한정 이벤트</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              2025-01-01 00:00 ~ 2025-01-31 23:59
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              → 1월 한 달간만 이벤트 페이지로 라우팅
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>점검 시간 우회</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              점검 시간대에만 점검 페이지로 라우팅
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>베타 테스트</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              베타 기간 동안만 신규 기능 활성화
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};