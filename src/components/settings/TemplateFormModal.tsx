// Permission Template 추가/수정 모달
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Chip,
  OutlinedInput,
  Tooltip,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import type {
  PermissionTemplate,
  TemplateCreateRequest,
  TemplateUpdateRequest,
  GlobalRole,
  ServiceRoleDefinition,
} from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface TemplateFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (templateData: TemplateCreateRequest | TemplateUpdateRequest) => void;
  template?: PermissionTemplate | null;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  global_role_ids: string[];
  service_role_ids: string[];
}

interface FormErrors {
  name?: string;
}

export default function TemplateFormModal({
  open,
  onCancel,
  onSave,
  template,
}: TemplateFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    global_role_ids: [],
    service_role_ids: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activationChanged, setActivationChanged] = useState(false);
  const [newActivationState, setNewActivationState] = useState<boolean | undefined>(undefined);

  // 선택 가능한 데이터
  const [globalRoles, setGlobalRoles] = useState<GlobalRole[]>([]);
  const [serviceRoles, setServiceRoles] = useState<ServiceRoleDefinition[]>([]);

  const snackbar = useSnackbar();
  const isEditing = !!template;

  // 데이터 로드
  useEffect(() => {
    if (open) {
      loadGlobalRoles();
      loadServiceRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);
      setErrors({});

      if (template) {
        // 수정 모드: 기존 템플릿 데이터 로드
        // global_roles와 service_roles는 객체 배열이므로 ID만 추출
        const globalRoleIds = template.global_roles.map((r) => r.role_id);
        const serviceRoleIds = template.service_roles.map(
          (r) => `${r.service_id}:${r.role_name}`
        );

        setFormData({
          name: template.name,
          description: template.description || '',
          category: template.category || '',
          global_role_ids: globalRoleIds,
          service_role_ids: serviceRoleIds,
        });
      } else {
        // 생성 모드: 폼 초기화
        setFormData({
          name: '',
          description: '',
          category: '',
          global_role_ids: [],
          service_role_ids: [],
        });
      }
    }
  }, [open, template]);

  const loadGlobalRoles = async () => {
    try {
      const data = await userManagementService.getGlobalRoles();
      setGlobalRoles(data.filter((r) => r.is_active));
    } catch (error) {
      console.error('Failed to load global roles:', error);
      snackbar.error('글로벌 역할 목록을 불러오는데 실패했습니다');
    }
  };

  const loadServiceRoles = async () => {
    try {
      const data = await userManagementService.getServiceRoles();
      setServiceRoles(data.filter((r) => r.is_active));
    } catch (error) {
      console.error('Failed to load service roles:', error);
      snackbar.error('서비스 역할 목록을 불러오는데 실패했습니다');
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    // is_active 제외한 필드만 체크
    if (!isEditing || field !== 'name') {
      setHasChanges(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '템플릿 이름을 입력하세요';
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
      if (isEditing && template) {
        // 수정 모드: 활성 상태와 일반 필드를 별도로 처리
        // 1. 활성 상태가 변경되었으면 별도 API 호출
        if (activationChanged && newActivationState !== undefined) {
          await userManagementService.togglePermissionTemplateActivation(
            template.id,
            newActivationState
          );
          snackbar.success(`템플릿이 ${newActivationState ? '활성화' : '비활성화'}되었습니다`);
        }

        // 2. 다른 필드가 변경되었으면 PUT API 호출 (is_active 제외)
        if (hasChanges) {
          const updateData: TemplateUpdateRequest = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            global_role_ids: formData.global_role_ids,
            service_role_ids: formData.service_role_ids,
          };

          await userManagementService.updatePermissionTemplate(template.id, updateData);
          snackbar.success('템플릿이 수정되었습니다');
        }

        // 목록 새로고침을 위해 onSave 콜백 호출
        onSave(formData);
      } else {
        // 생성 모드: 새로운 템플릿 생성
        const createData: TemplateCreateRequest = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          global_role_ids: formData.global_role_ids,
          service_role_ids: formData.service_role_ids,
        };

        onSave(createData);
      }

      setHasChanges(false);
      setActivationChanged(false);
      setNewActivationState(undefined);
    } catch (error) {
      console.error('Form validation failed:', error);
      snackbar.error('템플릿 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setHasChanges(false);
    setActivationChanged(false);
    setNewActivationState(undefined);
    onCancel();
  };

  // 저장 버튼 비활성화 조건
  const isSaveButtonDisabled = isEditing && !hasChanges && !activationChanged;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Permission Template 수정' : '새 Permission Template 추가'}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          권한 템플릿은 글로벌 역할과 서비스 역할의 조합으로 구성됩니다. 카테고리별로 그룹화하여
          관리할 수 있습니다.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 기본 정보 */}
          <TextField
            label="템플릿 이름"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="예: 의사 기본 권한 세트"
            fullWidth
            required
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="템플릿에 대한 설명을 입력하세요 (선택사항)"
            multiline
            rows={2}
            fullWidth
            inputProps={{ maxLength: 500 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              label="카테고리"
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              placeholder="예: 의료진"
              fullWidth
              inputProps={{ maxLength: 50 }}
            />
            <Tooltip title="템플릿을 그룹화할 카테고리를 입력하세요 (예: 의료진, 관리자, 기술지원)">
              <InfoIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Tooltip>
          </Box>

          {/* 글로벌 역할 선택 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Box sx={{ fontSize: '14px', fontWeight: 500 }}>글로벌 역할 (Global Roles)</Box>
              <Tooltip title="플랫폼 전체에 적용되는 역할을 선택하세요">
                <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>글로벌 역할 선택 (선택사항)</InputLabel>
              <Select
                multiple
                value={formData.global_role_ids}
                onChange={(e) => handleFieldChange('global_role_ids', e.target.value as string[])}
                input={<OutlinedInput label="글로벌 역할 선택 (선택사항)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const role = globalRoles.find((r) => r.role_id === roleId);
                      return (
                        <Chip
                          key={roleId}
                          label={role ? `${role.role_id} - ${role.display_name}` : roleId}
                          size="small"
                          color="secondary"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {globalRoles.map((role) => (
                  <MenuItem key={role.role_id} value={role.role_id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={role.role_id} size="small" color="secondary" />
                      <span>{role.display_name}</span>
                      {role.is_system_role && (
                        <Chip label="SYSTEM" size="small" color="error" />
                      )}
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        (Level {role.authority_level})
                      </span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 서비스 역할 선택 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Box sx={{ fontSize: '14px', fontWeight: 500 }}>서비스 역할 (Service Roles)</Box>
              <Tooltip title="특정 서비스에 적용되는 역할을 선택하세요">
                <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>서비스 역할 선택 (선택사항)</InputLabel>
              <Select
                multiple
                value={formData.service_role_ids}
                onChange={(e) =>
                  handleFieldChange('service_role_ids', e.target.value as string[])
                }
                input={<OutlinedInput label="서비스 역할 선택 (선택사항)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const [serviceId, roleName] = roleId.split(':');
                      return (
                        <Chip key={roleId} label={`${serviceId}:${roleName}`} size="small" color="primary" />
                      );
                    })}
                  </Box>
                )}
              >
                {serviceRoles.map((role) => {
                  const roleValue = `${role.service_id}:${role.role_name}`;
                  return (
                    <MenuItem key={roleValue} value={roleValue}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={role.service_id} size="small" color="info" />
                        <Chip label={role.role_name} size="small" color="primary" />
                        <span style={{ fontSize: '12px' }}>{role.display_name}</span>
                        {role.is_system_role && (
                          <Chip label="SYSTEM" size="small" color="error" />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>

          {/* 안내 메시지 */}
          {isEditing ? (
            <Alert severity="warning">
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>활성 상태는 목록에서 토글할 수 있습니다</li>
                <li>템플릿은 언제든지 수정 가능합니다</li>
              </Box>
            </Alert>
          ) : (
            <Alert severity="info">
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>글로벌 역할: 플랫폼 전체에 적용되는 권한</li>
                <li>서비스 역할: 특정 서비스에만 적용되는 권한</li>
                <li>최소 하나 이상의 역할을 선택하는 것을 권장합니다</li>
                <li>서비스 역할 형식: "서비스ID:역할명" (예: ecg-analysis:DOCTOR)</li>
              </Box>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>취소</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaveButtonDisabled || loading}
        >
          {isEditing ? '수정' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
