// Host Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Button, Stack, Box, Typography, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ActuatorHostPredicateArgs } from '../../../../types/gateway';

interface HostPredicateFormProps {
  value: ActuatorHostPredicateArgs;
  onChange: (value: ActuatorHostPredicateArgs) => void;
}

export const HostPredicateForm: React.FC<HostPredicateFormProps> = ({
  value,
  onChange
}) => {
  // patterns가 배열이 아닌 경우 배열로 변환
  const patterns = Array.isArray(value.patterns)
    ? (value.patterns.length > 0 ? value.patterns : [''])
    : value.patterns
      ? [value.patterns as string]
      : [''];

  const handlePatternChange = (index: number, newValue: string) => {
    const newPatterns = [...patterns];
    newPatterns[index] = newValue;
    onChange({ ...value, patterns: newPatterns });
  };

  const handleAddPattern = () => {
    onChange({ ...value, patterns: [...patterns, ''] });
  };

  const handleRemovePattern = (index: number) => {
    const newPatterns = patterns.filter((_, i) => i !== index);
    onChange({ ...value, patterns: newPatterns.length > 0 ? newPatterns : [''] });
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          호스트 패턴
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>

        <Stack spacing={1}>
          {patterns.map((pattern, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                value={pattern}
                onChange={(e) => handlePatternChange(index, e.target.value)}
                placeholder="예: **.example.com"
                fullWidth
                size="small"
              />
              {patterns.length > 1 && (
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemovePattern(index)}
                >
                  <DeleteIcon fontSize="small" />
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
            패턴 추가
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">호스트 패턴 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 0.5 }}>
            <Chip label="단일 호스트" size="small" color="primary" />
            <Typography variant="caption" component="code" sx={{ ml: 1, fontFamily: 'monospace' }}>
              api.example.com
            </Typography>
          </Box>
          <Box sx={{ mb: 0.5 }}>
            <Chip label="와일드카드" size="small" color="success" />
            <Typography variant="caption" component="code" sx={{ ml: 1, fontFamily: 'monospace' }}>
              **.example.com
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              (모든 서브도메인)
            </Typography>
          </Box>
          <Box sx={{ mb: 0.5 }}>
            <Chip label="다중 패턴" size="small" color="warning" />
            <Typography variant="caption" component="code" sx={{ ml: 1, fontFamily: 'monospace' }}>
              api.example.com, *.test.com
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          💡 Ant Path 스타일 패턴 사용 (**, *, ?)
        </Typography>
      </Box>
    </Stack>
  );
};