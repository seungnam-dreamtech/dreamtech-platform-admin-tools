// Method Predicate 폼 컴포넌트
import React from 'react';
import { FormControlLabel, Checkbox, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorMethodPredicateArgs } from '../../../../types/gateway';

interface MethodPredicateFormProps {
  value: ActuatorMethodPredicateArgs;
  onChange: (value: ActuatorMethodPredicateArgs) => void;
}

const HTTP_METHODS = [
  { value: 'GET', color: 'success' as const },
  { value: 'POST', color: 'primary' as const },
  { value: 'PUT', color: 'warning' as const },
  { value: 'DELETE', color: 'error' as const },
  { value: 'PATCH', color: 'secondary' as const },
  { value: 'OPTIONS', color: 'info' as const },
  { value: 'HEAD', color: 'default' as const }
];

export const MethodPredicateForm: React.FC<MethodPredicateFormProps> = ({
  value,
  onChange
}) => {
  // methods가 배열이 아닌 경우 배열로 변환
  const methods = Array.isArray(value.methods)
    ? value.methods
    : value.methods
      ? [value.methods as string]
      : [];

  const handleMethodToggle = (method: string) => {
    const newMethods = methods.includes(method)
      ? methods.filter(m => m !== method)
      : [...methods, method];

    onChange({
      ...value,
      methods: newMethods
    });
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          HTTP 메서드 선택
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {HTTP_METHODS.map(({ value: methodValue, color }) => (
            <FormControlLabel
              key={methodValue}
              control={
                <Checkbox
                  checked={methods.includes(methodValue)}
                  onChange={() => handleMethodToggle(methodValue)}
                  size="small"
                />
              }
              label={
                <Chip
                  label={methodValue}
                  color={color}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              }
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          💡 선택한 HTTP 메서드만 이 라우트로 전달됩니다
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          선택된 메서드: {methods.length > 0 ? (
            <Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {methods.map(m => {
                const methodConfig = HTTP_METHODS.find(hm => hm.value === m);
                return (
                  <Chip
                    key={m}
                    label={m}
                    color={methodConfig?.color}
                    size="small"
                    sx={{ fontSize: '11px', height: '18px' }}
                  />
                );
              })}
            </Box>
          ) : (
            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
              없음 (최소 1개 선택 필요)
            </Typography>
          )}
        </Typography>
      </Box>
    </Stack>
  );
};