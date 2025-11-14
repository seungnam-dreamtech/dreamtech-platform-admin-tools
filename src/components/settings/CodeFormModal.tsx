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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import type { Code } from '../../types/user-management';

interface CodeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: Code) => Promise<void>;
  code: Code | null;
  groupId: string;
  codes: Code[];
}

/**
 * 코드 생성/수정 모달
 */
export default function CodeFormModal({
  open,
  onClose,
  onSave,
  code,
  codes,
}: CodeFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [showExtendedAttributes, setShowExtendedAttributes] = useState(false);
  const [formData, setFormData] = useState({
    code_id: 0,
    code_value: '',
    code_name: '',
    description: '',
    display_order: 1,
    parent_code_id: undefined as number | undefined,
    is_default: false,
    is_active: true,
    extended_attributes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!code;

  useEffect(() => {
    if (open) {
      if (code) {
        // 수정 모드
        setFormData({
          code_id: code.code_id,
          code_value: code.code_value,
          code_name: code.code_name,
          description: code.description || '',
          display_order: code.display_order,
          parent_code_id: code.parent_code_id,
          is_default: code.is_default,
          is_active: code.is_active,
          extended_attributes: code.extended_attributes || '',
        });
        setShowExtendedAttributes(!!code.extended_attributes);
      } else {
        // 생성 모드
        setFormData({
          code_id: 0,
          code_value: '',
          code_name: '',
          description: '',
          display_order: 1,
          parent_code_id: undefined,
          is_default: false,
          is_active: true,
          extended_attributes: '',
        });
        setShowExtendedAttributes(false);
      }
      setErrors({});
    }
  }, [open, code]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code_value.trim()) {
      newErrors.code_value = '코드 값을 입력하세요';
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(formData.code_value)) {
      newErrors.code_value = '대문자, 숫자, 언더스코어만 사용 가능합니다';
    }

    if (!formData.code_name.trim()) {
      newErrors.code_name = '코드명을 입력하세요';
    }

    // extended_attributes가 비어있지 않으면 JSON 검증
    if (formData.extended_attributes.trim()) {
      try {
        JSON.parse(formData.extended_attributes);
      } catch (error) {
        newErrors.extended_attributes = '올바른 JSON 형식이 아닙니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // extended_attributes가 비어있으면 undefined로 설정
      const dataToSave = {
        ...formData,
        extended_attributes: formData.extended_attributes.trim() || undefined,
      };

      await onSave(dataToSave as Code);
      onClose();
    } catch (error) {
      console.error('❌ 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 상위 코드 옵션 (자기 자신 제외)
  const parentCodeOptions = codes
    .filter((c) => !code || c.code_id !== code.code_id)
    .map((c) => ({
      label: `${c.code_value} (${c.code_name})`,
      value: c.code_id,
    }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? '코드 수정' : '코드 생성'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="코드 값"
            value={formData.code_value}
            onChange={(e) => setFormData({ ...formData, code_value: e.target.value })}
            error={!!errors.code_value}
            helperText={errors.code_value || '대문자로 시작하며, 대문자, 숫자, 언더스코어만 사용 가능'}
            disabled={isEditing}
            required
            fullWidth
            inputProps={{ maxLength: 50 }}
            placeholder="MEDICAL"
          />

          <TextField
            label="코드명"
            value={formData.code_name}
            onChange={(e) => setFormData({ ...formData, code_name: e.target.value })}
            error={!!errors.code_name}
            helperText={errors.code_name}
            required
            fullWidth
            inputProps={{ maxLength: 100 }}
            placeholder="의료 권한"
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
            inputProps={{ maxLength: 500 }}
            placeholder="의료진 관련 권한 템플릿"
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

          {parentCodeOptions.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>상위 코드</InputLabel>
              <Select
                value={formData.parent_code_id || ''}
                onChange={(e) => setFormData({ ...formData, parent_code_id: e.target.value ? Number(e.target.value) : undefined })}
                label="상위 코드"
              >
                <MenuItem value="">없음</MenuItem>
                {parentCodeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>계층 구조가 필요한 경우 상위 코드를 선택하세요</FormHelperText>
            </FormControl>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              />
            }
            label="기본값"
          />

          {!isEditing && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="활성화"
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={showExtendedAttributes}
                onChange={(e) => setShowExtendedAttributes(e.target.checked)}
              />
            }
            label="확장 속성 표시"
          />

          {showExtendedAttributes && (
            <TextField
              label="확장 속성 (JSON)"
              value={formData.extended_attributes}
              onChange={(e) => setFormData({ ...formData, extended_attributes: e.target.value })}
              error={!!errors.extended_attributes}
              helperText={errors.extended_attributes || 'JSON 형식으로 추가 속성을 저장할 수 있습니다'}
              multiline
              rows={4}
              fullWidth
              placeholder='{"color": "#FF0000", "icon": "medical"}'
              sx={{ fontFamily: 'monospace' }}
            />
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
