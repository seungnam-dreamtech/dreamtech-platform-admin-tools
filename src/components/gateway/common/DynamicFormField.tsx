// 동적 필드 입력 공통 컴포넌트
import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Stack,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Add as AddIcon, RemoveCircle as RemoveCircleIcon } from '@mui/icons-material';

interface DynamicFormFieldProps {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'datetime' | 'array';
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  required?: boolean;
  help?: string;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  label,
  value,
  onChange,
  type,
  placeholder,
  options,
  required,
  help
}) => {
  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <TextField
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            fullWidth
            size="small"
          />
        );

      case 'number':
        return (
          <TextField
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder={placeholder}
            fullWidth
            size="small"
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{placeholder}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              label={placeholder}
            >
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={placeholder}
          />
        );

      case 'datetime':
        return (
          <TextField
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            fullWidth
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case 'array': {
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <Stack spacing={1}>
            {arrayValue.map((item, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  value={item || ''}
                  onChange={(e) => {
                    const newArray = [...arrayValue];
                    newArray[index] = e.target.value;
                    onChange(newArray);
                  }}
                  placeholder={placeholder}
                  size="small"
                  fullWidth
                />
                <IconButton
                  color="error"
                  onClick={() => {
                    const newArray = arrayValue.filter((_, i) => i !== index);
                    onChange(newArray);
                  }}
                  size="small"
                >
                  <RemoveCircleIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => onChange([...arrayValue, ''])}
              fullWidth
            >
              추가
            </Button>
          </Stack>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        {label}
        {required && <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>}
      </Typography>
      {renderField()}
      {help && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 {help}
        </Typography>
      )}
    </Box>
  );
};