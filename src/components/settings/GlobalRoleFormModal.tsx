// 글로벌 역할 추가/수정 모달

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
  Box,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { Info as InfoIcon, Add as AddIcon } from '@mui/icons-material';
import type { GlobalRole } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import PermissionSelector from './PermissionSelector';

interface GlobalRoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (role: GlobalRole) => void;
  role?: GlobalRole | null;
  existingRoles: GlobalRole[]; // 부모 역할 선택을 위한 기존 역할 목록
}

interface FormData {
  role_id: string;
  display_name: string;
  description: string;
  authority_level: number;
  parent_role_id: string;
  is_active: boolean;
  is_system_role: boolean;
}

interface FormErrors {
  role_id?: string;
  display_name?: string;
  description?: string;
  authority_level?: string;
}

export function GlobalRoleFormModal({
  open,
  onCancel,
  onSave,
  role,
  existingRoles,
}: GlobalRoleFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    role_id: '',
    display_name: '',
    description: '',
    authority_level: 50,
    parent_role_id: '',
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
          role_id: role.role_id ?? '',
          display_name: role.display_name ?? '',
          description: role.description ?? '',
          authority_level: role.authority_level ?? 50,
          parent_role_id: role.parent_role_id ?? '',
          is_active: role.is_active ?? true,
          is_system_role: role.is_system_role ?? false,
        });
        setPermissions(role.permissions || []);
      } else {
        setFormData({
          role_id: '',
          display_name: '',
          description: '',
          authority_level: 50,
          parent_role_id: '',
          is_active: true,
          is_system_role: false,
        });
        setPermissions([]);
      }
      setPermissionInput('');
    }
  }, [open, role]);

  const handleFieldChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (!isEditing) {
      setHasChanges(true);
    } else if (field !== 'is_active') {
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
      snackbar.warning('권한 형식이 올바르지 않습니다. (예: user:manage, *:*)');
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

    if (!formData.role_id.trim()) {
      newErrors.role_id = 'Role ID를 입력하세요';
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(formData.role_id)) {
      newErrors.role_id = '대문자, 숫자, 언더스코어만 사용 가능';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = '표시명을 입력하세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력하세요';
    }

    if (formData.authority_level < 1 || formData.authority_level > 100) {
      newErrors.authority_level = '1-100 범위로 입력하세요';
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
          await userManagementService.toggleGlobalRoleActivation(role.role_id, newActivationState);
          snackbar.success(`역할이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
        }

        // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
        if (hasChanges) {
          await userManagementService.updateGlobalRole(role.role_id, {
            display_name: formData.display_name,
            description: formData.description,
            authority_level: formData.authority_level,
            parent_role_id: formData.parent_role_id || undefined,
            permissions: permissions,
          });
          snackbar.success('역할이 수정되었습니다');
        }

        // 목록 새로고침을 위해 onSave 콜백 호출
        onSave({
          ...role,
          display_name: formData.display_name,
          description: formData.description,
          authority_level: formData.authority_level,
          parent_role_id: formData.parent_role_id || undefined,
          permissions: permissions,
          is_active: newActivationState !== undefined ? newActivationState : role.is_active,
        });
      } else {
        // 생성 모드: 새로운 역할 생성
        const roleData: GlobalRole = {
          role_id: formData.role_id,
          display_name: formData.display_name,
          description: formData.description,
          authority_level: formData.authority_level,
          parent_role_id: formData.parent_role_id || undefined,
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
      console.error('Failed to save global role:', error);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges && !activationChanged;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? '글로벌 역할 수정' : '새 글로벌 역할 추가'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* 기본 정보 - 2단 레이아웃 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip
              title={
                <Box>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>시스템 고유 식별자</Box>
                  <Box>• 대문자로 시작 (A-Z)</Box>
                  <Box>• 대문자, 숫자, 언더스코어(_)만 사용</Box>
                  <Box>• 예: HOSPITAL_ADMIN, PLATFORM_USER</Box>
                  {isEditing && (
                    <Box sx={{ mt: 0.5, color: 'warning.main', fontWeight: 500 }}>
                      ⚠️ 수정 불가 항목
                    </Box>
                  )}
                </Box>
              }
            >
              <TextField
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Role ID
                    <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  </Box>
                }
                value={formData.role_id}
                onChange={(e) => handleFieldChange('role_id', e.target.value.toUpperCase())}
                error={!!errors.role_id}
                helperText={errors.role_id}
                placeholder="HOSPITAL_ADMIN"
                disabled={isEditing}
                fullWidth
                required
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Tooltip>

            <Tooltip
              title={
                <Box>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>사용자 친화적 이름</Box>
                  <Box>UI에 표시되는 역할의 한글명</Box>
                  <Box sx={{ mt: 0.5 }}>예: 병원 관리자, 플랫폼 사용자</Box>
                </Box>
              }
            >
              <TextField
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    표시명
                    <InfoIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  </Box>
                }
                value={formData.display_name}
                onChange={(e) => handleFieldChange('display_name', e.target.value)}
                error={!!errors.display_name}
                helperText={errors.display_name}
                placeholder="병원 관리자"
                fullWidth
                required
              />
            </Tooltip>
          </Box>

          {/* 권한 레벨 & 부모 역할 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip
              title={
                <Box>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>권한 우선순위 (1-100)</Box>
                  <Box>• 낮을수록 높은 권한 (1 = 최고 권한)</Box>
                  <Box>• 1-10: 시스템 관리자급</Box>
                  <Box>• 11-50: 중급 관리자</Box>
                  <Box>• 51-100: 일반 사용자</Box>
                </Box>
              }
            >
              <TextField
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    권한 레벨
                    <InfoIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  </Box>
                }
                type="number"
                value={formData.authority_level}
                onChange={(e) => handleFieldChange('authority_level', parseInt(e.target.value) || 0)}
                error={!!errors.authority_level}
                helperText={errors.authority_level}
                placeholder="50"
                inputProps={{ min: 1, max: 100 }}
                fullWidth
                required
              />
            </Tooltip>

            <Tooltip
              title={
                <Box>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>권한 상속 (선택사항)</Box>
                  <Box>상위 역할의 모든 권한을 자동으로 상속받습니다</Box>
                  <Box sx={{ mt: 0.5 }}>
                    예: SERVICE_ADMIN을 부모로 선택하면
                    <br />
                    해당 역할의 모든 권한을 포함하게 됩니다
                  </Box>
                </Box>
              }
            >
              <FormControl fullWidth>
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    부모 역할
                    <InfoIcon sx={{ fontSize: 16, color: 'info.main' }} />
                  </Box>
                </InputLabel>
                <Select
                  value={formData.parent_role_id}
                  onChange={(e) => handleFieldChange('parent_role_id', e.target.value)}
                  label="부모 역할"
                >
                  <MenuItem value="">
                    <em>없음</em>
                  </MenuItem>
                  {existingRoles
                    .filter((r) => r.role_id !== role?.role_id)
                    .map((r) => (
                      <MenuItem key={r.role_id} value={r.role_id}>
                        {r.role_id} (Level {r.authority_level})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Tooltip>
          </Box>

          {/* 설명 - 전체 너비 */}
          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="역할에 대한 설명을 입력하세요"
            multiline
            rows={2}
            fullWidth
            required
          />

          {/* 권한 관리 - Tabs로 수동 입력과 목록 선택 분리 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Box sx={{ fontSize: '14px', fontWeight: 500 }}>권한 설정</Box>
              <Tooltip
                title={
                  <Box>
                    <Box sx={{ fontWeight: 600, mb: 0.5 }}>두 가지 방식 지원</Box>
                    <Box>• 목록에서 선택: 정의된 권한을 트리 구조로 선택</Box>
                    <Box>• 수동 입력: 권한 문자열을 직접 입력</Box>
                  </Box>
                }
              >
                <InfoIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
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
                />
              )}
              {activeTab === 1 && (
                <Box>
                  <TextField
                    placeholder="권한을 입력하세요 (예: user:manage)"
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
                      minHeight: 60,
                      maxHeight: 120,
                      overflowY: 'auto',
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'grey.50',
                    }}
                  >
                    {permissions.length === 0 ? (
                      <Box sx={{ color: 'text.secondary', fontSize: '11px' }}>권한이 없습니다</Box>
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
