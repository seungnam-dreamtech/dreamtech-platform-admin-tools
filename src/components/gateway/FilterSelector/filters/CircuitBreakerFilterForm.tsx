// CircuitBreaker Filter 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorCircuitBreakerFilterArgs } from '../../../../types/gateway';

interface CircuitBreakerFilterFormProps {
  value: ActuatorCircuitBreakerFilterArgs;
  onChange: (value: ActuatorCircuitBreakerFilterArgs) => void;
}

export const CircuitBreakerFilterForm: React.FC<CircuitBreakerFilterFormProps> = ({
  value,
  onChange
}) => {
  return (
    <Stack spacing={2}>
      {/* Name */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          Circuit Breaker 이름
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.name || ''}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="예: myCircuitBreaker"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 Resilience4j 설정에서 참조할 Circuit Breaker 이름
        </Typography>
      </Box>

      {/* Fallback URI */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          폴백 URI (선택사항)
        </Typography>
        <TextField
          value={value.fallbackUri || ''}
          onChange={(e) => onChange({ ...value, fallbackUri: e.target.value })}
          placeholder="예: forward:/fallback 또는 forward:/error"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 Circuit이 Open되었을 때 리다이렉트될 URI
        </Typography>
      </Box>

      {/* Status Codes (선택) */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          실패로 간주할 HTTP 상태 코드 (선택사항)
        </Typography>
        <TextField
          value={value.statusCodes || ''}
          onChange={(e) => onChange({ ...value, statusCodes: e.target.value })}
          placeholder="예: 500,502,503,504"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 쉼표로 구분하여 입력 (비워두면 5xx 에러만 실패로 간주)
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">CircuitBreaker 설정 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="기본 설정" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              name = <code>backendService</code>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              fallbackUri = <code>forward:/service-unavailable</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 백엔드 장애 시 폴백 페이지로 리다이렉트
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Chip label="커스텀 상태 코드" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              statusCodes = <code>500,503,504</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 지정한 상태 코드만 실패로 간주
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="폴백 없음" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              fallbackUri = (비워둠)
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → Circuit Open 시 503 Service Unavailable 반환
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 Resilience4j와 통합되어 동작 (application.yml에서 세부 설정 필요)
        </Typography>
      </Box>
    </Stack>
  );
};
