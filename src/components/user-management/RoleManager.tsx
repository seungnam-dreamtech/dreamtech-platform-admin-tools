// 역할 및 권한 관리 컴포넌트

import React from 'react';
import {
  Tabs,
  Tab,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { PLATFORM_ROLES, SERVICE_ROLES, MOCK_SERVICES } from '../../constants/user-management';
import type { ServiceSubscription } from '../../types/user-management';

interface RoleManagerProps {
  platformRoles: string[];
  onPlatformRolesChange: (roles: string[]) => void;
  serviceSubscriptions: ServiceSubscription[];
  onServiceSubscriptionsChange: (subscriptions: ServiceSubscription[]) => void;
  userType?: string; // 사용자 유형 (User Type 기반 기본 역할 표시용)
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export function RoleManager({
  platformRoles,
  onPlatformRolesChange,
  serviceSubscriptions,
  onServiceSubscriptionsChange,
  userType,
}: RoleManagerProps) {
  const [activeTab, setActiveTab] = React.useState(0);

  // 플랫폼 역할 변경 핸들러
  const handlePlatformRolesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onPlatformRolesChange(typeof value === 'string' ? value.split(',') : value);
  };

  // 서비스별 역할 변경 핸들러
  const handleServiceRoleChange = (serviceId: string, event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selectedRoles = typeof value === 'string' ? value.split(',') : value;

    const updated = serviceSubscriptions.map(sub =>
      sub.serviceId === serviceId
        ? { ...sub, roles: selectedRoles }
        : sub
    );
    onServiceSubscriptionsChange(updated);
  };

  // User Type 기반 기본 역할 가져오기
  const getDefaultRoleForUserType = () => {
    if (!userType) return null;

    const defaultRole = PLATFORM_ROLES.find(
      role => role.name === userType || role.name.includes(userType)
    );

    return defaultRole;
  };

  const defaultRole = getDefaultRoleForUserType();

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>권한 해결 우선순위</AlertTitle>
        <ol style={{ marginLeft: -16, fontSize: '12px' }}>
          <li>User Type 기반 기본 역할 (우선순위: 90) - 자동 부여, 변경 불가</li>
          <li>템플릿 기반 권한 (우선순위: 85) - 시스템 관리자가 설정</li>
          <li>개별 사용자 권한 (최고 우선순위) - 여기서 설정하는 역할</li>
        </ol>
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="플랫폼 역할" />
          <Tab label="서비스별 역할" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Stack spacing={3}>
          {defaultRole && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>User Type 기반 기본 역할</AlertTitle>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                사용자 유형 ({userType})에 따라 자동으로 부여되는 역할입니다.
              </Typography>
              <Stack spacing={1}>
                <Chip label={defaultRole.displayName} color="primary" size="small" sx={{ width: 'fit-content' }} />
                <Typography variant="body2">{defaultRole.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  권한: {defaultRole.permissions.join(', ')}
                </Typography>
              </Stack>
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" gutterBottom>추가 플랫폼 역할</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              플랫폼 전역에서 적용되는 역할을 선택하세요.
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>플랫폼 역할 선택</InputLabel>
              <Select
                multiple
                value={platformRoles}
                onChange={handlePlatformRolesChange}
                label="플랫폼 역할 선택"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const role = PLATFORM_ROLES.find(r => r.name === value);
                      return <Chip key={value} label={role?.displayName || value} size="small" />;
                    })}
                  </Box>
                )}
              >
                {PLATFORM_ROLES.filter(role => !role.isSystem || role.name !== userType).map(role => (
                  <MenuItem key={role.name} value={role.name}>
                    <Stack spacing={0}>
                      <Typography variant="body2">{role.displayName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>현재 보유 플랫폼 역할</Typography>
            <Box sx={{ mt: 1 }}>
              {platformRoles.length === 0 && !defaultRole ? (
                <Typography variant="body2" color="text.secondary">
                  선택된 플랫폼 역할이 없습니다
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {defaultRole && (
                    <Chip
                      key={defaultRole.name}
                      label={`${defaultRole.displayName} (기본)`}
                      color="primary"
                      size="small"
                    />
                  )}
                  {platformRoles.map(roleName => {
                    const role = PLATFORM_ROLES.find(r => r.name === roleName);
                    return role ? (
                      <Chip
                        key={roleName}
                        label={role.displayName}
                        color="success"
                        size="small"
                      />
                    ) : null;
                  })}
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Stack spacing={2}>
          {serviceSubscriptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              가입된 서비스가 없습니다. 먼저 서비스 가입 탭에서 서비스를 선택하세요.
            </Typography>
          ) : (
            serviceSubscriptions.map(subscription => {
              const service = MOCK_SERVICES.find(s => s.id === subscription.serviceId);
              const availableRoles = SERVICE_ROLES[subscription.serviceId] || [];
              const defaultServiceRole = service?.defaultRole;

              return (
                <Paper
                  key={subscription.serviceId}
                  variant="outlined"
                  sx={{ p: 2, bgcolor: '#fafafa' }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span style={{ fontSize: '18px' }}>{service?.icon}</span>
                      <Typography variant="subtitle2">{subscription.serviceName}</Typography>
                      <Chip
                        label={subscription.status === 'active' ? '활성' : '비활성'}
                        color={subscription.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </Stack>

                    {defaultServiceRole && (
                      <Alert severity="info" sx={{ fontSize: '12px' }}>
                        기본 역할: {defaultServiceRole}
                      </Alert>
                    )}

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        역할 선택:
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>서비스 역할 선택</InputLabel>
                        <Select
                          multiple
                          value={subscription.roles}
                          onChange={(e) => handleServiceRoleChange(subscription.serviceId, e)}
                          label="서비스 역할 선택"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const role = availableRoles.find(r => r.name === value);
                                return <Chip key={value} label={role?.displayName || value} size="small" />;
                              })}
                            </Box>
                          )}
                        >
                          {availableRoles.map(role => (
                            <MenuItem key={role.name} value={role.name}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Stack spacing={0} sx={{ flex: 1 }}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2">{role.displayName}</Typography>
                                    {role.isDefault && (
                                      <Chip label="기본" color="primary" size="small" sx={{ height: 16, fontSize: '10px' }} />
                                    )}
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary">
                                    {role.description}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        현재 역할:
                      </Typography>
                      {subscription.roles.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          선택된 역할 없음
                        </Typography>
                      ) : (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {subscription.roles.map(roleName => {
                            const role = availableRoles.find(r => r.name === roleName);
                            return role ? (
                              <Chip
                                key={roleName}
                                label={role.displayName}
                                color="secondary"
                                size="small"
                              />
                            ) : (
                              <Chip key={roleName} label={roleName} size="small" />
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              );
            })
          )}
        </Stack>
      </TabPanel>
    </Box>
  );
}
