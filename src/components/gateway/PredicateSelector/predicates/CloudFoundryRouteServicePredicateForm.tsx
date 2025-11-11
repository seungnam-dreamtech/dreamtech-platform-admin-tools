// CloudFoundryRouteService Predicate 폼 컴포넌트
import React from 'react';
import { Alert, Stack, Box, Typography, Chip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { ActuatorCloudFoundryRouteServicePredicateArgs } from '../../../../types/gateway';

interface CloudFoundryRouteServicePredicateFormProps {
  value: ActuatorCloudFoundryRouteServicePredicateArgs;
  onChange: (value: ActuatorCloudFoundryRouteServicePredicateArgs) => void;
}

export const CloudFoundryRouteServicePredicateForm: React.FC<CloudFoundryRouteServicePredicateFormProps> = () => {
  return (
    <Stack spacing={2}>
      <Alert severity="info" icon={<InfoIcon />}>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          CloudFoundry Route Service Predicate
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          이 Predicate는 CloudFoundry 환경에서 Route Service 요청을 감지합니다.
        </Typography>
        <Typography variant="body2">
          별도의 설정 파라미터가 필요하지 않으며, CloudFoundry의 <code>X-CF-Forwarded-Url</code> 헤더를 기반으로 동작합니다.
        </Typography>
      </Alert>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">CloudFoundry Route Service 동작:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip label="헤더 감지" size="small" color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              요청에 <code>X-CF-Forwarded-Url</code> 헤더가 있으면 매칭
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Chip label="자동 처리" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              CloudFoundry가 자동으로 추가하는 헤더를 감지하여 라우팅
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Chip label="사용 사례" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              CloudFoundry 플랫폼에서 Route Service 패턴 구현 시 사용
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          💡 CloudFoundry 환경이 아닌 경우 이 Predicate는 매칭되지 않습니다
        </Typography>
      </Box>
    </Stack>
  );
};