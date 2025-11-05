// RemoteAddr Predicate 폼 컴포넌트
import React from 'react';
import { Input, Button, Space, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ActuatorRemoteAddrPredicateArgs } from '../../../../types/gateway';

interface RemoteAddrPredicateFormProps {
  value: ActuatorRemoteAddrPredicateArgs;
  onChange: (value: ActuatorRemoteAddrPredicateArgs) => void;
}

export const RemoteAddrPredicateForm: React.FC<RemoteAddrPredicateFormProps> = ({
  value,
  onChange
}) => {
  // sources가 배열이 아닌 경우 배열로 변환
  const sources = Array.isArray(value.sources)
    ? (value.sources.length > 0 ? value.sources : [''])
    : value.sources
      ? [value.sources as string]
      : [''];

  const handleSourceChange = (index: number, newValue: string) => {
    const newSources = [...sources];
    newSources[index] = newValue;
    onChange({ ...value, sources: newSources });
  };

  const handleAddSource = () => {
    onChange({ ...value, sources: [...sources, ''] });
  };

  const handleRemoveSource = (index: number) => {
    const newSources = sources.filter((_, i) => i !== index);
    onChange({ ...value, sources: newSources.length > 0 ? newSources : [''] });
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          허용할 IP 주소/CIDR
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {sources.map((source, index) => (
          <Space key={index} style={{ width: '100%' }}>
            <Input
              value={source}
              onChange={(e) => handleSourceChange(index, e.target.value)}
              placeholder="예: 192.168.1.1/24"
              style={{ width: '400px' }}
            />
            {sources.length > 1 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveSource(index)}
              />
            )}
          </Space>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddSource}
          style={{ width: '100%' }}
        >
          IP/CIDR 추가
        </Button>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>IP 주소 형식 예시:</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="blue" style={{ fontSize: '11px' }}>단일 IP</Tag>
            <code>192.168.1.100</code>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="green" style={{ fontSize: '11px' }}>CIDR 블록</Tag>
            <code>192.168.1.0/24</code> (192.168.1.0 ~ 192.168.1.255)
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="orange" style={{ fontSize: '11px' }}>IPv6</Tag>
            <code>2001:db8::/32</code>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <Tag color="purple" style={{ fontSize: '11px' }}>로컬호스트</Tag>
            <code>127.0.0.1</code> 또는 <code>::1</code>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#fa8c16' }}>
          💡 여러 IP/CIDR를 추가하면 OR 조건으로 동작합니다
        </div>
      </div>
    </div>
  );
};