// RemoteAddr Predicate 폼 컴포넌트
import React from 'react';
import { TextField, Button, Stack, Box, Typography, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ActuatorRemoteAddrPredicateArgs } from '../../../../types/gateway';

interface RemoteAddrPredicateFormProps {
  value: ActuatorRemoteAddrPredicateArgs;
  onChange: (value: ActuatorRemoteAddrPredicateArgs) => void;
}

export const RemoteAddrPredicateForm: React.FC<RemoteAddrPredicateFormProps> = ({
  value,
  onChange
}) => {
  // sources가 배열이 아닌 경우 배열로 변환
  const sources = Array.isArray(value.sources)
    ? (value.sources.length > 0 ? value.sources : [''])
    : value.sources
      ? [value.sources as string]
      : [''];

  const handleSourceChange = (index: number, newValue: string) => {
    const newSources = [...sources];
    newSources[index] = newValue;
    onChange({ ...value, sources: newSources });
  };

  const handleAddSource = () => {
    onChange({ ...value, sources: [...sources, ''] });
  };

  const handleRemoveSource = (index: number) => {
    const newSources = sources.filter((_, i) => i !== index);
    onChange({ ...value, sources: newSources.length > 0 ? newSources : [''] });
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          허용할 IP 주소/CIDR
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>

        <Stack spacing={1}>
          {sources.map((source, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                value={source}
                onChange={(e) => handleSourceChange(index, e.target.value)}
                placeholder="예: 192.168.1.1/24"
                fullWidth
                size="small"
              />
              {sources.length > 1 && (
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveSource(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSource}
            fullWidth
          >
            IP/CIDR 추가
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">IP 주소 형식 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 0.5 }}>
            <Chip label="단일 IP" size="small" color="primary" />
            <Typography variant="caption" component="code" sx={{ ml: 1, fontFamily: 'monospace' }}>
              192.168.1.100
            </Typography>
          </Box>
          <Box sx={{ mb: 0.5 }}>
            <Chip label="CIDR 블록" size="small" color="success" />
            <Typography variant="caption" component="code" sx={{ ml: 1, fontFamily: 'monospace' }}>
              192.168.1.0/24
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              (192.168.1.0 ~ 192.168.1.255)
            </Typography>
          </Box>
          <Box sx={{ mb: 0.5 }}>
            <Chip label="IPv6" size="small" color="warning" />
            <Typography variant="caption" component="code" sx={{ ml: 1, fontFamily: 'monospace' }}>
              2001:db8::/32
            </Typography>
          </Box>
          <Box sx={{ mb: 0.5 }}>
            <Chip label="로컬호스트" size="small" color="secondary" />
            <Typography variant="caption" component="code" sx={{ ml: 1, fontFamily: 'monospace' }}>
              127.0.0.1
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
              또는
            </Typography>
            <Typography variant="caption" component="code" sx={{ fontFamily: 'monospace' }}>
              ::1
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          💡 여러 IP/CIDR를 추가하면 OR 조건으로 동작합니다
        </Typography>
      </Box>
    </Stack>
  );
};