// Retry Filter 폼 컴포넌트
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  TextField,
  Stack,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  OutlinedInput
} from '@mui/material';
import type { ActuatorRetryFilterArgs } from '../../../../types/gateway';

interface RetryFilterFormProps {
  value: ActuatorRetryFilterArgs;
  onChange: (value: ActuatorRetryFilterArgs) => void;
}

export const RetryFilterForm: React.FC<RetryFilterFormProps> = ({
  value,
  onChange
}) => {
  const retriesValue = typeof value.retries === 'string' ? parseInt(value.retries) : (value.retries || 3);
  const backoffValue = value.backoff ? JSON.parse(JSON.stringify(value.backoff)) : { firstBackoff: '5ms', maxBackoff: '50ms', factor: 2, basedOnPreviousValue: false };

  const handleNumberChange = (valueStr: string) => {
    const numValue = valueStr === '' ? 3 : parseInt(valueStr, 10);
    onChange({ ...value, retries: String(numValue) });
  };

  const handleMethodsChange = (event: any) => {
    const selectedValues = event.target.value as string[];
    onChange({ ...value, methods: selectedValues });
  };

  const handleBackoffChange = (field: string, newValue: any) => {
    const newBackoff = { ...backoffValue, [field]: newValue };
    onChange({ ...value, backoff: newBackoff });
  };

  const handleBackoffNumberChange = (field: string, valueStr: string) => {
    const numValue = valueStr === '' ? 2 : parseFloat(valueStr);
    handleBackoffChange(field, numValue);
  };

  return (
    <Stack spacing={2}>
      {/* Retries */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          재시도 횟수 (retries)
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          type="number"
          value={retriesValue}
          onChange={(e) => handleNumberChange(e.target.value)}
          inputProps={{ min: 1, max: 10 }}
          sx={{ width: 200 }}
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 최대 재시도 횟수 (기본값: 3)
        </Typography>
      </Box>

      {/* HTTP Methods */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          재시도할 HTTP 메서드
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>메서드 선택</InputLabel>
          <Select
            multiple
            value={value.methods || ['GET']}
            onChange={handleMethodsChange}
            input={<OutlinedInput label="메서드 선택" />}
            renderValue={(selected) => {
              const methods = Array.isArray(selected) ? selected : [selected];
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {methods.map((val: string) => (
                    <Chip key={val} label={val} size="small" />
                  ))}
                </Box>
              );
            }}
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 재시도를 허용할 HTTP 메서드 (기본값: GET만)
        </Typography>
      </Box>

      {/* Status Codes */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          재시도할 HTTP 상태 코드
        </Typography>
        <TextField
          value={value.statuses || ''}
          onChange={(e) => onChange({ ...value, statuses: e.target.value })}
          placeholder="예: 500,502,503,504"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 쉼표로 구분 (비워두면 5xx 에러에 대해 재시도)
        </Typography>
      </Box>

      {/* Exceptions */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          재시도할 예외 클래스
        </Typography>
        <TextField
          value={value.exceptions || ''}
          onChange={(e) => onChange({ ...value, exceptions: e.target.value })}
          placeholder="예: java.io.IOException,java.util.concurrent.TimeoutException"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 쉼표로 구분 (완전한 클래스명 사용)
        </Typography>
      </Box>

      {/* Backoff 설정 */}
      <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed', borderColor: 'grey.300' }}>
        <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ mb: 1.5 }}>
          ⏱️ Backoff 설정 (재시도 간격)
        </Typography>

        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>첫 번째 지연 (firstBackoff)</Typography>
            <TextField
              value={backoffValue.firstBackoff}
              onChange={(e) => handleBackoffChange('firstBackoff', e.target.value)}
              placeholder="예: 5ms, 1s"
              sx={{ width: 200 }}
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>최대 지연 (maxBackoff)</Typography>
            <TextField
              value={backoffValue.maxBackoff}
              onChange={(e) => handleBackoffChange('maxBackoff', e.target.value)}
              placeholder="예: 50ms, 10s"
              sx={{ width: 200 }}
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>증가 배수 (factor)</Typography>
            <TextField
              type="number"
              value={backoffValue.factor}
              onChange={(e) => handleBackoffNumberChange('factor', e.target.value)}
              inputProps={{ min: 1, max: 10, step: 0.1 }}
              sx={{ width: 200 }}
              size="small"
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={backoffValue.basedOnPreviousValue}
                onChange={(e) => handleBackoffChange('basedOnPreviousValue', e.target.checked)}
              />
            }
            label="이전 값 기반 계산 (basedOnPreviousValue)"
          />
        </Stack>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">Retry 설정 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="기본 재시도" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              retries = <code>3</code>, methods = <code>GET</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → GET 요청 실패 시 최대 3번 재시도
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="Exponential Backoff" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              firstBackoff = <code>5ms</code>, maxBackoff = <code>50ms</code>, factor = <code>2</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 5ms → 10ms → 20ms → 40ms (최대 50ms)
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 네트워크 일시 장애나 타임아웃 상황에서 자동 재시도
        </Typography>
      </Box>
    </Stack>
  );
};
