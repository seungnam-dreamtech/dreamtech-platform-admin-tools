// 권한 템플릿 추가/수정 모달

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Divider,
  Chip,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type {
  PermissionTemplate,
  GlobalRole,
  ServiceRoleDefinition,
  UserTypeDefinition,
  GlobalRoleInfo,
  ServiceRoleInfo,
} from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface AuthorityTemplateFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  template?: PermissionTemplate | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export function AuthorityTemplateFormModal({
  open,
  onCancel,
  onSave,
  template,
}: AuthorityTemplateFormModalProps) {
  const snackbar = useSnackbar();
  const isEditing = !!template;

  // Tab state
  const [currentTab, setCurrentTab] = useState(0);

  // Form data - 실제 API 구조와 일치
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: string;
    is_active: boolean;
    global_roles: GlobalRoleInfo[];
    service_roles: ServiceRoleInfo[];
  }>({
    name: '',
    description: '',
    category: '',
    is_active: true,
    global_roles: [],
    service_roles: [],
  });

  // API 데이터
  const [availableGlobalRoles, setAvailableGlobalRoles] = useState<GlobalRole[]>([]);
  const [availableServiceRoles, setAvailableServiceRoles] = useState<ServiceRoleDefinition[]>([]);
  const [userTypes, setUserTypes] = useState<UserTypeDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  // 연결된 User Types (역조회)
  const [linkedUserTypes, setLinkedUserTypes] = useState<UserTypeDefinition[]>([]);

  // 데이터 로드
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [globalRolesData, serviceRolesData, userTypesData] = await Promise.all([
        userManagementService.getGlobalRoles(),
        userManagementService.getServiceRoles(),
        userManagementService.getUserTypeDefinitions(),
      ]);

      setAvailableGlobalRoles(globalRolesData);
      setAvailableServiceRoles(serviceRolesData);
      setUserTypes(userTypesData);

      // 템플릿 데이터 로드
      if (template) {
        setFormData({
          name: template.name,
          description: template.description || '',
          category: template.category || '',
          is_active: template.is_active,
          global_roles: template.global_roles || [],
          service_roles: template.service_roles || [],
        });

        // 연결된 User Types 찾기
        const linked = userTypesData.filter((ut) =>
          ut.default_template_names?.includes(template.name)
        );
        setLinkedUserTypes(linked);
      } else {
        // 초기화
        setFormData({
          name: '',
          description: '',
          category: '',
          is_active: true,
          global_roles: [],
          service_roles: [],
        });
        setLinkedUserTypes([]);
      }

      setCurrentTab(0);
    } catch (error) {
      console.error('Failed to load data:', error);
      snackbar.error('데이터 로드에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 글로벌 역할 선택/해제
  const handleToggleGlobalRole = (role: GlobalRole) => {
    const exists = formData.global_roles.find((r) => r.role_id === role.role_id);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        global_roles: prev.global_roles.filter((r) => r.role_id !== role.role_id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        global_roles: [
          ...prev.global_roles,
          {
            role_id: role.role_id,
            display_name: role.display_name,
            description: role.description,
          },
        ],
      }));
    }
  };

  // 서비스 역할 선택/해제
  const handleToggleServiceRole = (role: ServiceRoleDefinition) => {
    const exists = formData.service_roles.find(
      (r) => r.service_id === role.service_id && r.role_name === role.role_name
    );
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        service_roles: prev.service_roles.filter(
          (r) => !(r.service_id === role.service_id && r.role_name === role.role_name)
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        service_roles: [
          ...prev.service_roles,
          {
            service_id: role.service_id,
            role_name: role.role_name,
            description: role.description,
          },
        ],
      }));
    }
  };

  // 저장
  const handleSave = async () => {
    // 검증
    if (!formData.name.trim()) {
      snackbar.error('템플릿 이름을 입력하세요');
      setCurrentTab(0);
      return;
    }

    if (!formData.description.trim()) {
      snackbar.error('설명을 입력하세요');
      setCurrentTab(0);
      return;
    }

    if (formData.global_roles.length === 0 && formData.service_roles.length === 0) {
      snackbar.error('최소 하나 이상의 역할을 선택하세요');
      setCurrentTab(1);
      return;
    }

    setLoading(true);
    try {
      if (isEditing && template) {
        // 수정
        await userManagementService.updatePermissionTemplate(template.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category || undefined,
          global_role_ids: formData.global_roles.map((r) => r.role_id),
          service_role_ids: formData.service_roles.map((r) => `${r.service_id}:${r.role_name}`),
        });
        snackbar.success('권한 템플릿이 수정되었습니다');
      } else {
        // 생성
        await userManagementService.createPermissionTemplate({
          name: formData.name,
          description: formData.description,
          category: formData.category || undefined,
          global_role_ids: formData.global_roles.map((r) => r.role_id),
          service_role_ids: formData.service_roles.map((r) => `${r.service_id}:${r.role_name}`),
        });
        snackbar.success('권한 템플릿이 추가되었습니다');
      }
      onSave();
      onCancel();
    } catch (error) {
      console.error('Failed to save template:', error);
      snackbar.error('권한 템플릿 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 서비스별 역할 그룹화
  const serviceRolesByService = availableServiceRoles.reduce(
    (acc, role) => {
      if (!acc[role.service_id]) {
        acc[role.service_id] = [];
      }
      acc[role.service_id].push(role);
      return acc;
    },
    {} as Record<string, ServiceRoleDefinition[]>
  );

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? `권한 템플릿 수정: ${template?.name}` : '새 권한 템플릿 추가'}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          권한 템플릿은 User Type별로 사전 정의된 권한 세트입니다. 글로벌 역할과 서비스 역할을
          조합하여 구성합니다.
        </Alert>

        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="기본 정보" />
          <Tab label="글로벌 역할" />
          <Tab label="서비스 역할" />
          <Tab label="연결 정보" />
        </Tabs>

        {/* 탭 1: 기본 정보 */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="템플릿 이름"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="예: PLATFORM_ADMIN_DEFAULT"
              fullWidth
              required
              disabled={isEditing}
              helperText={isEditing ? '템플릿 이름은 수정할 수 없습니다' : ''}
            />

            <TextField
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="템플릿의 용도와 포함된 권한을 설명하세요"
              multiline
              rows={3}
              fullWidth
              required
            />

            <TextField
              label="카테고리"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="예: SYSTEM, ECG_ASSIST"
              fullWidth
              helperText="선택 사항: 템플릿을 그룹화하는 카테고리"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                />
              }
              label="활성 상태"
            />
          </Box>
        </TabPanel>

        {/* 탭 2: 글로벌 역할 */}
        <TabPanel value={currentTab} index={1}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              현재 선택된 글로벌 역할 ({formData.global_roles.length}개)
            </Typography>
            {formData.global_roles.length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.global_roles.map((role) => (
                    <Chip
                      key={role.role_id}
                      label={`${role.display_name} (${role.role_id})`}
                      color="primary"
                      onDelete={() => {
                        setFormData((prev) => ({
                          ...prev,
                          global_roles: prev.global_roles.filter((r) => r.role_id !== role.role_id),
                        }));
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                선택된 글로벌 역할이 없습니다
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              사용 가능한 글로벌 역할 선택
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {availableGlobalRoles
                .filter((role) => role.is_active)
                .map((role) => {
                  const isSelected = formData.global_roles.some(
                    (r) => r.role_id === role.role_id
                  );
                  return (
                    <ListItem
                      key={role.role_id}
                      dense
                      button
                      onClick={() => handleToggleGlobalRole(role)}
                      sx={{
                        bgcolor: isSelected ? 'action.selected' : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox checked={isSelected} edge="start" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${role.display_name} (${role.role_id})`}
                        secondary={role.description}
                      />
                      {role.is_system_role && (
                        <Chip label="SYSTEM" color="error" size="small" />
                      )}
                    </ListItem>
                  );
                })}
            </List>
          </Box>
        </TabPanel>

        {/* 탭 3: 서비스 역할 */}
        <TabPanel value={currentTab} index={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              현재 선택된 서비스 역할 ({formData.service_roles.length}개)
            </Typography>
            {formData.service_roles.length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.service_roles.map((role) => (
                    <Chip
                      key={`${role.service_id}:${role.role_name}`}
                      label={`${role.service_id}:${role.role_name}`}
                      color="info"
                      onDelete={() => {
                        setFormData((prev) => ({
                          ...prev,
                          service_roles: prev.service_roles.filter(
                            (r) =>
                              !(r.service_id === role.service_id && r.role_name === role.role_name)
                          ),
                        }));
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                선택된 서비스 역할이 없습니다
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              서비스별 역할 선택
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {Object.entries(serviceRolesByService).map(([serviceId, roles]) => (
                <Paper key={serviceId} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {serviceId}
                  </Typography>
                  <List dense>
                    {roles
                      .filter((role) => role.is_active)
                      .map((role) => {
                        const isSelected = formData.service_roles.some(
                          (r) =>
                            r.service_id === role.service_id && r.role_name === role.role_name
                        );
                        return (
                          <ListItem
                            key={`${role.service_id}:${role.role_name}`}
                            dense
                            button
                            onClick={() => handleToggleServiceRole(role)}
                            sx={{
                              bgcolor: isSelected ? 'action.selected' : 'transparent',
                            }}
                          >
                            <ListItemIcon>
                              <Checkbox checked={isSelected} edge="start" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${role.role_name} - ${role.display_name}`}
                              secondary={role.description}
                            />
                            {role.is_system_role && (
                              <Chip label="SYSTEM" color="error" size="small" />
                            )}
                          </ListItem>
                        );
                      })}
                  </List>
                </Paper>
              ))}
            </Box>
          </Box>
        </TabPanel>

        {/* 탭 4: 연결 정보 */}
        <TabPanel value={currentTab} index={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              이 템플릿을 기본으로 사용하는 사용자 유형
            </Typography>
            {linkedUserTypes.length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <List>
                  {linkedUserTypes.map((ut) => (
                    <ListItem key={ut.type_id}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${ut.display_name} (${ut.type_id})`}
                        secondary={ut.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                현재 이 템플릿을 기본으로 사용하는 사용자 유형이 없습니다
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              템플릿 요약
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>글로벌 역할:</strong> {formData.global_roles.length}개
                </Typography>
                <Typography variant="body2">
                  <strong>서비스 역할:</strong> {formData.service_roles.length}개
                </Typography>
                <Typography variant="body2">
                  <strong>총 역할 수:</strong>{' '}
                  {formData.global_roles.length + formData.service_roles.length}개
                </Typography>
                <Typography variant="body2">
                  <strong>상태:</strong> {formData.is_active ? '활성' : '비활성'}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>취소</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {isEditing ? '수정' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
