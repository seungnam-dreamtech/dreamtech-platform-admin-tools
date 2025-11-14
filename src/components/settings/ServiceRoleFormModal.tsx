// 서비스 역할 추가/수정 모달

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
  Alert,
  Box,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { Info as InfoIcon, Add as AddIcon } from '@mui/icons-material';
import type { ServiceRoleDefinition, ServiceScope } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import PermissionSelector from './PermissionSelector';

interface ServiceRoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (role: ServiceRoleDefinition) => void;
  role?: ServiceRoleDefinition | null;
  services: ServiceScope[]; // 서비스 선택을 위한 서비스 목록
}

interface FormData {
  service_id: string;
  role_name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  is_system_role: boolean;
}

interface FormErrors {
  service_id?: string;
  role_name?: string;
  display_name?: string;
  description?: string;
}

export function ServiceRoleFormModal({
  open,
  onCancel,
  onSave,
  role,
  services,
}: ServiceRoleFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    service_id: '',
    role_name: '',
    display_name: '',
    description: '',
    is_active: true,
    is_system_role: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activationChanged, setActivationChanged] = useState(false);
  const [newActivationState, setNewActivationState] = useState<boolean | undefined>(undefined);

  // 권한 입력을 위한 상태
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const snackbar = useSnackbar();
  const isEditing = !!role;

  useEffect(() => {
    if (open) {
      // 상태 초기화
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);
      setErrors({});
      setActiveTab(0);

      if (role) {
        setFormData({
          service_id: role.service_id,
          role_name: role.role_name,
          display_name: role.display_name,
          description: role.description,
          is_active: role.is_active,
          is_system_role: role.is_system_role,
        });
        setPermissions(role.permissions || []);
      } else {
        setFormData({
          service_id: '',
          role_name: '',
          display_name: '',
          description: '',
          is_active: true,
          is_system_role: false,
        });
        setPermissions([]);
      }
      setPermissionInput('');
    }
  }, [open, role]);

  const handleFieldChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (!isEditing || (field !== 'is_active' && field !== 'service_id' && field !== 'role_name')) {
      setHasChanges(true);
    }
  };

  // 권한 추가
  const handleAddPermission = () => {
    const trimmed = permissionInput.trim();
    if (!trimmed) {
      return;
    }

    // 권한 형식 검증: resource:action 또는 *:*
    const permissionPattern = /^[a-z*][a-z0-9_*]*:[a-z*][a-z0-9_*:]*$/;
    if (!permissionPattern.test(trimmed)) {
      snackbar.warning('권한 형식이 올바르지 않습니다. (예: analysis:read, data:write)');
      return;
    }

    if (permissions.includes(trimmed)) {
      snackbar.warning('이미 추가된 권한입니다');
      return;
    }

    setPermissions([...permissions, trimmed]);
    setPermissionInput('');
    setHasChanges(true);
  };

  // 권한 제거
  const handleRemovePermission = (permission: string) => {
    setPermissions(permissions.filter((p) => p !== permission));
    setHasChanges(true);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.service_id.trim()) {
      newErrors.service_id = '서비스를 선택하세요';
    }

    if (!formData.role_name.trim()) {
      newErrors.role_name = 'Role Name을 입력하세요';
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(formData.role_name)) {
      newErrors.role_name = '대문자, 숫자, 언더스코어만 사용 가능하며 대문자로 시작해야 합니다';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = '표시명을 입력하세요';
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
      if (isEditing && role) {
        // 수정 모드: 활성 상태와 일반 필드를 별도로 처리
        // 1. 활성 상태가 변경되었으면 별도 API 호출
        if (activationChanged && newActivationState !== undefined) {
          await userManagementService.toggleServiceRoleActivation(
            role.service_id,
            role.role_name,
            newActivationState
          );
          snackbar.success(`역할이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
        }

        // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
        if (hasChanges) {
          await userManagementService.updateServiceRole(role.service_id, role.role_name, {
            display_name: formData.display_name,
            description: formData.description,
            permissions: permissions,
          });
          snackbar.success('역할이 수정되었습니다');
        }

        // 목록 새로고침을 위해 onSave 콜백 호출
        onSave({
          ...role,
          display_name: formData.display_name,
          description: formData.description,
          permissions: permissions,
          is_active: newActivationState !== undefined ? newActivationState : role.is_active,
        });
      } else {
        // 생성 모드: 새로운 역할 생성
        const roleData: ServiceRoleDefinition = {
          service_id: formData.service_id,
          role_name: formData.role_name,
          display_name: formData.display_name,
          description: formData.description,
          permissions: permissions,
          is_system_role: formData.is_system_role,
          is_active: formData.is_active,
          created_at: new Date().toISOString(),
          created_by: 'ADMIN',
        };

        onSave(roleData);
      }

      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);
    } catch (error) {
      snackbar.error('역할 저장에 실패했습니다');
      console.error('Failed to save service role:', error);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges && !activationChanged;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? '서비스 역할 수정' : '새 서비스 역할 추가'}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          특정 서비스에만 적용되는 역할입니다. (Service ID, Role Name) 조합이 고유해야 합니다.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required error={!!errors.service_id}>
              <InputLabel>서비스 ID</InputLabel>
              <Select
                value={formData.service_id}
                onChange={(e) => handleFieldChange('service_id', e.target.value)}
                label="서비스 ID"
                disabled={isEditing}
              >
                {services.map((s) => (
                  <MenuItem key={s.service_id} value={s.service_id}>
                    {s.service_id} ({s.description})
                  </MenuItem>
                ))}
              </Select>
              {errors.service_id && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {errors.service_id}
                </Box>
              )}
            </FormControl>

            <Tooltip title="역할 이름 (예: DOCTOR, TECHNICIAN, ADMIN)">
              <TextField
                label="Role Name"
                value={formData.role_name}
                onChange={(e) => handleFieldChange('role_name', e.target.value.toUpperCase())}
                error={!!errors.role_name}
                helperText={errors.role_name}
                placeholder="DOCTOR"
                disabled={isEditing}
                fullWidth
                required
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Tooltip>
          </Box>

          <TextField
            label="표시명"
            value={formData.display_name}
            onChange={(e) => handleFieldChange('display_name', e.target.value)}
            error={!!errors.display_name}
            helperText={errors.display_name}
            placeholder="의사"
            fullWidth
            required
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="심전도 분석 결과 확인 및 판독 권한"
            multiline
            rows={3}
            fullWidth
            required
          />

          {/* 권한 관리 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Box sx={{ fontSize: '14px', fontWeight: 500 }}>권한 설정</Box>
              <Tooltip title="서비스의 권한을 선택하거나 수동으로 입력할 수 있습니다">
                <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              </Tooltip>
            </Box>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="목록에서 선택" />
              <Tab label="수동 입력" />
            </Tabs>
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <PermissionSelector
                  value={permissions}
                  onChange={(selected) => {
                    setPermissions(selected);
                    setHasChanges(true);
                  }}
                  serviceFilter={formData.service_id}
                />
              )}
              {activeTab === 1 && (
                <Box>
                  <TextField
                    placeholder="권한을 입력하세요 (예: analysis:read)"
                    value={permissionInput}
                    onChange={(e) => setPermissionInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPermission();
                      }
                    }}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={handleAddPermission} size="small">
                          <AddIcon />
                        </IconButton>
                      ),
                    }}
                  />
                  <Box
                    sx={{
                      mt: 1,
                      minHeight: 40,
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'grey.50',
                    }}
                  >
                    {permissions.length === 0 ? (
                      <Box sx={{ color: 'text.secondary', fontSize: '12px' }}>권한이 없습니다</Box>
                    ) : (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {permissions.map((permission) => (
                          <Chip
                            key={permission}
                            label={permission}
                            onDelete={() => handleRemovePermission(permission)}
                            color="primary"
                            size="small"
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {isEditing && (
            <Alert severity="warning">
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>서비스 ID와 Role Name은 수정할 수 없습니다</li>
                <li>활성 상태는 목록에서 토글할 수 있습니다</li>
                {role?.is_system_role && <li>시스템 역할은 삭제할 수 없습니다</li>}
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
