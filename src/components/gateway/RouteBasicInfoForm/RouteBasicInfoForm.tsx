// 라우트 기본 정보 입력 폼
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { FormSection } from '../common/FormSection';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

export interface RouteBasicInfo {
  id: string;
  displayName?: string;
  uri: string;
  order: number;
  enabled: boolean;
}

interface RouteBasicInfoFormProps {
  value: RouteBasicInfo;
  onChange: (value: RouteBasicInfo) => void;
  readOnly?: boolean; // 수정 모드일 때 Route ID를 읽기 전용으로
}

export const RouteBasicInfoForm: React.FC<RouteBasicInfoFormProps> = ({
  value,
  onChange,
  readOnly = false
}) => {
  const handleFieldChange = (field: keyof RouteBasicInfo, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  return (
    <Stack spacing={3}>
      <FormSection
        title="기본 정보"
        description="라우트의 기본 식별 정보를 입력합니다"
        icon={<InfoIcon color="primary" />}
      >
        {/* Route ID */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              Route ID
              <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
            </Typography>
            {readOnly && (
              <Chip label="수정 불가" size="small" color="warning" />
            )}
          </Stack>
          <TextField
            value={value.id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            placeholder="예: user-service-route"
            disabled={readOnly}
            fullWidth
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {readOnly
              ? '💡 Route ID는 수정할 수 없습니다 (삭제 후 재생성 필요)'
              : '💡 라우트를 식별하는 고유 ID (영문, 숫자, 하이픈만 사용)'}
          </Typography>
        </Box>

        {/* Display Name */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            Display Name
          </Typography>
          <TextField
            value={value.displayName || ''}
            onChange={(e) => handleFieldChange('displayName', e.target.value)}
            placeholder="예: User Service"
            fullWidth
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            💡 관리 화면에 표시될 이름 (선택사항)
          </Typography>
        </Box>

        {/* URI */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            URI (목적지)
            <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
          </Typography>
          <TextField
            value={value.uri}
            onChange={(e) => handleFieldChange('uri', e.target.value)}
            placeholder="예: lb://user-service 또는 http://localhost:8080"
            fullWidth
            size="small"
          />
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              💡 라우팅할 대상 서비스 URI
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip label="lb://service-name" size="small" color="primary" />
              <Typography variant="caption" color="text.secondary">
                로드밸런서 사용
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip label="http://host:port" size="small" color="success" />
              <Typography variant="caption" color="text.secondary">
                직접 URL 지정
              </Typography>
            </Stack>
          </Box>
        </Box>

        {/* Order */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            Order (우선순위)
          </Typography>
          <TextField
            type="number"
            value={value.order}
            onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 0)}
            placeholder="0"
            sx={{ width: 200 }}
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            💡 숫자가 낮을수록 먼저 실행됩니다 (기본값: 0)
          </Typography>
        </Box>

        {/* Enabled */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={value.enabled}
                onChange={(e) => handleFieldChange('enabled', e.target.checked)}
              />
            }
            label={
              <Typography variant="body2" fontWeight="bold">
                라우트 활성화
              </Typography>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
            💡 비활성화하면 이 라우트는 무시됩니다
          </Typography>
        </Box>
      </FormSection>
    </Stack>
  );
};