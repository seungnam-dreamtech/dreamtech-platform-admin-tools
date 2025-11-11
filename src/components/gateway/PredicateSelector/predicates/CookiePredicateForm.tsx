// Cookie Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorCookiePredicateArgs } from '../../../../types/gateway';

interface CookiePredicateFormProps {
  value: ActuatorCookiePredicateArgs;
  onChange: (value: ActuatorCookiePredicateArgs) => void;
}

export const CookiePredicateForm: React.FC<CookiePredicateFormProps> = ({
  value,
  onChange
}) => {
  return (
    <Stack spacing={2}>
      {/* 쿠키 이름 */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          쿠키 이름
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.name || ''}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="예: session_id"
          fullWidth
          size="small"
        />
      </Box>

      {/* 정규식 */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          값 패턴 (정규식)
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.regexp || ''}
          onChange={(e) => onChange({ ...value, regexp: e.target.value })}
          placeholder="예: [a-f0-9]{32}"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 Java 정규식 문법 사용
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">Cookie Predicate 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip label="세션 쿠키" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              name = <code>JSESSIONID</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              regexp = <code>[A-Z0-9]+</code>
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              → Cookie: JSESSIONID=ABC123DEF456 ✓
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="사용자 ID" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              name = <code>user_id</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              regexp = <code>\d+</code> (숫자만)
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              → Cookie: user_id=12345 ✓
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};