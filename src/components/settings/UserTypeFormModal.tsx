// 사용자 유형 추가/수정 모달

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Tooltip,
} from '@mui/material';
import type { UserTypeDefinition } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface UserTypeFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (userType: UserTypeDefinition) => void;
  userType?: UserTypeDefinition | null;
}

interface FormData {
  type_id: string;
  display_name: string;
  description: string;
  display_order: number;
  is_active: boolean;
  is_system_type: boolean;
}

export function UserTypeFormModal({ open, onCancel, onSave, userType }: UserTypeFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    type_id: '',
    display_name: '',
    description: '',
    display_order: 50,
    is_active: true,
    is_system_type: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activationChanged, setActivationChanged] = useState(false);
  const [newActivationState, setNewActivationState] = useState<boolean | undefined>(undefined);
  const snackbar = useSnackbar();

  const isEditing = !!userType;

  useEffect(() => {
    if (open) {
      // 상태 초기화
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);
      setErrors({});

      if (userType) {
        setFormData({
          type_id: userType.type_id,
          display_name: userType.display_name,
          description: userType.description,
          display_order: userType.display_order,
          is_active: userType.is_active,
          is_system_type: userType.is_system_type,
        });
      } else {
        setFormData({
          type_id: '',
          display_name: '',
          description: '',
          display_order: 50,
          is_active: true,
          is_system_type: false,
        });
      }
    }
  }, [open, userType]);

  const handleFieldChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (!isEditing) {
      setHasChanges(true);
    } else if (field !== 'is_active') {
      setHasChanges(true);
    }
  };

  const handleActivationChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));

    if (isEditing && userType && checked !== userType.is_active) {
      setActivationChanged(true);
      setNewActivationState(checked);
    } else {
      setActivationChanged(false);
      setNewActivationState(undefined);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.type_id.trim()) {
      newErrors.type_id = '유형 ID를 입력하세요';
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(formData.type_id)) {
      newErrors.type_id = '대문자와 숫자, 언더스코어만 사용 가능하며 대문자로 시작해야 합니다';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = '표시명을 입력하세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력하세요';
    }

    if (formData.display_order < 1 || formData.display_order > 999) {
      newErrors.display_order = '표시 순서는 1~999 사이여야 합니다';
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
      if (isEditing && userType) {
        // 수정 모드: 활성 상태와 일반 필드를 별도로 처리
        // 1. 활성 상태가 변경되었으면 별도 API 호출
        if (activationChanged && newActivationState !== undefined) {
          await userManagementService.toggleUserTypeActivation(userType.type_id, newActivationState);
          snackbar.success(`사용자 유형이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
        }

        // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
        if (hasChanges) {
          await userManagementService.updateUserTypeDefinition(userType.type_id, {
            display_name: formData.display_name,
            description: formData.description,
            display_order: formData.display_order,
            // is_active는 제외!
          });
          snackbar.success('사용자 유형이 수정되었습니다');
        }

        // 목록 새로고침을 위해 onSave 콜백 호출
        onSave({
          ...userType,
          display_name: formData.display_name,
          description: formData.description,
          display_order: formData.display_order,
          is_active: newActivationState !== undefined ? newActivationState : userType.is_active,
        });
      } else {
        // 생성 모드
        const userTypeData: UserTypeDefinition = {
          type_id: formData.type_id,
          display_name: formData.display_name,
          description: formData.description,
          display_order: formData.display_order,
          is_active: formData.is_active,
          is_system_type: formData.is_system_type,
          default_template_names: [],
          created_at: new Date().toISOString(),
          created_by: 'ADMIN',
        };

        onSave(userTypeData);
      }

      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);
    } catch (error) {
      snackbar.error('사용자 유형 저장에 실패했습니다');
      console.error('Failed to save user type:', error);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges && !activationChanged;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? '사용자 유형 수정' : '새 사용자 유형 추가'}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          사용자 유형은 AuthX 권한 시스템에서 사용자를 분류하고 기본 역할을 부여하는 데 사용됩니다.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tooltip title="시스템에서 사용하는 고유 식별자 (예: EAL_DOCTOR, ADMIN)" placement="top">
            <TextField
              label="유형 ID (Type ID)"
              value={formData.type_id}
              onChange={(e) => handleFieldChange('type_id', e.target.value.toUpperCase())}
              error={!!errors.type_id}
              helperText={errors.type_id}
              placeholder="EAL_DOCTOR"
              disabled={isEditing}
              fullWidth
              required
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Tooltip>

          <TextField
            label="표시명 (Display Name)"
            value={formData.display_name}
            onChange={(e) => handleFieldChange('display_name', e.target.value)}
            error={!!errors.display_name}
            helperText={errors.display_name}
            placeholder="ECG Assist Lite 서비스 소속 의사"
            fullWidth
            required
          />

          <TextField
            label="설명 (Description)"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="ECG Assist Lite 서비스의 의사"
            multiline
            rows={3}
            fullWidth
            required
          />

          <Tooltip title="낮은 숫자일수록 먼저 표시됩니다" placement="top">
            <TextField
              label="표시 순서 (Display Order)"
              type="number"
              value={formData.display_order}
              onChange={(e) => handleFieldChange('display_order', parseInt(e.target.value) || 0)}
              error={!!errors.display_order}
              helperText={errors.display_order}
              placeholder="50"
              inputProps={{ min: 1, max: 999 }}
              sx={{ width: 200 }}
              required
            />
          </Tooltip>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleActivationChange(e.target.checked)}
                  disabled={!isEditing || (isEditing && userType?.is_system_type)}
                />
              }
              label="활성 상태"
            />

            {!isEditing && (
              <Tooltip title="시스템 타입은 삭제할 수 없습니다" placement="top">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_system_type}
                      onChange={(e) => handleFieldChange('is_system_type', e.target.checked)}
                    />
                  }
                  label="시스템 타입"
                />
              </Tooltip>
            )}
          </Box>

          {isEditing && userType?.is_system_type && (
            <Alert severity="warning">
              이 사용자 유형은 시스템 타입으로 삭제할 수 없습니다.
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
