// RequestSize Filter 폼 컴포넌트
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
  MenuItem
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { ActuatorRequestSizeFilterArgs } from '../../../../types/gateway';

interface RequestSizeFilterFormProps {
  value: ActuatorRequestSizeFilterArgs;
  onChange: (value: ActuatorRequestSizeFilterArgs) => void;
}

export const RequestSizeFilterForm: React.FC<RequestSizeFilterFormProps> = ({
  value,
  onChange
}) => {
  // maxSize를 숫자와 단위로 분리
  const parseMaxSize = (maxSize: string) => {
    const match = maxSize.match(/^(\d+(?:\.\d+)?)(B|KB|MB|GB)?$/i);
    if (match) {
      return { number: parseFloat(match[1]), unit: match[2] || 'B' };
    }
    return { number: 5, unit: 'MB' };
  };

  const { number, unit } = parseMaxSize(value.maxSize || '5MB');

  const handleNumberChange = (valueStr: string) => {
    const newNumber = valueStr === '' ? 1 : parseFloat(valueStr);
    onChange({ ...value, maxSize: `${newNumber}${unit}` });
  };

  const handleUnitChange = (event: SelectChangeEvent) => {
    const newUnit = event.target.value;
    onChange({ ...value, maxSize: `${number}${newUnit}` });
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          최대 요청 크기 (maxSize)
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>

        <Stack direction="row" spacing={1}>
          <TextField
            type="number"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            inputProps={{ min: 1, max: 10000 }}
            sx={{ width: 150 }}
            size="small"
          />
          <FormControl sx={{ width: 100 }} size="small">
            <InputLabel>단위</InputLabel>
            <Select
              value={unit}
              onChange={handleUnitChange}
              label="단위"
            >
              <MenuItem value="B">B (Bytes)</MenuItem>
              <MenuItem value="KB">KB</MenuItem>
              <MenuItem value="MB">MB</MenuItem>
              <MenuItem value="GB">GB</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 이 크기를 초과하는 요청은 413 Payload Too Large 응답을 받습니다
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'info.light', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
          설정된 값:
        </Typography>
        <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
          {value.maxSize}
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">RequestSize 설정 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="작은 파일 업로드" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              maxSize = <code>5MB</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 프로필 이미지 같은 작은 파일 업로드용
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Chip label="일반 API" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              maxSize = <code>1MB</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → JSON 요청 본문 크기 제한
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Chip label="대용량 파일" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              maxSize = <code>100MB</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 동영상, 대용량 문서 업로드용
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="엄격한 제한" size="small" color="secondary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              maxSize = <code>512KB</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 작은 메시지만 허용
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 DDoS 공격 방어 및 서버 리소스 보호에 유용
        </Typography>
      </Box>
    </Stack>
  );
};
