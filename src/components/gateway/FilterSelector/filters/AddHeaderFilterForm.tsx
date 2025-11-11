// AddRequestHeader / AddResponseHeader / AddRequestParameter 공통 폼
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorAddHeaderFilterArgs } from '../../../../types/gateway';

interface AddHeaderFilterFormProps {
  value: ActuatorAddHeaderFilterArgs;
  onChange: (value: ActuatorAddHeaderFilterArgs) => void;
  type: 'request-header' | 'response-header' | 'request-parameter';
}

export const AddHeaderFilterForm: React.FC<AddHeaderFilterFormProps> = ({
  value,
  onChange,
  type
}) => {
  const isParameter = type === 'request-parameter';
  const nameLabel = isParameter ? '파라미터 이름' : '헤더 이름';
  const valueLabel = isParameter ? '파라미터 값' : '헤더 값';
  const namePlaceholder = isParameter ? '예: userId' : '예: X-Request-Id';
  const valuePlaceholder = isParameter ? '예: 12345' : '예: {requestId}';

  return (
    <Stack spacing={2}>
      {/* Name */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          {nameLabel}
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.name || ''}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder={namePlaceholder}
          fullWidth
          size="small"
        />
      </Box>

      {/* Value */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          {valueLabel}
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.value || ''}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
          placeholder={valuePlaceholder}
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 SpEL 표현식 사용 가능 (예: <code>{'#{T(java.util.UUID).randomUUID().toString()}'}</code>)
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">예시:</Typography>
        <Box sx={{ mt: 0.5 }}>
          {isParameter ? (
            <>
              • <Chip label="version" size="small" color="primary" /> = <Chip label="v1" size="small" color="success" />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
                → ?version=v1 추가
              </Typography>
            </>
          ) : (
            <>
              • <Chip label="X-Response-Time" size="small" color="primary" /> = <Chip label={'#{T(System).currentTimeMillis()}'} size="small" color="success" />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
                → 응답 시간 헤더 추가
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Stack>
  );
};