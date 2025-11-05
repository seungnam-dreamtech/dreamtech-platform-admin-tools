// Predicate 선택 및 관리 컴포넌트
import React, { useState } from 'react';
import { Select, Button, Space, Card, Tag, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormSection } from '../common/FormSection';
import { PREDICATE_CONFIGS } from './predicateConfigs';
import { PathPredicateForm } from './predicates/PathPredicateForm';
import { MethodPredicateForm } from './predicates/MethodPredicateForm';
import { HeaderPredicateForm } from './predicates/HeaderPredicateForm';
import { HostPredicateForm } from './predicates/HostPredicateForm';
import { QueryPredicateForm } from './predicates/QueryPredicateForm';
import { CookiePredicateForm } from './predicates/CookiePredicateForm';
import { RemoteAddrPredicateForm } from './predicates/RemoteAddrPredicateForm';
import { WeightPredicateForm } from './predicates/WeightPredicateForm';
import { AfterPredicateForm } from './predicates/AfterPredicateForm';
import { BeforePredicateForm } from './predicates/BeforePredicateForm';
import { BetweenPredicateForm } from './predicates/BetweenPredicateForm';
import { CloudFoundryRouteServicePredicateForm } from './predicates/CloudFoundryRouteServicePredicateForm';
import type { ActuatorPredicate } from '../../../types/gateway';

interface PredicateSelectorProps {
  value: ActuatorPredicate[];
  onChange: (value: ActuatorPredicate[]) => void;
}

export const PredicateSelector: React.FC<PredicateSelectorProps> = ({
  value,
  onChange
}) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleAddPredicate = () => {
    if (!selectedType) return;

    const config = PREDICATE_CONFIGS[selectedType];
    if (!config) return;

    const newPredicate: ActuatorPredicate = {
      name: selectedType,
      args: config.defaultArgs
    } as ActuatorPredicate;

    onChange([...value, newPredicate]);
    setSelectedType('');
  };

  const handleRemovePredicate = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handlePredicateChange = (index: number, newArgs: any) => {
    const newPredicates = [...value];
    newPredicates[index] = {
      ...newPredicates[index],
      args: newArgs
    };
    onChange(newPredicates);
  };

  const renderPredicateForm = (predicate: ActuatorPredicate, index: number) => {
    const config = PREDICATE_CONFIGS[predicate.name];
    if (!config) return null;

    let FormComponent: React.ComponentType<any> | null = null;

    switch (predicate.name) {
      case 'Path':
        FormComponent = PathPredicateForm;
        break;
      case 'Method':
        FormComponent = MethodPredicateForm;
        break;
      case 'Header':
        FormComponent = HeaderPredicateForm;
        break;
      case 'Host':
        FormComponent = HostPredicateForm;
        break;
      case 'Query':
        FormComponent = QueryPredicateForm;
        break;
      case 'Cookie':
        FormComponent = CookiePredicateForm;
        break;
      case 'RemoteAddr':
        FormComponent = RemoteAddrPredicateForm;
        break;
      case 'Weight':
        FormComponent = WeightPredicateForm;
        break;
      case 'After':
        FormComponent = AfterPredicateForm;
        break;
      case 'Before':
        FormComponent = BeforePredicateForm;
        break;
      case 'Between':
        FormComponent = BetweenPredicateForm;
        break;
      case 'CloudFoundryRouteService':
        FormComponent = CloudFoundryRouteServicePredicateForm;
        break;
      default:
        return (
          <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Tag color="orange">미구현</Tag>
            <span style={{ marginLeft: '8px' }}>{config.label} 폼은 아직 구현 중입니다</span>
          </div>
        );
    }

    return (
      <FormComponent
        value={predicate.args}
        onChange={(newArgs: any) => handlePredicateChange(index, newArgs)}
      />
    );
  };

  const predicateOptions = Object.values(PREDICATE_CONFIGS).map(config => ({
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
        title="조건 추가하기"
        description="라우트 매칭 조건을 선택하고 추가합니다"
      >
        <Space style={{ width: '100%' }}>
          <Select
            value={selectedType}
            onChange={setSelectedType}
            placeholder="Predicate 타입 선택"
            style={{ width: '400px' }}
            options={predicateOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.value as string).toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPredicate}
            disabled={!selectedType}
          >
            추가
          </Button>
        </Space>
      </FormSection>

      {/* 추가된 Predicate 목록 */}
      <FormSection
        title={`추가된 조건 목록 (${value.length}개)`}
        description="라우트에 적용될 매칭 조건들"
      >
        {value.length === 0 ? (
          <Empty
            description="추가된 조건이 없습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {value.map((predicate, index) => {
              const config = PREDICATE_CONFIGS[predicate.name];
              return (
                <Card
                  key={index}
                  size="small"
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{config?.icon || '🔹'}</span>
                      <span>{config?.label || predicate.name}</span>
                    </div>
                  }
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemovePredicate(index)}
                    >
                      삭제
                    </Button>
                  }
                  style={{ border: '1px solid #d9d9d9' }}
                >
                  {renderPredicateForm(predicate, index)}
                </Card>
              );
            })}
          </Space>
        )}
      </FormSection>
    </Space>
  );
};