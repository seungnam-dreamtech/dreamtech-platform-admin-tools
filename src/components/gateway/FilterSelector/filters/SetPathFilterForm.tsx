// SetPath Filter 폼 컴포넌트
import React from 'react';
import { TextField, Box, Typography, Chip } from '@mui/material';
import type { ActuatorSetPathFilterArgs } from '../../../../types/gateway';

interface SetPathFilterFormProps {
  value: ActuatorSetPathFilterArgs;
  onChange: (value: ActuatorSetPathFilterArgs) => void;
}

export const SetPathFilterForm: React.FC<SetPathFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <Box>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        새로운 경로 템플릿
        <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
      </Typography>

      <TextField
        value={value.template || ''}
        onChange={(e) => onChange({ ...value, template: e.target.value })}
        placeholder="예: /api/{segment}"
        fullWidth
        size="small"
      />

      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        💡 경로 변수를 사용할 수 있습니다 (Spring URI Template 문법)
      </Typography>

      <Box sx={{ mt: 1.5, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">SetPath 동작 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="경로 고정" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              template = <code>/api/fixed</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              • 모든 요청 → <code style={{ color: '#52c41a' }}>/api/fixed</code>
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Chip label="경로 변수 활용" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              Path Predicate = <code>{'/users/{id}'}</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              template = <code>{'/api/v2/users/{id}'}</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → <code>/users/123</code> ⇒ <code>/api/v2/users/123</code>
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="다중 변수" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              Path = <code>{'/{service}/{id}'}</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              template = <code>{'/backend/{service}/get/{id}'}</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → <code>/users/123</code> ⇒ <code>/backend/users/get/123</code>
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 요청 경로를 템플릿 기반으로 완전히 재작성합니다
        </Typography>
      </Box>
    </Box>
  );
};
