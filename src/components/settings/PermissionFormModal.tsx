// 권한 정의 추가/수정 모달
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
} from '@mui/material';
import type { PermissionDefinition, ServiceScope, Code } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface PermissionFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (permission: PermissionDefinition) => void;
  permission?: PermissionDefinition | null;
}

interface FormData {
  service_id: string;
  resource: string;
  action: string;
  display_name: string;
  description: string;
  category: string;
}

interface FormErrors {
  service_id?: string;
  resource?: string;
  action?: string;
  display_name?: string;
  description?: string;
  category?: string;
}

export default function PermissionFormModal({
  open,
  onCancel,
  onSave,
  permission,
}: PermissionFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    service_id: '',
    resource: '',
    action: '',
    display_name: '',
    description: '',
    category: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [categories, setCategories] = useState<Code[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const snackbar = useSnackbar();
  const isEditing = !!permission;

  // 서비스 목록 및 카테고리 목록 로드
  useEffect(() => {
    if (open) {
      loadServices();
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      setHasChanges(false);
      setErrors({});

      if (permission) {
        // 수정 모드: 기존 권한 데이터 로드
        setFormData({
          service_id: permission.service_id,
          resource: permission.resource,
          action: permission.action,
          display_name: permission.display_name,
          description: permission.description,
          category: permission.category,
        });
      } else {
        // 생성 모드: 폼 초기화
        setFormData({
          service_id: '',
          resource: '',
          action: '',
          display_name: '',
          description: '',
          category: '',
        });
      }
    }
  }, [open, permission]);

  const loadServices = async () => {
    try {
      const data = await userManagementService.getServiceScopes();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
      snackbar.error('서비스 목록을 불러오는데 실패했습니다');
    }
  };

  const loadCategories = async () => {
    try {
      const data = await userManagementService.getCodesByGroup('PERMISSIONS_CATEGORY', true);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      snackbar.error('카테고리 목록을 불러오는데 실패했습니다');
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    // 수정 모드에서 수정 가능한 필드만 체크
    if (!isEditing || field === 'display_name' || field === 'description' || field === 'category') {
      setHasChanges(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.service_id.trim()) {
      newErrors.service_id = '서비스를 선택해주세요';
    }

    if (!formData.resource.trim()) {
      newErrors.resource = '리소스를 입력해주세요';
    } else if (!/^[a-z*][a-z0-9_*]*$/.test(formData.resource)) {
      newErrors.resource = '소문자, 숫자, 언더스코어, *만 사용 가능합니다';
    }

    if (!formData.action.trim()) {
      newErrors.action = '액션을 입력해주세요';
    } else if (!/^[a-z*][a-z0-9_*:]*$/.test(formData.action)) {
      newErrors.action = '소문자, 숫자, 언더스코어, :, *만 사용 가능합니다';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = '표시명을 입력해주세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요';
    }

    if (!formData.category.trim()) {
      newErrors.category = '카테고리를 선택해주세요';
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
      if (isEditing && permission) {
        // permission_key 생성 (모두 소문자로 변환)
        const generatedKey = `${permission.service_id}:${permission.resource}:${permission.action}`.toLowerCase();

        // 디버깅 로그
        console.log('Permission Update Debug:', {
          original_permission_key: permission.permission_key,
          service_id: permission.service_id,
          resource: permission.resource,
          action: permission.action,
          generated_key: generatedKey,
        });

        // 수정 모드: API 요구사항에 따라 전체 필드 전송
        const updateData = {
          permission_key: generatedKey,
          display_name: formData.display_name,
          description: formData.description,
          service_id: permission.service_id,
          resource: permission.resource,
          action: permission.action,
          category: formData.category,
        };

        console.log('Update Request Data:', updateData);

        const updated = await userManagementService.updatePermission(permission.id, updateData);

        snackbar.success('권한이 수정되었습니다');
        onSave(updated);
      } else {
        // 생성 모드: 모든 필드 전송
        const createData = {
          service_id: formData.service_id,
          resource: formData.resource,
          action: formData.action,
          display_name: formData.display_name,
          description: formData.description,
          category: formData.category,
        };

        const created = await userManagementService.createPermission(createData);
        snackbar.success('권한이 생성되었습니다');
        onSave(created);
      }

      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to save permission:', error);
      snackbar.error(error?.message || '권한 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setHasChanges(false);
    onCancel();
  };

  // 저장 버튼 비활성화 조건: 수정 모드에서 변경사항 없을 때
  const isSaveButtonDisabled = isEditing && !hasChanges;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? '권한 수정' : '권한 추가'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* 서비스 ID */}
          <FormControl fullWidth required error={!!errors.service_id}>
            <InputLabel>서비스</InputLabel>
            <Select
              value={formData.service_id}
              onChange={(e) => handleFieldChange('service_id', e.target.value)}
              label="서비스"
              disabled={isEditing}
            >
              {services.map((service) => (
                <MenuItem key={service.service_id} value={service.service_id}>
                  {service.service_name} ({service.service_id})
                </MenuItem>
              ))}
            </Select>
            {errors.service_id && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.service_id}
              </Box>
            )}
            <Box sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
              권한이 속한 서비스를 선택합니다
            </Box>
          </FormControl>

          {/* Resource */}
          <TextField
            label="리소스 (Resource)"
            value={formData.resource}
            onChange={(e) => handleFieldChange('resource', e.target.value.toLowerCase())}
            error={!!errors.resource}
            helperText={
              errors.resource ||
              '권한이 적용되는 리소스 (예: user, hospital, report). *는 모든 리소스를 의미합니다'
            }
            placeholder="예: user, hospital, *"
            disabled={isEditing}
            fullWidth
            required
            inputProps={{ maxLength: 50, style: { textTransform: 'lowercase' } }}
          />

          {/* Action */}
          <TextField
            label="액션 (Action)"
            value={formData.action}
            onChange={(e) => handleFieldChange('action', e.target.value.toLowerCase())}
            error={!!errors.action}
            helperText={
              errors.action ||
              '수행할 작업 (예: read, write, manage, *). *는 모든 액션을 의미합니다'
            }
            placeholder="예: read, write, manage, *"
            disabled={isEditing}
            fullWidth
            required
            inputProps={{ maxLength: 50, style: { textTransform: 'lowercase' } }}
          />

          {/* 표시명 */}
          <TextField
            label="표시명"
            value={formData.display_name}
            onChange={(e) => handleFieldChange('display_name', e.target.value)}
            error={!!errors.display_name}
            helperText={errors.display_name || '사용자에게 보여질 권한 이름'}
            placeholder="예: 사용자 관리 권한"
            fullWidth
            required
            inputProps={{ maxLength: 100 }}
          />

          {/* 설명 */}
          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || '권한에 대한 자세한 설명'}
            placeholder="이 권한의 역할과 범위를 설명해주세요"
            multiline
            rows={3}
            fullWidth
            required
            inputProps={{ maxLength: 500 }}
          />

          {/* 카테고리 */}
          <FormControl fullWidth required error={!!errors.category}>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              label="카테고리"
            >
              {categories.map((category) => (
                <MenuItem key={category.code_id} value={category.code_value}>
                  {category.code_name}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.category}
              </Box>
            )}
            <Box sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
              권한을 그룹화할 카테고리를 선택합니다
            </Box>
          </FormControl>

          {/* 안내 메시지 */}
          {isEditing ? (
            <Alert severity="info">
              <strong>참고:</strong> 서비스, 리소스, 액션은 수정할 수 없습니다. 표시명, 설명,
              카테고리만 수정 가능합니다.
            </Alert>
          ) : (
            <Alert severity="info">
              <strong>권한 문자열 형식:</strong> <code>resource:action</code>
              <br />
              입력한 리소스와 액션이 결합되어 권한 문자열이 생성됩니다.
              <br />
              예: resource="user", action="manage" → "user:manage"
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleCancel} size="large">취소</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="large"
          disabled={isSaveButtonDisabled || loading}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
