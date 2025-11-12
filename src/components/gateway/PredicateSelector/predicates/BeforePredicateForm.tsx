// Before Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorBeforePredicateArgs } from '../../../../types/gateway';

interface BeforePredicateFormProps {
  value: ActuatorBeforePredicateArgs;
  onChange: (value: ActuatorBeforePredicateArgs) => void;
}

export const BeforePredicateForm: React.FC<BeforePredicateFormProps> = ({
  value,
  onChange
}) => {
  // ISO 8601 문자열을 datetime-local 형식으로 변환
  const formatDatetimeLocal = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localDateTime = e.target.value;
    if (localDateTime) {
      const isoString = new Date(localDateTime).toISOString();
      onChange({ ...value, datetime: isoString });
    } else {
      onChange({ ...value, datetime: '' });
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          이 시각 이전에만 매칭
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          type="datetime-local"
          value={formatDatetimeLocal(value.datetime)}
          onChange={handleDateTimeChange}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 선택한 시각 이전의 요청만 이 라우트로 전달됩니다
        </Typography>
      </Box>

      {value.datetime && (
        <Box sx={{ p: 1, bgcolor: 'info.lighter', borderRadius: 1, border: 1, borderColor: 'info.light' }}>
          <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
            ISO 8601 형식:
          </Typography>
          <Typography variant="caption" component="code" sx={{ fontFamily: 'monospace' }}>
            {value.datetime}
          </Typography>
        </Box>
      )}

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">Before Predicate 사용 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip label="서비스 종료" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              2025-12-31 23:59:59 이전 → 구 API 라우트 유효
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Chip label="기간 한정 이벤트" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              이벤트 종료일 이전 → 이벤트 페이지로 라우팅
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};