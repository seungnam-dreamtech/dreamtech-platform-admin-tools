// 사용자 기본 정보 폼 필드 (재사용 컴포넌트)

import { useState, useEffect } from 'react';
import { TextField, MenuItem, FormControl, InputLabel, Select, Stack, Tooltip, IconButton, Box, Chip, Typography } from '@mui/material';
import { Info as InfoIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { USER_TYPES, USER_STATUS_OPTIONS } from '../../constants/user-management';
import { userManagementService } from '../../services/userManagementService';
import type { SelectChangeEvent } from '@mui/material';

interface UserFormFieldsProps {
  isEditing?: boolean; // 편집 모드 여부
  formData: {
    username?: string;
    email?: string;
    password?: string;
    name?: string;
    phoneNumber?: string;
    department?: string;
    position?: string;
    status?: 'active' | 'inactive' | 'suspended';
    userType?: string;
    emailVerified?: boolean;
    enabled?: boolean;
    accountNonLocked?: boolean;
    accountNonExpired?: boolean;
    credentialsNonExpired?: boolean;
  };
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
  userTypeOptions: propUserTypeOptions,
}: UserFormFieldsProps) {
  // User Type Definitions를 동적으로 로드 (신규 추가 시에만)
  const [userTypeOptions, setUserTypeOptions] = useState(propUserTypeOptions || USER_TYPES);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);

  useEffect(() => {
    // 신규 추가 모드이고, prop으로 userTypeOptions가 전달되지 않은 경우에만 로드
    if (!isEditing && !propUserTypeOptions) {
      const fetchUserTypes = async () => {
        setLoadingUserTypes(true);
        try {
          const response = await userManagementService.getUserTypeDefinitions({ page: 0, size: 100 });
          const options = response.content
            .filter(type => type.is_active)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map(type => ({
              label: type.display_name || type.type_id,
              value: type.type_id || '',
              description: type.description || '',
            }));
          setUserTypeOptions(options);
        } catch (error) {
          console.error('User Type 목록 로드 실패:', error);
          // 실패 시 기본값 사용
        } finally {
          setLoadingUserTypes(false);
        }
      };

      fetchUserTypes();
    }
  }, [isEditing, propUserTypeOptions]);

  return (
    <Stack spacing={2}>
      {isEditing && formData.username && (
        <TextField
          label="Username (사용자 ID)"
          name="username"
          value={formData.username}
          disabled
          fullWidth
          size="small"
          helperText="사용자 고유 식별자 (변경 불가)"
        />
      )}

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

      {isEditing && formData.userType && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            사용자 유형
          </Typography>
          <Chip label={formData.userType} color="primary" size="small" />
        </Box>
      )}

      {isEditing && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            계정 상태
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={formData.emailVerified ? <CheckCircleIcon /> : <CancelIcon />}
              label={formData.emailVerified ? '이메일 인증됨' : '이메일 미인증'}
              color={formData.emailVerified ? 'success' : 'default'}
              size="small"
            />
            <Chip
              icon={formData.enabled ? <CheckCircleIcon /> : <CancelIcon />}
              label={formData.enabled ? '활성화' : '비활성화'}
              color={formData.enabled ? 'success' : 'error'}
              size="small"
            />
            <Chip
              icon={formData.accountNonLocked ? <CheckCircleIcon /> : <CancelIcon />}
              label={formData.accountNonLocked ? '잠금 해제' : '잠김'}
              color={formData.accountNonLocked ? 'success' : 'error'}
              size="small"
            />
            <Chip
              icon={formData.accountNonExpired ? <CheckCircleIcon /> : <CancelIcon />}
              label={formData.accountNonExpired ? '계정 유효' : '계정 만료'}
              color={formData.accountNonExpired ? 'success' : 'error'}
              size="small"
            />
            <Chip
              icon={formData.credentialsNonExpired ? <CheckCircleIcon /> : <CancelIcon />}
              label={formData.credentialsNonExpired ? '자격증명 유효' : '자격증명 만료'}
              color={formData.credentialsNonExpired ? 'success' : 'warning'}
              size="small"
            />
          </Stack>
        </Box>
      )}

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
        <FormControl fullWidth size="small" required error={!!errors.userType} disabled={loadingUserTypes}>
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