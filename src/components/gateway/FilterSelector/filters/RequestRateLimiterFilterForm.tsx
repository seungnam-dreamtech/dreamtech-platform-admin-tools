// RequestRateLimiter Filter 폼 컴포넌트
import React from 'react';
import { TextField, Stack, Box, Typography, Chip } from '@mui/material';
import type { ActuatorRequestRateLimiterFilterArgs } from '../../../../types/gateway';

interface RequestRateLimiterFilterFormProps {
  value: ActuatorRequestRateLimiterFilterArgs;
  onChange: (value: ActuatorRequestRateLimiterFilterArgs) => void;
}

export const RequestRateLimiterFilterForm: React.FC<RequestRateLimiterFilterFormProps> = ({
  value,
  onChange
}) => {
  const replenishRateValue = typeof value.replenishRate === 'string' ? parseInt(value.replenishRate) : value.replenishRate;
  const burstCapacityValue = typeof value.burstCapacity === 'string' ? parseInt(value.burstCapacity) : value.burstCapacity;
  const requestedTokensValue = typeof value.requestedTokens === 'string' ? parseInt(value.requestedTokens) : (value.requestedTokens || 1);

  const handleNumberChange = (field: keyof ActuatorRequestRateLimiterFilterArgs, valueStr: string) => {
    const numValue = valueStr === '' ? 1 : parseInt(valueStr, 10);
    onChange({ ...value, [field]: String(numValue) });
  };

  return (
    <Stack spacing={2}>
      {/* Replenish Rate */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          초당 재충전 속도 (replenishRate)
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          type="number"
          value={replenishRateValue}
          onChange={(e) => handleNumberChange('replenishRate', e.target.value)}
          inputProps={{ min: 1, max: 10000 }}
          placeholder="예: 10"
          sx={{ width: 200 }}
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 초당 허용되는 요청 수 (평균 처리량)
        </Typography>
      </Box>

      {/* Burst Capacity */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          버스트 용량 (burstCapacity)
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          type="number"
          value={burstCapacityValue}
          onChange={(e) => handleNumberChange('burstCapacity', e.target.value)}
          inputProps={{ min: 1, max: 100000 }}
          placeholder="예: 20"
          sx={{ width: 200 }}
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 한 번에 처리 가능한 최대 요청 수 (버킷 크기)
        </Typography>
      </Box>

      {/* Requested Tokens */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          요청당 토큰 소비량 (requestedTokens)
        </Typography>
        <TextField
          type="number"
          value={requestedTokensValue}
          onChange={(e) => handleNumberChange('requestedTokens', e.target.value)}
          inputProps={{ min: 1, max: 100 }}
          placeholder="기본값: 1"
          sx={{ width: 200 }}
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 각 요청이 소비하는 토큰 수 (기본값: 1)
        </Typography>
      </Box>

      {/* Key Resolver (선택) */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          키 리졸버 (keyResolver Bean 이름)
        </Typography>
        <TextField
          value={value.keyResolver || ''}
          onChange={(e) => onChange({ ...value, keyResolver: e.target.value })}
          placeholder="예: userKeyResolver (선택사항)"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 Rate Limiting 대상을 구분하는 키 생성 Bean (비워두면 기본 키 사용)
        </Typography>
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">RequestRateLimiter 설정 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="기본 설정" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              replenishRate = <code>10</code> (초당 10개)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              burstCapacity = <code>20</code> (최대 20개 버스트)
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 평균 10 req/s, 순간적으로 20개까지 허용
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Chip label="엄격한 제한" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              replenishRate = <code>5</code>, burstCapacity = <code>5</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 버스트 없이 정확히 초당 5개만 허용
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="유연한 제한" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              replenishRate = <code>100</code>, burstCapacity = <code>500</code>
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, display: 'block', color: '#52c41a', mt: 0.5 }}>
              → 평균 100 req/s, 트래픽 급증 시 500개까지 수용
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 Token Bucket 알고리즘 사용 (Redis 기반 분산 처리)
        </Typography>
      </Box>
    </Stack>
  );
};
