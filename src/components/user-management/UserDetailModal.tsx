// 사용자 상세/편집 모달 (공통 재사용 컴포넌트)

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { UserFormFields } from './UserFormFields';
import { ServiceSubscriptionManager } from './ServiceSubscriptionManager';
import { RoleManager } from './RoleManager';
import { userManagementService } from '../../services/userManagementService';
import type { PlatformUser, ServiceSubscription } from '../../types/user-management';

interface UserDetailModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  user?: PlatformUser | null; // null이면 신규 추가, 값이 있으면 편집
  preSelectedServiceId?: string; // 특정 서비스에서 사용자 추가 시 자동 선택
}

interface FormData {
  email: string;
  password?: string;
  name: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive' | 'suspended';
  userType?: string;
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

export function UserDetailModal({
  open,
  onCancel,
  onSuccess,
  user,
  preSelectedServiceId,
}: UserDetailModalProps) {
  const snackbar = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 서비스 가입 정보 (탭 간 공유 상태)
  const [serviceSubscriptions, setServiceSubscriptions] = useState<ServiceSubscription[]>([]);
  const [platformRoles, setPlatformRoles] = useState<string[]>([]);

  const isEditing = !!user;

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      if (user) {
        // 편집 모드: 기존 사용자 정보로 폼 초기화
        setFormData({
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          department: user.department,
          position: user.position,
          status: user.status,
          userType: user.userType,
        });
        setServiceSubscriptions(user.serviceSubscriptions || []);
        setPlatformRoles(user.platformRoles || []);
      } else {
        // 추가 모드: 폼 초기화
        setFormData({
          email: '',
          name: '',
          status: 'active',
        });
        setServiceSubscriptions([]);
        setPlatformRoles([]);
      }
      setActiveTab(0); // 항상 기본 정보 탭부터 시작
      setErrors({});
    }
  }, [open, user]);

  // 폼 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 유효성 검사
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력하세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = '비밀번호를 입력하세요';
    } else if (!isEditing && formData.password && formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    }

    if (!formData.name) {
      newErrors.name = '이름을 입력하세요';
    }

    if (formData.phoneNumber && !/^[+\d\s()-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식이 아닙니다';
    }

    if (!isEditing && !formData.userType) {
      newErrors.userType = '사용자 유형을 선택하세요';
    }

    if (!formData.status) {
      newErrors.status = '상태를 선택하세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // 1단계: 기본 정보 폼 검증
      if (!validate()) {
        snackbar.error('필수 입력 항목을 확인하세요');
        setActiveTab(0); // 기본 정보 탭으로 이동
        return;
      }

      setLoading(true);

      // 2단계: 전체 데이터 병합
      const userData = {
        ...formData,
        platformRoles,
        serviceSubscriptions: serviceSubscriptions.map(sub => ({
          serviceId: sub.serviceId,
          roles: sub.roles,
        })),
      };

      // 3단계: API 호출
      if (isEditing && user) {
        // 수정
        await userManagementService.updateUser(user.id, userData);
        snackbar.success('사용자 정보가 수정되었습니다');
      } else {
        // 신규 추가
        await userManagementService.createUser(userData);
        snackbar.success('새 사용자가 추가되었습니다');
      }

      onSuccess();
      handleClose();

    } catch (error) {
      console.error('사용자 저장 실패:', error);
      snackbar.error('사용자 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      status: 'active',
    });
    setServiceSubscriptions([]);
    setPlatformRoles([]);
    setActiveTab(0);
    setErrors({});
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>{isEditing ? '사용자 정보 수정' : '새 사용자 추가'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="기본 정보" />
            <Tab label={`서비스 가입 (${serviceSubscriptions.length})`} />
            <Tab label="역할 및 권한" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 2 }}>
            <UserFormFields
              isEditing={isEditing}
              formData={formData}
              onChange={handleChange}
              onSelectChange={handleSelectChange}
              errors={errors}
            />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 2 }}>
            <ServiceSubscriptionManager
              value={serviceSubscriptions}
              onChange={setServiceSubscriptions}
              preSelectedServiceId={preSelectedServiceId}
            />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 2 }}>
            <RoleManager
              platformRoles={platformRoles}
              onPlatformRolesChange={setPlatformRoles}
              serviceSubscriptions={serviceSubscriptions}
              onServiceSubscriptionsChange={setServiceSubscriptions}
              userType={user?.userType || formData.userType}
            />
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {isEditing ? '수정' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}