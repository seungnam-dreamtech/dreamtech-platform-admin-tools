// Header Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorHeaderPredicateArgs } from '../../../../types/gateway';

interface HeaderPredicateFormProps {
  value: ActuatorHeaderPredicateArgs;
  onChange: (value: ActuatorHeaderPredicateArgs) => void;
}

export const HeaderPredicateForm: React.FC<HeaderPredicateFormProps> = ({
  value,
  onChange
}) => {
  return (
    <Stack spacing={2}>
      {/* Header Name */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          헤더 이름
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.name || value.header || ''}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="예: X-Request-Id"
          fullWidth
          size="small"
        />
      </Box>

      {/* Header Value (Regexp) */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          헤더 값 (정규식)
        </Typography>
        <TextField
          value={value.value || value.regexp || ''}
          onChange={(e) => onChange({ ...value, regexp: e.target.value })}
          placeholder="예: \\d+"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 정규식으로 헤더 값을 검증합니다 (선택사항)
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">예시:</Typography>
        <Box sx={{ mt: 0.5 }}>
          <Box sx={{ mb: 1 }}>
            • <Chip label="X-Request-Id" size="small" color="primary" /> + <Chip label="\d+" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              → X-Request-Id 헤더가 숫자만 포함하는 경우
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            • <Chip label="Authorization" size="small" color="primary" /> + <Chip label="Bearer .*" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              → Authorization 헤더가 Bearer로 시작하는 경우
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};