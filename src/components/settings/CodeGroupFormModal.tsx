import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import type { CodeGroup } from '../../types/user-management';

interface CodeGroupFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: CodeGroup) => Promise<void>;
  codeGroup: CodeGroup | null;
}

/**
 * 코드 그룹 생성/수정 모달
 */
export default function CodeGroupFormModal({
  open,
  onClose,
  onSave,
  codeGroup,
}: CodeGroupFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    group_id: '',
    group_name: '',
    description: '',
    display_order: 1,
    is_system_managed: false,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!codeGroup;

  useEffect(() => {
    if (open) {
      if (codeGroup) {
        // 수정 모드
        setFormData({
          group_id: codeGroup.group_id,
          group_name: codeGroup.group_name,
          description: codeGroup.description || '',
          display_order: codeGroup.display_order,
          is_system_managed: codeGroup.is_system_managed,
          is_active: codeGroup.is_active,
        });
      } else {
        // 생성 모드
        setFormData({
          group_id: '',
          group_name: '',
          description: '',
          display_order: 1,
          is_system_managed: false,
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [open, codeGroup]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.group_id.trim()) {
      newErrors.group_id = '그룹 ID를 입력하세요';
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(formData.group_id)) {
      newErrors.group_id = '대문자, 숫자, 언더스코어만 사용 가능합니다';
    }

    if (!formData.group_name.trim()) {
      newErrors.group_name = '그룹명을 입력하세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData as CodeGroup);
      onClose();
    } catch (error) {
      console.error('❌ 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? '코드 그룹 수정' : '코드 그룹 생성'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="그룹 ID"
            value={formData.group_id}
            onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
            error={!!errors.group_id}
            helperText={errors.group_id || '대문자로 시작하며, 대문자, 숫자, 언더스코어만 사용 가능'}
            disabled={isEditing}
            required
            fullWidth
            inputProps={{ maxLength: 50 }}
            placeholder="TEMPLATE_CATEGORY"
          />

          <TextField
            label="그룹명"
            value={formData.group_name}
            onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
            error={!!errors.group_name}
            helperText={errors.group_name}
            required
            fullWidth
            inputProps={{ maxLength: 100 }}
            placeholder="권한 템플릿 카테고리"
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
            inputProps={{ maxLength: 500 }}
            placeholder="PermissionTemplate의 category 값"
          />

          <TextField
            label="표시 순서"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
            helperText="낮은 숫자가 먼저 표시됩니다"
            fullWidth
            inputProps={{ min: 1, max: 999 }}
          />

          {!isEditing && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_system_managed}
                    onChange={(e) => setFormData({ ...formData, is_system_managed: e.target.checked })}
                  />
                }
                label="시스템 관리"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="활성화"
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
