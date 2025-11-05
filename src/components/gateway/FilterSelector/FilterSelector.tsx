// Filter 선택 및 관리 컴포넌트
import React, { useState } from 'react';
import { Select, Button, Space, Card, Tag, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { FormSection } from '../common/FormSection';
import { FILTER_CONFIGS, FILTER_CATEGORIES, getFiltersByCategory } from './filterConfigs';
import { AddHeaderFilterForm } from './filters/AddHeaderFilterForm';
import { StripPrefixFilterForm } from './filters/StripPrefixFilterForm';
import { RewritePathFilterForm } from './filters/RewritePathFilterForm';
import { RemoveHeaderFilterForm } from './filters/RemoveHeaderFilterForm';
import { PrefixPathFilterForm } from './filters/PrefixPathFilterForm';
import { SetPathFilterForm } from './filters/SetPathFilterForm';
import { RequestRateLimiterFilterForm } from './filters/RequestRateLimiterFilterForm';
import { CircuitBreakerFilterForm } from './filters/CircuitBreakerFilterForm';
import { RetryFilterForm } from './filters/RetryFilterForm';
import { RequestSizeFilterForm } from './filters/RequestSizeFilterForm';
import { ModifyBodyFilterForm } from './filters/ModifyBodyFilterForm';
import type { ActuatorFilter } from '../../../types/gateway';

interface FilterSelectorProps {
  value: ActuatorFilter[];
  onChange: (value: ActuatorFilter[]) => void;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  value,
  onChange
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleAddFilter = () => {
    if (!selectedType) return;

    const config = FILTER_CONFIGS[selectedType];
    if (!config) return;

    const newFilter: ActuatorFilter = {
      name: selectedType,
      args: config.defaultArgs
    } as ActuatorFilter;

    onChange([...value, newFilter]);
    setSelectedType('');
  };

  const handleRemoveFilter = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, newArgs: any) => {
    const newFilters = [...value];
    newFilters[index] = {
      ...newFilters[index],
      args: newArgs
    };
    onChange(newFilters);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFilters = [...value];
    [newFilters[index - 1], newFilters[index]] = [newFilters[index], newFilters[index - 1]];
    onChange(newFilters);
  };

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return;
    const newFilters = [...value];
    [newFilters[index], newFilters[index + 1]] = [newFilters[index + 1], newFilters[index]];
    onChange(newFilters);
  };

  const renderFilterForm = (filter: ActuatorFilter, index: number) => {
    const config = FILTER_CONFIGS[filter.name];
    if (!config) return null;

    let FormComponent: React.ComponentType<any> | null = null;
    let formProps: any = { value: filter.args, onChange: (newArgs: any) => handleFilterChange(index, newArgs) };

    switch (filter.name) {
      case 'AddRequestHeader':
        FormComponent = AddHeaderFilterForm;
        formProps.type = 'request-header';
        break;
      case 'AddResponseHeader':
        FormComponent = AddHeaderFilterForm;
        formProps.type = 'response-header';
        break;
      case 'AddRequestParameter':
        FormComponent = AddHeaderFilterForm;
        formProps.type = 'request-parameter';
        break;
      case 'RemoveRequestHeader':
        FormComponent = RemoveHeaderFilterForm;
        formProps.type = 'request-header';
        break;
      case 'RemoveResponseHeader':
        FormComponent = RemoveHeaderFilterForm;
        formProps.type = 'response-header';
        break;
      case 'RemoveRequestParameter':
        FormComponent = RemoveHeaderFilterForm;
        formProps.type = 'request-parameter';
        break;
      case 'StripPrefix':
        FormComponent = StripPrefixFilterForm;
        break;
      case 'RewritePath':
        FormComponent = RewritePathFilterForm;
        break;
      case 'PrefixPath':
        FormComponent = PrefixPathFilterForm;
        break;
      case 'SetPath':
        FormComponent = SetPathFilterForm;
        break;
      case 'RequestRateLimiter':
        FormComponent = RequestRateLimiterFilterForm;
        break;
      case 'CircuitBreaker':
        FormComponent = CircuitBreakerFilterForm;
        break;
      case 'Retry':
        FormComponent = RetryFilterForm;
        break;
      case 'RequestSize':
        FormComponent = RequestSizeFilterForm;
        break;
      case 'ModifyRequestBody':
        FormComponent = ModifyBodyFilterForm;
        formProps.type = 'request';
        break;
      case 'ModifyResponseBody':
        FormComponent = ModifyBodyFilterForm;
        formProps.type = 'response';
        break;
      default:
        return (
          <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Tag color="orange">미구현</Tag>
            <span style={{ marginLeft: '8px' }}>{config.label} 폼은 아직 구현 중입니다</span>
          </div>
        );
    }

    return <FormComponent {...formProps} />;
  };

  const filteredFilters = getFiltersByCategory(selectedCategory);
  const filterOptions = filteredFilters.map(config => ({
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
        <Tag color="blue" style={{ fontSize: '10px', marginLeft: 'auto' }}>
          {config.category}
        </Tag>
      </div>
    ),
    value: config.name
  }));

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* 추가 영역 */}
      <FormSection
        title="필터 추가하기"
        description="요청/응답 변환 필터를 선택하고 추가합니다"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {/* 카테고리 선택 */}
          <div>
            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>카테고리:</span>
            <Select
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setSelectedType('');
              }}
              style={{ width: '200px' }}
              options={FILTER_CATEGORIES}
            />
          </div>

          {/* 필터 선택 */}
          <Space style={{ width: '100%' }}>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Filter 타입 선택"
              style={{ width: '400px' }}
              options={filterOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.value as string).toLowerCase().includes(input.toLowerCase())
              }
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddFilter}
              disabled={!selectedType}
            >
              추가
            </Button>
          </Space>
        </Space>
      </FormSection>

      {/* 추가된 Filter 목록 */}
      <FormSection
        title={`추가된 필터 목록 (${value.length}개)`}
        description="위에서 아래 순서대로 실행됩니다"
        extra={
          value.length > 0 && (
            <Tag color="cyan" style={{ fontSize: '11px' }}>
              ↑↓ 버튼으로 순서 조정 가능
            </Tag>
          )
        }
      >
        {value.length === 0 ? (
          <Empty
            description="추가된 필터가 없습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {value.map((filter, index) => {
              const config = FILTER_CONFIGS[filter.name];
              return (
                <Card
                  key={index}
                  size="small"
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag color="purple" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                        #{index + 1}
                      </Tag>
                      <span>{config?.icon || '🔸'}</span>
                      <span>{config?.label || filter.name}</span>
                    </div>
                  }
                  extra={
                    <Space size="small">
                      <Button
                        type="text"
                        icon={<ArrowUpOutlined />}
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="위로 이동"
                      />
                      <Button
                        type="text"
                        icon={<ArrowDownOutlined />}
                        onClick={() => handleMoveDown(index)}
                        disabled={index === value.length - 1}
                        title="아래로 이동"
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveFilter(index)}
                      >
                        삭제
                      </Button>
                    </Space>
                  }
                  style={{ border: '1px solid #d9d9d9' }}
                >
                  {renderFilterForm(filter, index)}
                </Card>
              );
            })}
          </Space>
        )}
      </FormSection>
    </Space>
  );
};