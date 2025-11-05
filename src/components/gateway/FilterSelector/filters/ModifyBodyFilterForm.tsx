// ModifyRequestBody / ModifyResponseBody Filter 폼 컴포넌트 (공통)
import React from 'react';
import { Input, Space, Tag, Alert, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type {
  ActuatorModifyRequestBodyFilterArgs,
  ActuatorModifyResponseBodyFilterArgs
} from '../../../../types/gateway';

const { TextArea } = Input;

type ModifyBodyFilterArgs =
  | ActuatorModifyRequestBodyFilterArgs
  | ActuatorModifyResponseBodyFilterArgs;

interface ModifyBodyFilterFormProps {
  value: ModifyBodyFilterArgs;
  onChange: (value: ModifyBodyFilterArgs) => void;
  type: 'request' | 'response';
}

export const ModifyBodyFilterForm: React.FC<ModifyBodyFilterFormProps> = ({
  value,
  onChange,
  type
}) => {
  const isRequest = type === 'request';
  const title = isRequest ? 'ModifyRequestBody' : 'ModifyResponseBody';

  return (
    <div>
      <Alert
        message={`${title} Filter - 고급 기능`}
        description={
          <div>
            <p style={{ marginBottom: '4px' }}>
              이 필터는 {isRequest ? '요청' : '응답'} 본문을 프로그래밍 방식으로 수정합니다.
            </p>
            <p style={{ marginBottom: '0' }}>
              실제 구현은 Java 코드로 작성된 RewriteFunction Bean이 필요합니다.
            </p>
          </div>
        }
        type="warning"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: '12px' }}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* RewriteFunction Bean Name */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              RewriteFunction Bean 이름
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </div>
          <Input
            value={value.rewriteFunction || ''}
            onChange={(e) => onChange({ ...value, rewriteFunction: e.target.value })}
            placeholder="예: myBodyRewriteFunction"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 Spring Bean으로 등록된 RewriteFunction의 이름
          </div>
        </div>

        {/* Content Type (선택) */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              Content Type (선택사항)
            </span>
          </div>
          <Select
            value={value.contentType || ''}
            onChange={(val) => onChange({ ...value, contentType: val })}
            style={{ width: '100%' }}
            placeholder="Content-Type 선택 (선택사항)"
            allowClear
            options={[
              { label: 'application/json', value: 'application/json' },
              { label: 'application/xml', value: 'application/xml' },
              { label: 'text/plain', value: 'text/plain' },
              { label: 'text/html', value: 'text/html' },
              { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' }
            ]}
          />
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            💡 변환 후 설정할 Content-Type (비워두면 원본 유지)
          </div>
        </div>

        {/* 설명 */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              설명 (메모)
            </span>
          </div>
          <TextArea
            value={value.description || ''}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            placeholder="이 필터의 용도를 간단히 설명하세요"
            rows={2}
            style={{ width: '100%' }}
          />
        </div>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>{title} 구현 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>Java Bean 구현 필요</Tag>
            <pre style={{
              background: '#fff',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '11px',
              marginTop: '4px',
              overflow: 'auto'
            }}>
{`@Bean
public RewriteFunction<String, String> myBodyRewriteFunction() {
    return (exchange, body) -> {
        // ${isRequest ? '요청' : '응답'} 본문 변환 로직
        String modified = body.replace("old", "new");
        return Mono.just(modified);
    };
}`}
            </pre>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>사용 사례</Tag>
            <div style={{ marginLeft: '8px', marginTop: '4px', color: '#666' }}>
              • 민감 정보 마스킹 (신용카드 번호, 주민번호 등)
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              • 데이터 형식 변환 (XML ↔ JSON)
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              • 필드 추가/제거/수정
            </div>
            <div style={{ marginLeft: '8px', color: '#666' }}>
              • 암호화/복호화
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 성능에 영향을 줄 수 있으므로 꼭 필요한 경우에만 사용하세요
        </div>
      </div>
    </div>
  );
};