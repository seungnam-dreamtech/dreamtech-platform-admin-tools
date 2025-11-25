// 서비스 가입 관리 컴포넌트

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Collapse,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { userManagementService } from '../../services/userManagementService';
import type { ServiceSubscription } from '../../types/user-management';

interface ServiceSubscriptionManagerProps {
  userId?: string; // 사용자 ID (편집 모드일 때만)
  value?: ServiceSubscription[];
  onChange?: (subscriptions: ServiceSubscription[]) => void;
  preSelectedServiceId?: string; // 특정 서비스에서 사용자 추가 시 자동 선택
}

interface ServiceItem {
  id: string;
  displayName: string;
  description: string;
}

export function ServiceSubscriptionManager({
  userId,
  value = [],
  onChange,
  preSelectedServiceId,
}: ServiceSubscriptionManagerProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUserServices, setLoadingUserServices] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<ServiceSubscription[]>([]);
  const [showAddServices, setShowAddServices] = useState(false);

  // 편집 모드인지 확인
  const isEditMode = !!userId;
  const currentSubscriptions = isEditMode ? userSubscriptions : value;
  const subscribedIds = currentSubscriptions.map(sub => sub.serviceId);

  // 서비스 목록 로드
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await userManagementService.getServiceScopes({ page: 0, size: 100 });
        const serviceItems = response.content
          .filter(scope => scope.is_active)
          .map((scope): ServiceItem => ({
            id: scope.service_id,
            displayName: scope.service_name || scope.service_id,
            description: scope.description,
          }));
        setServices(serviceItems);
      } catch (error) {
        console.error('서비스 목록 로드 실패:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // 사용자 서비스 가입 정보 동기화 (편집 모드일 때)
  useEffect(() => {
    if (!userId) return;

    // 부모 컴포넌트에서 이미 로드한 데이터가 있으면 그것을 사용
    if (value && value.length > 0) {
      setUserSubscriptions(value);
      setLoadingUserServices(false);
      return;
    }

    // 데이터가 없으면 API 호출 (fallback)
    const fetchUserServices = async () => {
      setLoadingUserServices(true);
      try {
        const subscriptions = await userManagementService.getUserServices(userId);
        setUserSubscriptions(subscriptions);
        // 부모 컴포넌트에도 업데이트
        onChange?.(subscriptions);
      } catch (error) {
        console.error('사용자 서비스 가입 정보 로드 실패:', error);
        setUserSubscriptions([]);
      } finally {
        setLoadingUserServices(false);
      }
    };

    fetchUserServices();
  }, [userId, value]); // value를 의존성에 추가하여 부모에서 로드된 데이터 반영

  // preSelectedServiceId가 있으면 자동 선택
  useEffect(() => {
    if (preSelectedServiceId && !subscribedIds.includes(preSelectedServiceId) && services.length > 0) {
      handleAddService(preSelectedServiceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedServiceId, services]);

  const handleAddService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const newSubscription: ServiceSubscription = {
      serviceId: service.id,
      serviceName: service.displayName,
      subscribedAt: new Date().toISOString(),
      status: 'active' as const,
      roles: [],
    };

    if (isEditMode) {
      const updated = [...userSubscriptions, newSubscription];
      setUserSubscriptions(updated);
      onChange?.(updated);
    } else {
      onChange?.([...value, newSubscription]);
    }

    setShowAddServices(false);
  };

  const handleRemoveService = (serviceId: string) => {
    if (isEditMode) {
      const updated = userSubscriptions.filter(sub => sub.serviceId !== serviceId);
      setUserSubscriptions(updated);
      onChange?.(updated);
    } else {
      const updated = value.filter(sub => sub.serviceId !== serviceId);
      onChange?.(updated);
    }
  };

  const availableServices = services.filter(
    service => !subscribedIds.includes(service.id)
  );

  if (loadingUserServices) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* 가입된 서비스 목록 */}
      <Box>
        <Typography variant="h6" gutterBottom>
          가입된 서비스 ({currentSubscriptions.length})
        </Typography>

        {currentSubscriptions.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            가입된 서비스가 없습니다. 아래 버튼을 클릭하여 서비스를 추가하세요.
          </Alert>
        ) : (
          <Paper variant="outlined" sx={{ mt: 2 }}>
            <List disablePadding>
              {currentSubscriptions.map((subscription, index) => (
                <Box key={subscription.serviceId}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveService(subscription.serviceId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1" fontWeight={500}>
                            {subscription.serviceName}
                          </Typography>
                          <Chip
                            label={subscription.status === 'active' ? '활성' : '비활성'}
                            color={subscription.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          가입일: {new Date(subscription.subscribedAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* 서비스 추가 버튼 및 목록 */}
      <Box>
        <Button
          variant="outlined"
          startIcon={showAddServices ? <ExpandLessIcon /> : <AddIcon />}
          onClick={() => setShowAddServices(!showAddServices)}
          fullWidth
        >
          {showAddServices ? '서비스 추가 닫기' : '서비스 추가'}
        </Button>

        <Collapse in={showAddServices} timeout="auto">
          <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              추가 가능한 서비스
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : availableServices.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                추가할 수 있는 서비스가 없습니다.
              </Typography>
            ) : (
              <List dense>
                {availableServices.map(service => (
                  <ListItem
                    key={service.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => handleAddService(service.id)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={500}>
                            {service.displayName}
                          </Typography>
                          <IconButton size="small" color="primary">
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {service.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Collapse>
      </Box>
    </Stack>
  );
}
