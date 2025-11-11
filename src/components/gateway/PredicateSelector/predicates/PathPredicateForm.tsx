// Path Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Button, Stack, Box, Typography, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, RemoveCircle as RemoveCircleIcon } from '@mui/icons-material';
import type { ActuatorPathPredicateArgs } from '../../../../types/gateway';

interface PathPredicateFormProps {
  value: ActuatorPathPredicateArgs;
  onChange: (value: ActuatorPathPredicateArgs) => void;
}

export const PathPredicateForm: React.FC<PathPredicateFormProps> = ({
  value,
  onChange
}) => {
  // patterns가 배열이 아닌 경우(문자열 등) 배열로 변환
  const patterns = Array.isArray(value.patterns)
    ? value.patterns
    : value.patterns
      ? [value.patterns as string]
      : [];

  const handleAddPattern = () => {
    onChange({
      ...value,
      patterns: [...patterns, '']
    });
  };

  const handleRemovePattern = (index: number) => {
    onChange({
      ...value,
      patterns: patterns.filter((_, i) => i !== index)
    });
  };

  const handlePatternChange = (index: number, newValue: string) => {
    const newPatterns = [...patterns];
    newPatterns[index] = newValue;
    onChange({
      ...value,
      patterns: newPatterns
    });
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          경로 패턴
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>

        <Stack spacing={1}>
          {patterns.map((pattern, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                value={pattern}
                onChange={(e) => handlePatternChange(index, e.target.value)}
                placeholder="/api/users/**"
                fullWidth
                size="small"
              />
              {patterns.length > 1 && (
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemovePattern(index)}
                >
                  <RemoveCircleIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddPattern}
            fullWidth
          >
            경로 패턴 추가
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 경로 패턴 예시:
        </Typography>
        <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label="/api/users/**" size="small" color="primary" />
          <Chip label="/api/*/profile" size="small" color="primary" />
          <Chip label="/docs/**" size="small" color="primary" />
        </Box>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            • <code>**</code>: 여러 경로 세그먼트 매칭
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            • <code>*</code>: 단일 경로 세그먼트 매칭
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};