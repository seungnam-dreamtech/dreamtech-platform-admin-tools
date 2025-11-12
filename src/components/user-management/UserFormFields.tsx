// 사용자 기본 정보 폼 필드 (재사용 컴포넌트)

import { TextField, MenuItem, FormControl, InputLabel, Select, Stack, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { USER_TYPES, USER_STATUS_OPTIONS } from '../../constants/user-management';
import type { SelectChangeEvent } from '@mui/material';

interface UserFormFieldsProps {
  isEditing?: boolean; // 편집 모드 여부
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: SelectChangeEvent) => void;
  errors?: Record<string, string>;
  userTypeOptions?: Array<{ label: string; value: string; description: string }>;
}

export function UserFormFields({
  isEditing = false,
  formData,
  onChange,
  onSelectChange,
  errors = {},
  userTypeOptions = USER_TYPES,
}: UserFormFieldsProps) {
  return (
    <Stack spacing={2}>
      <TextField
        label="이메일"
        name="email"
        type="email"
        value={formData.email || ''}
        onChange={onChange}
        placeholder="user@example.com"
        disabled={isEditing} // 수정 시에는 이메일 변경 불가
        required
        fullWidth
        size="small"
        error={!!errors.email}
        helperText={errors.email}
      />

      {!isEditing && (
        <TextField
          label="비밀번호"
          name="password"
          type="password"
          value={formData.password || ''}
          onChange={onChange}
          placeholder="비밀번호 (최소 8자)"
          required
          fullWidth
          size="small"
          error={!!errors.password}
          helperText={errors.password}
        />
      )}

      <TextField
        label="이름"
        name="name"
        value={formData.name || ''}
        onChange={onChange}
        placeholder="홍길동"
        required
        fullWidth
        size="small"
        error={!!errors.name}
        helperText={errors.name}
      />

      <TextField
        label="전화번호"
        name="phoneNumber"
        value={formData.phoneNumber || ''}
        onChange={onChange}
        placeholder="+82-10-1234-5678"
        fullWidth
        size="small"
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber}
      />

      {!isEditing && (
        <FormControl fullWidth size="small" required error={!!errors.userType}>
          <InputLabel>사용자 유형</InputLabel>
          <Select
            name="userType"
            value={formData.userType || ''}
            onChange={onSelectChange}
            label="사용자 유형"
            endAdornment={
              <Tooltip title="사용자 유형은 회원가입 시 결정되며, 기본 플랫폼 역할이 자동으로 부여됩니다" arrow>
                <IconButton size="small" sx={{ mr: 2 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            {userTypeOptions.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label} ({type.description})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        label="부서"
        name="department"
        value={formData.department || ''}
        onChange={onChange}
        placeholder="개발팀"
        fullWidth
        size="small"
      />

      <TextField
        label="직책"
        name="position"
        value={formData.position || ''}
        onChange={onChange}
        placeholder="팀장"
        fullWidth
        size="small"
      />

      <FormControl fullWidth size="small" required error={!!errors.status}>
        <InputLabel>상태</InputLabel>
        <Select
          name="status"
          value={formData.status || ''}
          onChange={onSelectChange}
          label="상태"
        >
          {USER_STATUS_OPTIONS.map(status => (
            <MenuItem key={status.value} value={status.value}>
              {status.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}