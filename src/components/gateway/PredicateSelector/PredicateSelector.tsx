// Predicate 선택 및 관리 컴포넌트
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
          <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Chip label="미구현" color="warning" size="small" />
            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
              {config.label} 폼은 아직 구현 중입니다
            </Typography>
          </Box>
        );
    }

    return (
      <FormComponent
        value={predicate.args}
        onChange={(newArgs: any) => handlePredicateChange(index, newArgs)}
      />
    );
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setSelectedType(event.target.value);
  };

  return (
    <Stack spacing={3}>
      {/* 추가 영역 */}
      <FormSection
        title="조건 추가하기"
        description="라우트 매칭 조건을 선택하고 추가합니다"
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <FormControl sx={{ minWidth: 400 }} size="small">
            <InputLabel>Predicate 타입 선택</InputLabel>
            <Select
              value={selectedType}
              onChange={handleSelectChange}
              label="Predicate 타입 선택"
            >
              {Object.values(PREDICATE_CONFIGS).map(config => (
                <MenuItem key={config.name} value={config.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    <Chip
                      label={config.category}
                      size="small"
                      color="primary"
                      sx={{ ml: 'auto', fontSize: '10px', height: '18px' }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPredicate}
            disabled={!selectedType}
          >
            추가
          </Button>
        </Box>
      </FormSection>

      {/* 추가된 Predicate 목록 */}
      <FormSection
        title={`추가된 조건 목록 (${value.length}개)`}
        description="라우트에 적용될 매칭 조건들"
      >
        {value.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              추가된 조건이 없습니다
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {value.map((predicate, index) => {
              const config = PREDICATE_CONFIGS[predicate.name];
              return (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{config?.icon || '🔹'}</span>
                        <Typography variant="h6" component="span">
                          {config?.label || predicate.name}
                        </Typography>
                      </Box>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemovePredicate(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {renderPredicateForm(predicate, index)}
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