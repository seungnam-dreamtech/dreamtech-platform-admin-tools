// 권한 템플릿 추가/수정 모달

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Divider,
  Chip,
  OutlinedInput,
} from '@mui/material';
import type { AuthorityTemplate, UserType } from '../../types/user-management';
import { USER_TYPES, PLATFORM_ROLES, MOCK_SERVICES } from '../../constants/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface TemplateFormData {
  name: string;
  description: string;
  userType: UserType;
  isDefault: boolean;
  roles: string[];
  permissions: string[];
  serviceScopeIds: string[];
}

interface AuthorityTemplateFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (template: TemplateFormData) => void;
  template?: AuthorityTemplate | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  userType?: string;
  roles?: string;
  permissions?: string;
  serviceScopeIds?: string;
}

export function AuthorityTemplateFormModal({
  open,
  onCancel,
  onSave,
  template,
}: AuthorityTemplateFormModalProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    userType: '' as UserType,
    isDefault: false,
    roles: [],
    permissions: [],
    serviceScopeIds: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [permissionInput, setPermissionInput] = useState('');

  const snackbar = useSnackbar();
  const isEditing = !!template;

  useEffect(() => {
    if (open) {
      setErrors({});

      if (template) {
        setFormData({
          name: template.name || '',
          description: template.description || '',
          userType: template.user_type || ('' as UserType),
          isDefault: template.is_default || false,
          roles: template.roles || [],
          permissions: template.permissions || [],
          serviceScopeIds: template.serviceScopeIds || [],
        });
      } else {
        setFormData({
          name: '',
          description: '',
          userType: '' as UserType,
          isDefault: false,
          roles: [],
          permissions: [],
          serviceScopeIds: [],
        });
      }
      setPermissionInput('');
    }
  }, [open, template]);

  const handleFieldChange = (
    field: keyof TemplateFormData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddPermission = () => {
    const trimmed = permissionInput.trim();
    if (!trimmed) {
      return;
    }

    if (formData.permissions.includes(trimmed)) {
      snackbar.warning('이미 추가된 권한입니다');
      return;
    }

    handleFieldChange('permissions', [...formData.permissions, trimmed]);
    setPermissionInput('');
  };

  const handleRemovePermission = (permissionToRemove: string) => {
    handleFieldChange(
      'permissions',
      formData.permissions.filter((p) => p !== permissionToRemove)
    );
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '템플릿 이름을 입력하세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력하세요';
    }

    if (!formData.userType) {
      newErrors.userType = '사용자 유형을 선택하세요';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = '최소 하나 이상의 역할을 선택하세요';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = '최소 하나 이상의 권한을 입력하세요';
    }

    if (formData.serviceScopeIds.length === 0) {
      newErrors.serviceScopeIds = '최소 하나 이상의 서비스를 선택하세요';
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
      snackbar.error('템플릿 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? '권한 템플릿 수정' : '새 권한 템플릿 추가'}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          템플릿은 User Type 기본 역할(우선순위 90)보다 높고, Individual 권한보다는 낮은 중간
          레벨의 권한을 부여합니다.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 기본 정보 */}
          <TextField
            label="템플릿 이름"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="예: 의료진 기본 권한"
            fullWidth
            required
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="템플릿의 용도와 포함된 권한을 설명하세요"
            multiline
            rows={2}
            fullWidth
            required
          />

          <Divider sx={{ my: 1 }}>대상 및 설정</Divider>

          <FormControl fullWidth required error={!!errors.userType}>
            <InputLabel>사용자 유형 (User Type)</InputLabel>
            <Select
              value={formData.userType}
              onChange={(e) => handleFieldChange('userType', e.target.value)}
              label="사용자 유형 (User Type)"
            >
              {USER_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label} ({type.value})
                </MenuItem>
              ))}
            </Select>
            {errors.userType && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.userType}
              </Box>
            )}
            <Box sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
              이 템플릿을 적용할 사용자 유형을 선택합니다
            </Box>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isDefault}
                onChange={(e) => handleFieldChange('isDefault', e.target.checked)}
              />
            }
            label="기본 템플릿"
          />
          <Box sx={{ fontSize: '12px', color: 'text.secondary', mt: -1 }}>
            User Type별로 하나의 기본 템플릿만 지정할 수 있습니다
          </Box>

          <Divider sx={{ my: 1 }}>권한 설정</Divider>

          <FormControl fullWidth required error={!!errors.roles}>
            <InputLabel>플랫폼 역할</InputLabel>
            <Select
              multiple
              value={formData.roles}
              onChange={(e) => handleFieldChange('roles', e.target.value as string[])}
              input={<OutlinedInput label="플랫폼 역할" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {PLATFORM_ROLES.map((role) => (
                <MenuItem key={role.name} value={role.name}>
                  {role.displayName} ({role.name})
                </MenuItem>
              ))}
            </Select>
            {errors.roles && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.roles}
              </Box>
            )}
            <Box sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
              이 템플릿이 부여할 플랫폼 레벨 역할을 선택합니다
            </Box>
          </FormControl>

          <Box>
            <Box sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
              권한 (Permissions) *
            </Box>
            <Box sx={{ fontSize: '12px', color: 'text.secondary', mb: 1 }}>
              resource:action 형식으로 입력 (예: patient:read, diagnosis:write, *:*)
            </Box>
            <TextField
              placeholder="권한 입력 (Enter로 추가)"
              value={permissionInput}
              onChange={(e) => setPermissionInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPermission();
                }
              }}
              fullWidth
              size="small"
              error={!!errors.permissions}
              helperText={errors.permissions}
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.permissions.map((permission) => (
                <Chip
                  key={permission}
                  label={permission}
                  onDelete={() => handleRemovePermission(permission)}
                  size="small"
                />
              ))}
              {formData.permissions.length === 0 && (
                <Box sx={{ color: 'text.secondary', fontSize: '12px', py: 1 }}>
                  권한이 없습니다. 위 입력란에 입력 후 Enter를 눌러 추가하세요.
                </Box>
              )}
            </Box>
          </Box>

          <FormControl fullWidth required error={!!errors.serviceScopeIds}>
            <InputLabel>서비스 스코프</InputLabel>
            <Select
              multiple
              value={formData.serviceScopeIds}
              onChange={(e) => handleFieldChange('serviceScopeIds', e.target.value as string[])}
              input={<OutlinedInput label="서비스 스코프" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const service = MOCK_SERVICES.find((s) => s.id === value);
                    return (
                      <Chip
                        key={value}
                        label={service ? `${service.icon} ${service.displayName}` : value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {MOCK_SERVICES.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.icon} {service.displayName} ({service.name})
                </MenuItem>
              ))}
            </Select>
            {errors.serviceScopeIds && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.serviceScopeIds}
              </Box>
            )}
            <Box sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
              이 템플릿으로 접근 가능한 서비스를 선택합니다
            </Box>
          </FormControl>
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
