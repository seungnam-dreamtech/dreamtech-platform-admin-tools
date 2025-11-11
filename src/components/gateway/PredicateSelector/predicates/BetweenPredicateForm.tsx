// Between Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorBetweenPredicateArgs } from '../../../../types/gateway';

interface BetweenPredicateFormProps {
  value: ActuatorBetweenPredicateArgs;
  onChange: (value: ActuatorBetweenPredicateArgs) => void;
}

export const BetweenPredicateForm: React.FC<BetweenPredicateFormProps> = ({
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

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localDateTime = e.target.value;
    if (localDateTime) {
      const isoString = new Date(localDateTime).toISOString();
      onChange({ ...value, datetime1: isoString });
    } else {
      onChange({ ...value, datetime1: '' });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localDateTime = e.target.value;
    if (localDateTime) {
      const isoString = new Date(localDateTime).toISOString();
      onChange({ ...value, datetime2: isoString });
    } else {
      onChange({ ...value, datetime2: '' });
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          기간 설정 (시작 ~ 종료)
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="datetime-local"
            label="시작 시각"
            value={formatDatetimeLocal(value.datetime1)}
            onChange={handleStartDateChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="datetime-local"
            label="종료 시각"
            value={formatDatetimeLocal(value.datetime2)}
            onChange={handleEndDateChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 설정한 기간 내의 요청만 이 라우트로 전달됩니다
        </Typography>
      </Box>

      {value.datetime1 && value.datetime2 && (
        <Box sx={{ p: 1, bgcolor: 'info.lighter', borderRadius: 1, border: 1, borderColor: 'info.light' }}>
          <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
            ISO 8601 형식:
          </Typography>
          <Stack spacing={0.5}>
            <Box>
              <Chip label="시작" size="small" color="success" sx={{ fontSize: '10px', height: '16px' }} />
              <Typography variant="caption" component="code" sx={{ fontFamily: 'monospace', ml: 1, fontSize: '11px' }}>
                {value.datetime1}
              </Typography>
            </Box>
            <Box>
              <Chip label="종료" size="small" color="error" sx={{ fontSize: '10px', height: '16px' }} />
              <Typography variant="caption" component="code" sx={{ fontFamily: 'monospace', ml: 1, fontSize: '11px' }}>
                {value.datetime2}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">Between Predicate 사용 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip label="기간 한정 이벤트" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              2025-01-01 00:00 ~ 2025-01-31 23:59
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              → 1월 한 달간만 이벤트 페이지로 라우팅
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Chip label="점검 시간 우회" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              점검 시간대에만 점검 페이지로 라우팅
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Chip label="베타 테스트" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              베타 기간 동안만 신규 기능 활성화
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};