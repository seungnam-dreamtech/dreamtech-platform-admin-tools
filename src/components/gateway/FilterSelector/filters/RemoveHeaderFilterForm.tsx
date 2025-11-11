// Remove Header/Parameter Filter 폼 컴포넌트 (공통)
import React from 'react';
import { TextField, Button, Stack, Box, Typography, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type {
  ActuatorRemoveRequestHeaderFilterArgs,
  ActuatorRemoveResponseHeaderFilterArgs,
  ActuatorRemoveRequestParameterFilterArgs
} from '../../../../types/gateway';

type RemoveFilterArgs =
  | ActuatorRemoveRequestHeaderFilterArgs
  | ActuatorRemoveResponseHeaderFilterArgs
  | ActuatorRemoveRequestParameterFilterArgs;

interface RemoveHeaderFilterFormProps {
  value: RemoveFilterArgs;
  onChange: (value: RemoveFilterArgs) => void;
  type: 'request-header' | 'response-header' | 'request-parameter';
}

export const RemoveHeaderFilterForm: React.FC<RemoveHeaderFilterFormProps> = ({
  value,
  onChange,
  type
}) => {
  const isParameter = type === 'request-parameter';
  const isResponseHeader = type === 'response-header';

  const label = isParameter ? '파라미터' : '헤더';
  const placeholder = isParameter ? '예: debug' : '예: X-Request-Id';

  // name 또는 names 필드 처리
  const names = 'names' in value ? (value.names || []) : (value.name ? [value.name] : ['']);

  const handleNameChange = (index: number, newValue: string) => {
    const newNames = [...names];
    newNames[index] = newValue;

    if ('names' in value) {
      onChange({ ...value, names: newNames });
    } else {
      onChange({ ...value, name: newNames[0] });
    }
  };

  const handleAddName = () => {
    if ('names' in value) {
      onChange({ ...value, names: [...(value.names || []), ''] });
    }
  };

  const handleRemoveName = (index: number) => {
    if ('names' in value) {
      const newNames = names.filter((_name: string, i: number) => i !== index);
      onChange({ ...value, names: newNames.length > 0 ? newNames : [''] });
    }
  };

  const supportsMultiple = 'names' in value;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          제거할 {label} 이름
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>

        <Stack spacing={1}>
          {names.map((name: string, index: number) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <TextField
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={placeholder}
                fullWidth
                size="small"
              />
              {supportsMultiple && names.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => handleRemoveName(index)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>
          ))}

          {supportsMultiple && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddName}
              fullWidth
            >
              {label} 추가
            </Button>
          )}
        </Stack>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          Remove {type === 'request-header' ? 'Request Header' : type === 'response-header' ? 'Response Header' : 'Request Parameter'} 예시:
        </Typography>
        <Box sx={{ mt: 1 }}>
          {type === 'request-header' && (
            <>
              <Box sx={{ mb: 0.5 }}>
                <Chip label="보안 헤더 제거" size="small" color="primary" />
                <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  X-Internal-Token
                </Typography>
              </Box>
              <Box sx={{ mb: 0.5 }}>
                <Chip label="디버그 헤더" size="small" color="success" />
                <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  X-Debug-Mode
                </Typography>
              </Box>
            </>
          )}
          {type === 'response-header' && (
            <>
              <Box sx={{ mb: 0.5 }}>
                <Chip label="서버 정보 숨김" size="small" color="primary" />
                <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  Server
                </Typography>
              </Box>
              <Box sx={{ mb: 0.5 }}>
                <Chip label="내부 헤더 제거" size="small" color="warning" />
                <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  X-Application-Context
                </Typography>
              </Box>
            </>
          )}
          {type === 'request-parameter' && (
            <>
              <Box sx={{ mb: 0.5 }}>
                <Chip label="내부 파라미터" size="small" color="primary" />
                <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  _internal
                </Typography>
              </Box>
              <Box sx={{ mb: 0.5 }}>
                <Chip label="디버그 모드" size="small" color="success" />
                <Typography component="span" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  debug
                </Typography>
              </Box>
            </>
          )}
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 {isResponseHeader ? '응답' : '요청'}에서 지정한 {label}를 제거합니다
        </Typography>
      </Box>
    </Stack>
  );
};
