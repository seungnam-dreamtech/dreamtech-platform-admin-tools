// 동적 필드 입력 공통 컴포넌트
import React from 'react';
import { Input, InputNumber, Select, Checkbox, DatePicker, Space, Button, Tag } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface DynamicFormFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'datetime' | 'array';
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  required?: boolean;
  help?: string;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  label,
  value,
  onChange,
  type,
  placeholder,
  options,
  required,
  help
}) => {
  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        );

      case 'number':
        return (
          <InputNumber
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ width: '100%' }}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            options={options}
            style={{ width: '100%' }}
          />
        );

      case 'checkbox':
        return (
          <Checkbox checked={value} onChange={(e) => onChange(e.target.checked)}>
            {placeholder}
          </Checkbox>
        );

      case 'datetime':
        return (
          <DatePicker
            showTime
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ width: '100%' }}
          />
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            {arrayValue.map((item, index) => (
              <Space key={index} style={{ width: '100%' }}>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newArray = [...arrayValue];
                    newArray[index] = e.target.value;
                    onChange(newArray);
                  }}
                  placeholder={placeholder}
                  style={{ width: '300px' }}
                />
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => {
                    const newArray = arrayValue.filter((_, i) => i !== index);
                    onChange(newArray);
                  }}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => onChange([...arrayValue, ''])}
              style={{ width: '100%' }}
            >
              추가
            </Button>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>
          {label}
          {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
        </span>
      </div>
      {renderField()}
      {help && (
        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
          💡 {help}
        </div>
      )}
    </div>
  );
};