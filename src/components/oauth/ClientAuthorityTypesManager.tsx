// OAuth 클라이언트 권한 유형 관리 컴포넌트

import {
  Card,
  CardContent,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Typography,
  Alert,
  AlertTitle,
  Box
} from '@mui/material';
import type { UserType, ClientAuthorityType, UserTypeDefinition } from '../../types/user-management';

interface ClientAuthorityTypesManagerProps {
  value?: ClientAuthorityType[];
  onChange?: (value: ClientAuthorityType[]) => void;
  userTypeDefinitions: UserTypeDefinition[];  // 동적 User Type 목록
}

export function ClientAuthorityTypesManager({ value = [], onChange, userTypeDefinitions }: ClientAuthorityTypesManagerProps) {
  // 선택된 User Type 목록
  const selectedUserTypes = value.map(at => at.user_type);

  // 기본 User Type
  const defaultUserType = value.find(at => at.is_default)?.user_type;

  // displayOrder 순으로 정렬된 User Type 목록
  const sortedUserTypes = [...userTypeDefinitions].sort((a, b) => a.display_order - b.display_order);

  // User Type 선택/해제
  const handleUserTypeChange = (user_type: UserType, checked: boolean) => {
    if (checked) {
      // 추가
      const newValue = [
        ...value,
        {
          user_type,
          is_default: value.length === 0, // 첫 번째 항목은 자동으로 기본값
        },
      ];
      onChange?.(newValue);
    } else {
      // 제거
      const newValue = value.filter(at => at.user_type !== user_type);
      // 기본값이 제거된 경우, 첫 번째 항목을 기본값으로 설정
      if (defaultUserType === user_type && newValue.length > 0) {
        newValue[0].is_default = true;
      }
      onChange?.(newValue);
    }
  };

  // 기본 User Type 변경
  const handleDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const user_type = event.target.value as UserType;
    const newValue = value.map(at => ({
      ...at,
      is_default: at.user_type === user_type,
    }));
    onChange?.(newValue);
  };

  return (
    <Card sx={{ bgcolor: '#fafafa' }}>
      <CardContent>
        <Stack spacing={3}>
          <Alert severity="info">
            <AlertTitle>클라이언트 권한 유형 (Client Authority Types)</AlertTitle>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                이 클라이언트를 통해 생성 가능한 User Type을 선택합니다.
              </Typography>
              <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                <li>
                  <Typography variant="body2">
                    <strong>Service 클라이언트</strong>: 사용자 생성 불가 (client_credentials만 사용)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Application/Web/Mobile 클라이언트</strong>: 선택한 User Type의 사용자만 회원가입 가능
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>기본 User Type</strong>: 회원가입 시 자동으로 선택되는 유형 (하나만 지정 가능)
                  </Typography>
                </li>
              </ul>
            </Box>
          </Alert>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              생성 가능한 User Type 선택
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {sortedUserTypes.map(userTypeDef => (
                <FormControlLabel
                  key={userTypeDef.type_id}
                  control={
                    <Checkbox
                      checked={selectedUserTypes.includes(userTypeDef.type_id)}
                      onChange={(e) => handleUserTypeChange(userTypeDef.type_id, e.target.checked)}
                    />
                  }
                  label={
                    <Stack spacing={0}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">{userTypeDef.display_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({userTypeDef.type_id})
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {userTypeDef.description}
                      </Typography>
                    </Stack>
                  }
                />
              ))}
            </Stack>
          </Box>

          {value.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                기본 User Type
              </Typography>
              <RadioGroup value={defaultUserType || ''} onChange={handleDefaultChange} sx={{ mt: 1 }}>
                <Stack spacing={1}>
                  {value.map(at => {
                    const userTypeInfo = userTypeDefinitions.find(ut => ut.type_id === at.user_type);
                    return (
                      <FormControlLabel
                        key={at.user_type}
                        value={at.user_type}
                        control={<Radio />}
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">
                              {userTypeInfo?.display_name || at.user_type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (회원가입 시 기본 선택)
                            </Typography>
                          </Stack>
                        }
                      />
                    );
                  })}
                </Stack>
              </RadioGroup>
            </Box>
          )}

          {value.length === 0 && (
            <Alert severity="warning">
              <AlertTitle>선택된 User Type이 없습니다</AlertTitle>
              <Typography variant="body2">
                이 클라이언트를 통해 사용자를 생성할 수 없습니다 (Service 클라이언트에 적합).
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
