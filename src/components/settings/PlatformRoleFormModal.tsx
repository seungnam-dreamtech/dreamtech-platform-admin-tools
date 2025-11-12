// 플랫폼 역할 추가/수정 모달

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
  IconButton,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import type { PlatformRole } from '../../types/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface PlatformRoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (role: Partial<PlatformRole>) => void;
  role?: PlatformRole | null;
}

interface FormData {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

interface FormErrors {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string;
}

export function PlatformRoleFormModal({ open, onCancel, onSave, role }: PlatformRoleFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
    isSystem: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [permissionInput, setPermissionInput] = useState('');

  const snackbar = useSnackbar();
  const isEditing = !!role;
  const isSystemRole = role?.isSystem;

  useEffect(() => {
    if (open) {
      setErrors({});

      if (role) {
        setFormData({
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          permissions: role.permissions || [],
          isSystem: role.isSystem ?? false,
        });
      } else {
        setFormData({
          name: '',
          displayName: '',
          description: '',
          permissions: [],
          isSystem: false,
        });
      }
      setPermissionInput('');
    }
  }, [open, role]);

  const handleFieldChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddPermission = () => {
    const trimmed = permissionInput.trim();
    if (!trimmed) {
      return;
    }

    // 권한 형식 검증
    if (!/^[a-z*:]+$/.test(trimmed)) {
      snackbar.warning('소문자, 콜론, 별표만 사용 가능합니다');
      return;
    }

    if (formData.permissions.includes(trimmed)) {
      snackbar.warning('이미 추가된 권한입니다');
      return;
    }

    handleFieldChange('permissions', [...formData.permissions, trimmed]);
    setPermissionInput('');
  };

  const handleRemovePermission = (index: number) => {
    const newPermissions = formData.permissions.filter((_, i) => i !== index);
    handleFieldChange('permissions', newPermissions);
  };

  const handleUpdatePermission = (index: number, value: string) => {
    const newPermissions = [...formData.permissions];
    newPermissions[index] = value;
    handleFieldChange('permissions', newPermissions);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '역할 이름을 입력하세요';
    } else if (!/^[A-Z_]+$/.test(formData.name)) {
      newErrors.name = '대문자와 언더스코어만 사용 가능합니다';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = '표시명을 입력하세요';
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
      onSave(formData);
      onCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
      snackbar.error('역할 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? '플랫폼 역할 수정' : '새 플랫폼 역할 추가'}</DialogTitle>
      <DialogContent>
        {isSystemRole && (
          <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
            시스템 역할은 역할 이름(name)을 수정할 수 없으며, 삭제가 제한됩니다.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: isSystemRole ? 0 : 2 }}>
          <TextField
            label="역할 이름 (Name)"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value.toUpperCase())}
            error={!!errors.name}
            helperText={errors.name || '역할을 식별하는 고유 이름 (예: PLATFORM_ADMIN, DEVELOPER)'}
            placeholder="PLATFORM_ADMIN"
            disabled={isEditing && isSystemRole}
            fullWidth
            required
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />

          <TextField
            label="표시명 (Display Name)"
            value={formData.displayName}
            onChange={(e) => handleFieldChange('displayName', e.target.value)}
            error={!!errors.displayName}
            helperText={errors.displayName}
            placeholder="플랫폼 관리자"
            fullWidth
            required
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="플랫폼 전체에 대한 최고 관리 권한"
            multiline
            rows={3}
            fullWidth
            required
          />

          <Box>
            <Box sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
              권한 (Permissions)
            </Box>
            <Box sx={{ fontSize: '12px', color: 'text.secondary', mb: 1 }}>
              이 역할이 가지는 권한 목록을 정의합니다
            </Box>

            {/* 권한 추가 입력 */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                placeholder="user:read 또는 *:* (전체 권한)"
                value={permissionInput}
                onChange={(e) => setPermissionInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPermission();
                  }
                }}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddPermission}
                startIcon={<AddIcon />}
              >
                추가
              </Button>
            </Stack>

            {/* 권한 목록 */}
            <Stack spacing={1}>
              {formData.permissions.map((permission, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <TextField
                    value={permission}
                    onChange={(e) => handleUpdatePermission(index, e.target.value)}
                    size="small"
                    fullWidth
                    error={!!(permission && !/^[a-z*:]+$/.test(permission))}
                    helperText={
                      permission && !/^[a-z*:]+$/.test(permission)
                        ? '소문자, 콜론, 별표만 사용 가능'
                        : undefined
                    }
                  />
                  <IconButton
                    onClick={() => handleRemovePermission(index)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Stack>
              ))}
              {formData.permissions.length === 0 && (
                <Box sx={{ color: 'text.secondary', fontSize: '12px', py: 1 }}>
                  권한이 없습니다. 위 입력란에서 권한을 추가하세요.
                </Box>
              )}
            </Stack>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isSystem}
                onChange={(e) => handleFieldChange('isSystem', e.target.checked)}
                disabled={isEditing && isSystemRole}
              />
            }
            label="시스템 역할"
          />
          <Box sx={{ fontSize: '12px', color: 'text.secondary', mt: -1 }}>
            시스템 역할은 삭제가 제한되며, User Type 기반 기본 역할로 사용됩니다
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>취소</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {isEditing ? '수정' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
