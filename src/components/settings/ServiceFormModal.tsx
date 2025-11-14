// 플랫폼 서비스 추가/수정 모달

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Tooltip,
} from '@mui/material';
import type { ServiceScope } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface ServiceFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (service: ServiceScope) => void;
  service?: ServiceScope | null;
}

interface FormData {
  service_id: string;
  description: string;
}

export function ServiceFormModal({ open, onCancel, onSave, service }: ServiceFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    service_id: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const snackbar = useSnackbar();

  const isEditing = !!service;

  useEffect(() => {
    if (open) {
      // 상태 초기화
      setHasChanges(false);
      setErrors({});

      if (service) {
        setFormData({
          service_id: service.service_id,
          description: service.description,
        });
      } else {
        setFormData({
          service_id: '',
          description: '',
        });
      }
    }
  }, [open, service]);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (!isEditing || field === 'description') {
      setHasChanges(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.service_id.trim()) {
      newErrors.service_id = '서비스 ID를 입력하세요';
    } else if (!/^[a-z][a-z0-9-]*$/.test(formData.service_id)) {
      newErrors.service_id = '소문자, 숫자, 하이픈만 사용 가능하며 소문자로 시작해야 합니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력하세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && service) {
        // 수정 모드: description만 업데이트
        if (hasChanges) {
          await userManagementService.updateServiceScope(service.service_id, {
            description: formData.description,
          });
          snackbar.success('서비스가 수정되었습니다');
        }

        // 목록 새로고침을 위해 onSave 콜백 호출
        onSave({
          ...service,
          description: formData.description,
        });
      } else {
        // 생성 모드: 새로운 서비스 생성
        const serviceData: ServiceScope = {
          id: 0, // 서버에서 자동 생성
          service_id: formData.service_id,
          description: formData.description,
          bit_position: 0, // 서버에서 자동 할당
          is_active: true, // 기본값
          created_at: new Date().toISOString(),
        };

        onSave(serviceData);
      }

      setHasChanges(false);
    } catch (error) {
      snackbar.error('서비스 저장에 실패했습니다');
      console.error('Failed to save service:', error);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? '서비스 스코프 수정' : '새 서비스 스코프 추가'}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          플랫폼의 마이크로서비스를 정의합니다. 서비스 ID는 고유해야 하며 비트 위치는 서버에서 자동으로
          할당됩니다.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tooltip
            title="시스템에서 사용하는 고유 식별자 (예: auth, notification, ecg-analysis)"
            placement="top"
          >
            <TextField
              label="서비스 ID (Service ID)"
              value={formData.service_id}
              onChange={(e) => handleFieldChange('service_id', e.target.value.toLowerCase())}
              error={!!errors.service_id}
              helperText={errors.service_id}
              placeholder="ecg-analysis"
              disabled={isEditing}
              fullWidth
              required
              inputProps={{ style: { textTransform: 'lowercase' } }}
            />
          </Tooltip>

          <TextField
            label="설명 (Description)"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="ECG 신호 분석 및 진단 서비스"
            multiline
            rows={3}
            fullWidth
            required
          />

          {isEditing && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>서비스 ID는 수정할 수 없습니다</li>
                <li>비트 위치는 자동으로 관리됩니다</li>
                <li>활성 상태는 목록에서 토글할 수 있습니다</li>
              </Box>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onCancel} size="large">취소</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="large"
          disabled={isSaveButtonDisabled || loading}
        >
          {isEditing ? '수정' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
