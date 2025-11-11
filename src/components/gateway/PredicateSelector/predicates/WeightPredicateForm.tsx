// Weight Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip, Slider } from '@mui/material';
import type { ActuatorWeightPredicateArgs } from '../../../../types/gateway';

interface WeightPredicateFormProps {
  value: ActuatorWeightPredicateArgs;
  onChange: (value: ActuatorWeightPredicateArgs) => void;
}

export const WeightPredicateForm: React.FC<WeightPredicateFormProps> = ({
  value,
  onChange
}) => {
  const weightValue = typeof value.weight === 'string' ? parseInt(value.weight) : (value.weight ?? 1);

  const handleWeightChange = (_: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange({ ...value, weight: String(val) });
  };

  const handleWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    onChange({ ...value, weight: String(Math.max(1, Math.min(100, val))) });
  };

  return (
    <Stack spacing={2}>
      {/* 그룹 이름 */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          가중치 그룹 이름
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.group || ''}
          onChange={(e) => onChange({ ...value, group: e.target.value })}
          placeholder="예: service-a"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 같은 그룹명을 가진 라우트들 간에 가중치가 적용됩니다
        </Typography>
      </Box>

      {/* 가중치 */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          가중치 (1-100)
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={weightValue}
            onChange={handleWeightChange}
            min={1}
            max={100}
            marks={[
              { value: 1, label: '1' },
              { value: 25, label: '25' },
              { value: 50, label: '50' },
              { value: 75, label: '75' },
              { value: 100, label: '100' }
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
        <TextField
          type="number"
          value={weightValue}
          onChange={handleWeightInputChange}
          inputProps={{ min: 1, max: 100 }}
          sx={{ width: '120px', mt: 1 }}
          size="small"
        />
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">Weight Predicate 사용 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip label="A/B 테스팅" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              • Route A: group=<code>test-group</code>, weight=<code>90</code> (기존 버전)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              • Route B: group=<code>test-group</code>, weight=<code>10</code> (신규 버전)
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              → 90%는 Route A로, 10%는 Route B로 분산됩니다
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="카나리 배포" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              • Stable: group=<code>prod</code>, weight=<code>95</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              • Canary: group=<code>prod</code>, weight=<code>5</code>
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          💡 가중치 합계가 100일 필요는 없으며, 비율로 동작합니다
        </Typography>
      </Box>
    </Stack>
  );
};