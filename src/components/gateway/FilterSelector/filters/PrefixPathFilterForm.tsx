// PrefixPath Filter 폼 컴포넌트
import React from 'react';
import { TextField, Box, Typography, Chip } from '@mui/material';
import type { ActuatorPrefixPathFilterArgs } from '../../../../types/gateway';

interface PrefixPathFilterFormProps {
  value: ActuatorPrefixPathFilterArgs;
  onChange: (value: ActuatorPrefixPathFilterArgs) => void;
}

export const PrefixPathFilterForm: React.FC<PrefixPathFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <Box>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        경로 앞에 추가할 접두사
        <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
      </Typography>

      <TextField
        value={value.prefix || ''}
        onChange={(e) => onChange({ ...value, prefix: e.target.value })}
        placeholder="예: /api"
        fullWidth
        size="small"
      />

      <Box sx={{ mt: 1.5, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">PrefixPath 동작 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="prefix = /api" size="small" color="primary" />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/users/123</code> → <code style={{ color: '#52c41a' }}>/api/users/123</code>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/products</code> → <code style={{ color: '#52c41a' }}>/api/products</code>
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="prefix = /v2" size="small" color="success" />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/users</code> → <code style={{ color: '#52c41a' }}>/v2/users</code>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            • <code>/orders/list</code> → <code style={{ color: '#52c41a' }}>/v2/orders/list</code>
          </Typography>
        </Box>

        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 요청 경로 앞에 접두사를 추가합니다 (백엔드 서비스의 버전 관리나 네임스페이스 지정에 유용)
        </Typography>
      </Box>
    </Box>
  );
};
