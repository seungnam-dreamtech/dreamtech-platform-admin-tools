// 서비스 가입 관리 컴포넌트 (Transfer 스타일)

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Button,
  Stack,
  TextField,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { MOCK_SERVICES } from '../../constants/user-management';
import type { ServiceSubscription } from '../../types/user-management';

interface ServiceSubscriptionManagerProps {
  value?: ServiceSubscription[];
  onChange?: (subscriptions: ServiceSubscription[]) => void;
  preSelectedServiceId?: string; // 특정 서비스에서 사용자 추가 시 자동 선택
}

interface ServiceItem {
  id: string;
  displayName: string;
  description: string;
  icon: string;
  defaultRole: string;
}

export function ServiceSubscriptionManager({
  value = [],
  onChange,
  preSelectedServiceId,
}: ServiceSubscriptionManagerProps) {
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  const subscribedIds = value.map(sub => sub.serviceId);

  // preSelectedServiceId가 있으면 자동 선택
  useEffect(() => {
    if (preSelectedServiceId && !subscribedIds.includes(preSelectedServiceId)) {
      handleAddService(preSelectedServiceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedServiceId]);

  const handleAddService = (serviceId: string) => {
    const service = MOCK_SERVICES.find(s => s.id === serviceId);
    if (!service) return;

    const newSubscription: ServiceSubscription = {
      serviceId: service.id,
      serviceName: service.displayName,
      subscribedAt: new Date().toISOString(),
      status: 'active' as const,
      roles: [service.defaultRole],
    };

    onChange?.([...value, newSubscription]);
  };

  const handleMoveToRight = () => {
    leftSelected.forEach(serviceId => {
      if (!subscribedIds.includes(serviceId)) {
        handleAddService(serviceId);
      }
    });
    setLeftSelected([]);
  };

  const handleMoveToLeft = () => {
    const newSubscriptions = value.filter(sub => !rightSelected.includes(sub.serviceId));
    onChange?.(newSubscriptions);
    setRightSelected([]);
  };

  const handleToggleLeft = (serviceId: string) => {
    const currentIndex = leftSelected.indexOf(serviceId);
    const newSelected = [...leftSelected];

    if (currentIndex === -1) {
      newSelected.push(serviceId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setLeftSelected(newSelected);
  };

  const handleToggleRight = (serviceId: string) => {
    const currentIndex = rightSelected.indexOf(serviceId);
    const newSelected = [...rightSelected];

    if (currentIndex === -1) {
      newSelected.push(serviceId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setRightSelected(newSelected);
  };

  const availableServices = MOCK_SERVICES.filter(
    service => !subscribedIds.includes(service.id)
  );

  const filteredAvailable = availableServices.filter(
    service =>
      service.displayName.toLowerCase().includes(leftSearch.toLowerCase()) ||
      service.description.toLowerCase().includes(leftSearch.toLowerCase())
  );

  const filteredSubscribed = value.filter(
    sub =>
      sub.serviceName.toLowerCase().includes(rightSearch.toLowerCase())
  );

  const renderServiceList = (
    services: ServiceItem[],
    selected: string[],
    onToggle: (id: string) => void,
    isSubscribed: boolean
  ) => (
    <List dense sx={{ maxHeight: 350, overflow: 'auto' }}>
      {services.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          서비스 없음
        </Typography>
      ) : (
        services.map(service => {
          const labelId = `transfer-list-item-${service.id}-label`;
          const isSelected = selected.indexOf(service.id) !== -1;

          return (
            <ListItem key={service.id} disablePadding>
              <ListItemButton onClick={() => onToggle(service.id)} dense>
                <Checkbox
                  checked={isSelected}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
                <ListItemText
                  id={labelId}
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span style={{ fontSize: '18px' }}>{service.icon}</span>
                      <Typography variant="body2">{service.displayName}</Typography>
                      {isSubscribed && <Chip label="가입됨" color="success" size="small" />}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {service.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        기본 역할: <Chip label={service.defaultRole} size="small" sx={{ height: 16, fontSize: '10px' }} />
                      </Typography>
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })
      )}
    </List>
  );

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {/* 가입 가능한 서비스 */}
      <Box sx={{ flex: '0 0 45%' }}>
        <Paper variant="outlined">
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              가입 가능한 서비스
            </Typography>
            <TextField
              size="small"
              placeholder="서비스 검색"
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {renderServiceList(
            filteredAvailable.map(s => ({
              id: s.id,
              displayName: s.displayName,
              description: s.description,
              icon: s.icon || '',
              defaultRole: s.defaultRole
            })),
            leftSelected,
            handleToggleLeft,
            false
          )}
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {leftSelected.length}/{availableServices.length}개 선택
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 이동 버튼 */}
      <Box sx={{ flex: '0 0 10%', display: 'flex', justifyContent: 'center' }}>
        <Stack spacing={1} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveToRight}
            disabled={leftSelected.length === 0}
            sx={{ minWidth: 40 }}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveToLeft}
            disabled={rightSelected.length === 0}
            sx={{ minWidth: 40 }}
          >
            <ChevronLeftIcon />
          </Button>
        </Stack>
      </Box>

      {/* 가입된 서비스 */}
      <Box sx={{ flex: '0 0 45%' }}>
        <Paper variant="outlined">
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              가입된 서비스
            </Typography>
            <TextField
              size="small"
              placeholder="서비스 검색"
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {renderServiceList(
            filteredSubscribed.map(sub => {
              const service = MOCK_SERVICES.find(s => s.id === sub.serviceId);
              return {
                id: sub.serviceId,
                displayName: sub.serviceName,
                description: service?.description || '',
                icon: service?.icon || '',
                defaultRole: service?.defaultRole || '',
              };
            }),
            rightSelected,
            handleToggleRight,
            true
          )}
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {rightSelected.length}/{value.length}개 선택
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Stack>
  );
}
