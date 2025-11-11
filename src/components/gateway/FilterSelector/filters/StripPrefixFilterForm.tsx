// StripPrefix Filter 폼 컴포넌트
import React from 'react';
import { TextField, Box, Typography, Chip } from '@mui/material';
import type { ActuatorStripPrefixFilterArgs } from '../../../../types/gateway';

interface StripPrefixFilterFormProps {
  value: ActuatorStripPrefixFilterArgs;
  onChange: (value: ActuatorStripPrefixFilterArgs) => void;
}

export const StripPrefixFilterForm: React.FC<StripPrefixFilterFormProps> = ({
  value,
  onChange
}) => {
  const partsValue = typeof value.parts === 'string' ? parseInt(value.parts) : value.parts;

  return (
    <Box>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        제거할 경로 세그먼트 수
        <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
      </Typography>

      <TextField
        type="number"
        value={partsValue}
        onChange={(e) => onChange({ ...value, parts: String(parseInt(e.target.value) || 1) })}
        inputProps={{ min: 1, max: 10 }}
        sx={{ width: 200 }}
        size="small"
      />

      <Box sx={{ mt: 1.5, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">동작 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Parts = <Chip label="1" size="small" color="primary" />
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/api/users/123</code> → <code style={{ color: '#52c41a' }}>/users/123</code>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/api/docs/swagger</code> → <code style={{ color: '#52c41a' }}>/docs/swagger</code>
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Parts = <Chip label="2" size="small" color="primary" />
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/api/v1/users/123</code> → <code style={{ color: '#52c41a' }}>/users/123</code>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/api/v1/docs</code> → <code style={{ color: '#52c41a' }}>/docs</code>
          </Typography>
        </Box>

        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 주의: 경로 세그먼트가 부족하면 빈 경로(/)가 됩니다
        </Typography>
      </Box>
    </Box>
  );
};