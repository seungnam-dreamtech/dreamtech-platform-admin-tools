// Filter 선택 및 관리 컴포넌트
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  Button,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Typography,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
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
    const formProps: any = { value: filter.args, onChange: (newArgs: any) => handleFilterChange(index, newArgs) };

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
          <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Chip label="미구현" color="warning" size="small" />
            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
              {config.label} 폼은 아직 구현 중입니다
            </Typography>
          </Box>
        );
    }

    return <FormComponent {...formProps} />;
  };

  const filteredFilters = getFiltersByCategory(selectedCategory);

  return (
    <Stack spacing={3}>
      {/* 추가 영역 */}
      <FormSection
        title="필터 추가하기"
        description="요청/응답 변환 필터를 선택하고 추가합니다"
      >
        <Stack spacing={2}>
          {/* 카테고리 선택 */}
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
              카테고리:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>전체</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedType('');
                }}
                label="전체"
              >
                {FILTER_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 필터 선택 */}
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ flex: 1, maxWidth: 400 }}>
              <InputLabel>Filter 타입 선택</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Filter 타입 선택"
              >
                {filteredFilters.map((config) => (
                  <MenuItem key={config.name} value={config.name}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                      <Chip
                        label={config.category}
                        size="small"
                        color="primary"
                        sx={{ ml: 'auto', fontSize: '10px' }}
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddFilter}
              disabled={!selectedType}
            >
              추가
            </Button>
          </Stack>
        </Stack>
      </FormSection>

      {/* 추가된 Filter 목록 */}
      <FormSection
        title={`추가된 필터 목록 (${value.length}개)`}
        description="위에서 아래 순서대로 실행됩니다"
        extra={
          value.length > 0 && (
            <Chip label="↑↓ 버튼으로 순서 조정 가능" size="small" color="info" />
          )
        }
      >
        {value.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              추가된 필터가 없습니다
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {value.map((filter, index) => {
              const config = FILTER_CONFIGS[filter.name];
              return (
                <Card key={index} variant="outlined">
                  <CardHeader
                    title={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color="secondary"
                        />
                        <span>{config?.icon || '🔸'}</span>
                        <Typography variant="body2" fontWeight="bold">
                          {config?.label || filter.name}
                        </Typography>
                      </Stack>
                    }
                    action={
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="위로 이동"
                        >
                          <ArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === value.length - 1}
                          title="아래로 이동"
                        >
                          <ArrowDownIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFilter(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    {renderFilterForm(filter, index)}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </FormSection>
    </Stack>
  );
};
