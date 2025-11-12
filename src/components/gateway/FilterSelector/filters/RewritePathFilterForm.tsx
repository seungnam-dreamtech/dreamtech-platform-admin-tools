// RewritePath Filter 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorRewritePathFilterArgs } from '../../../../types/gateway';

interface RewritePathFilterFormProps {
  value: ActuatorRewritePathFilterArgs;
  onChange: (value: ActuatorRewritePathFilterArgs) => void;
}

export const RewritePathFilterForm: React.FC<RewritePathFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <Stack spacing={2}>
      {/* Regexp */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          정규식 패턴
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.regexp || ''}
          onChange={(e) => onChange({ ...value, regexp: e.target.value })}
          placeholder="예: /api/(?<segment>.*)"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 Java 정규식 문법 사용 (그룹 캡처 가능)
        </Typography>
      </Box>

      {/* Replacement */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          치환 패턴
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.replacement || ''}
          onChange={(e) => onChange({ ...value, replacement: e.target.value })}
          placeholder="예: /${segment}"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 캡처된 그룹을 사용할 수 있습니다
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">예시:</Typography>

        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="정규식" size="small" color="primary" />
            <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              /api/(?&lt;segment&gt;.*)
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Chip label="치환" size="small" color="success" />
            <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              /${'{segment}'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            → <code>/api/users/123</code> ⇒ <code style={{ color: '#52c41a' }}>/users/123</code>
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="정규식" size="small" color="primary" />
            <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              /v[0-9]+/(?&lt;path&gt;.*)
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Chip label="치환" size="small" color="success" />
            <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              /${'{path}'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
            → <code>/v1/users/profile</code> ⇒ <code style={{ color: '#52c41a' }}>/users/profile</code>
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};
