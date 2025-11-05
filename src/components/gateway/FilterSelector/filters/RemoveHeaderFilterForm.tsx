// Remove Header/Parameter Filter 폼 컴포넌트 (공통)
import React from 'react';
import { Input, Button, Space, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type {
  ActuatorRemoveRequestHeaderFilterArgs,
  ActuatorRemoveResponseHeaderFilterArgs,
  ActuatorRemoveRequestParameterFilterArgs
} from '../../../../types/gateway';

type RemoveFilterArgs =
  | ActuatorRemoveRequestHeaderFilterArgs
  | ActuatorRemoveResponseHeaderFilterArgs
  | ActuatorRemoveRequestParameterFilterArgs;

interface RemoveHeaderFilterFormProps {
  value: RemoveFilterArgs;
  onChange: (value: RemoveFilterArgs) => void;
  type: 'request-header' | 'response-header' | 'request-parameter';
}

export const RemoveHeaderFilterForm: React.FC<RemoveHeaderFilterFormProps> = ({
  value,
  onChange,
  type
}) => {
  const isParameter = type === 'request-parameter';
  const isResponseHeader = type === 'response-header';

  const label = isParameter ? '파라미터' : '헤더';
  const placeholder = isParameter ? '예: debug' : '예: X-Request-Id';

  // name 또는 names 필드 처리
  const names = 'names' in value ? value.names : (value.name ? [value.name] : ['']);

  const handleNameChange = (index: number, newValue: string) => {
    const newNames = [...names];
    newNames[index] = newValue;

    if ('names' in value) {
      onChange({ ...value, names: newNames });
    } else {
      onChange({ ...value, name: newNames[0] });
    }
  };

  const handleAddName = () => {
    if ('names' in value) {
      onChange({ ...value, names: [...names, ''] });
    }
  };

  const handleRemoveName = (index: number) => {
    if ('names' in value) {
      const newNames = names.filter((_, i) => i !== index);
      onChange({ ...value, names: newNames.length > 0 ? newNames : [''] });
    }
  };

  const supportsMultiple = 'names' in value;

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          제거할 {label} 이름
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {names.map((name, index) => (
          <Space key={index} style={{ width: '100%' }}>
            <Input
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={placeholder}
              style={{ width: '400px' }}
            />
            {supportsMultiple && names.length > 1 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveName(index)}
              />
            )}
          </Space>
        ))}

        {supportsMultiple && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddName}
            style={{ width: '100%' }}
          >
            {label} 추가
          </Button>
        )}
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Remove {type === 'request-header' ? 'Request Header' : type === 'response-header' ? 'Response Header' : 'Request Parameter'} 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          {type === 'request-header' && (
            <>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="blue" style={{ fontSize: '11px' }}>보안 헤더 제거</Tag>
                <code>X-Internal-Token</code>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="green" style={{ fontSize: '11px' }}>디버그 헤더</Tag>
                <code>X-Debug-Mode</code>
              </div>
            </>
          )}
          {type === 'response-header' && (
            <>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="blue" style={{ fontSize: '11px' }}>서버 정보 숨김</Tag>
                <code>Server</code>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="orange" style={{ fontSize: '11px' }}>내부 헤더 제거</Tag>
                <code>X-Application-Context</code>
              </div>
            </>
          )}
          {type === 'request-parameter' && (
            <>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="blue" style={{ fontSize: '11px' }}>내부 파라미터</Tag>
                <code>_internal</code>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="green" style={{ fontSize: '11px' }}>디버그 모드</Tag>
                <code>debug</code>
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 {isResponseHeader ? '응답' : '요청'}에서 지정한 {label}를 제거합니다
        </div>
      </div>
    </div>
  );
};