// Query Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorQueryPredicateArgs } from '../../../../types/gateway';

interface QueryPredicateFormProps {
  value: ActuatorQueryPredicateArgs;
  onChange: (value: ActuatorQueryPredicateArgs) => void;
}

export const QueryPredicateForm: React.FC<QueryPredicateFormProps> = ({
  value,
  onChange
}) => {
  return (
    <Stack spacing={2}>
      {/* 파라미터 이름 */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          쿼리 파라미터 이름
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.param || ''}
          onChange={(e) => onChange({ ...value, param: e.target.value })}
          placeholder="예: userId"
          fullWidth
          size="small"
        />
      </Box>

      {/* 정규식 (선택) */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          값 패턴 (정규식, 선택사항)
        </Typography>
        <TextField
          value={value.regexp || ''}
          onChange={(e) => onChange({ ...value, regexp: e.target.value })}
          placeholder="예: \\d+ (숫자만 허용)"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 비워두면 파라미터 존재 여부만 체크
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">Query Predicate 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip label="파라미터 존재 확인" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              param = <code>userId</code>, regexp = (비워둠)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              → <code>/api/users?userId=123</code> ✓ 매칭
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="값 패턴 매칭" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              param = <code>userId</code>, regexp = <code>\d+</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              → <code>/api/users?userId=123</code> ✓ 매칭
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              → <code>/api/users?userId=abc</code> ✗ 불일치
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};