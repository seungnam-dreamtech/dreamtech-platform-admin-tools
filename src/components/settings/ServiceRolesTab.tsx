// 서비스 역할 관리 탭
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ServiceRoleFormModal } from './ServiceRoleFormModal';
import { userManagementService } from '../../services/userManagementService';
import type { ServiceRoleDefinition, ServiceScope } from '../../types/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function ServiceRolesTab() {
  const [roles, setRoles] = useState<ServiceRoleDefinition[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<ServiceRoleDefinition[]>([]);
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ServiceRoleDefinition | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('');
  const snackbar = useSnackbar();

  // 삭제 확인 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    serviceId: string;
    roleName: string;
    isSystem: boolean;
  } | null>(null);

  // 서비스 목록 조회 (역할 추가 시 서비스 선택용)
  const fetchServices = async () => {
    try {
      const response = await userManagementService.getServiceScopes({ page: 0, size: 100 });
      setServices(response.content.filter((s) => s.is_active)); // 활성화된 서비스만
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  // 역할 목록 조회
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getServiceRoles();
      console.log('📋 Service Roles API response:', data);

      let rolesList: ServiceRoleDefinition[] = [];

      if (Array.isArray(data)) {
        // API 응답: [{ service_id, role_count, roles: [...] }, ...]
        // roles 배열을 평탄화
        rolesList = data.flatMap((serviceGroup: any) => {
          if (serviceGroup.roles && Array.isArray(serviceGroup.roles)) {
            console.log(`📦 Service ${serviceGroup.service_id}: ${serviceGroup.roles.length} roles`);
            return serviceGroup.roles;
          }
          return [];
        });

        console.log(`✅ Total flattened service roles: ${rolesList.length}`);

        if (rolesList.length > 0) {
          console.log('📋 First role sample:', rolesList[0]);
        }
      } else {
        console.error('⚠️ API response is not an array:', data);
        snackbar.warning('API 응답 형식이 올바르지 않습니다.');
      }

      setRoles(rolesList);
      setFilteredRoles(rolesList);
    } catch (error) {
      snackbar.error('서비스 역할 목록 조회에 실패했습니다');
      console.error('Failed to fetch service roles:', error);
      setRoles([]);
      setFilteredRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchRoles();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...roles];

    // 서비스 필터
    if (selectedServiceFilter && selectedServiceFilter !== 'all') {
      filtered = filtered.filter((role) => role.service_id === selectedServiceFilter);
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.role_name.toLowerCase().includes(keyword) ||
          role.display_name.toLowerCase().includes(keyword) ||
          (role.description?.toLowerCase().includes(keyword) ?? false) ||
          role.service_id.toLowerCase().includes(keyword)
      );
    }

    setFilteredRoles(filtered);
  }, [searchKeyword, selectedServiceFilter, roles]);

  // 역할 추가/수정
  const handleSave = async (roleData: ServiceRoleDefinition) => {
    try {
      if (selectedRole) {
        // 수정 모드: 모달에서 API 호출을 처리하므로 목록만 새로고침
        fetchRoles();
      } else {
        // 추가 모드: 새로운 역할 생성
        await userManagementService.createServiceRole(roleData.service_id, {
          role_name: roleData.role_name,
          display_name: roleData.display_name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        snackbar.success('새 서비스 역할이 추가되었습니다');
        fetchRoles();
      }
      setModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      snackbar.error('역할 저장에 실패했습니다');
      console.error('Failed to save service role:', error);
    }
  };

  // 역할 활성화/비활성화 토글
  const handleToggleActive = async (
    serviceId: string,
    roleName: string,
    isActive: boolean
  ) => {
    try {
      await userManagementService.toggleServiceRoleActivation(serviceId, roleName, isActive);
      snackbar.success(`역할이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchRoles();
    } catch (error) {
      snackbar.error('역할 상태 변경에 실패했습니다');
      console.error('Failed to toggle service role:', error);
    }
  };

  // 역할 삭제 확인
  const confirmDelete = (serviceId: string, roleName: string, isSystemRole: boolean) => {
    if (isSystemRole) {
      snackbar.warning('시스템 역할은 삭제할 수 없습니다');
      return;
    }
    setRoleToDelete({ serviceId, roleName, isSystem: isSystemRole });
    setDeleteConfirmOpen(true);
  };

  // 역할 삭제
  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await userManagementService.deleteServiceRole(roleToDelete.serviceId, roleToDelete.roleName);
      snackbar.success('역할이 삭제되었습니다');
      fetchRoles();
    } catch (error) {
      snackbar.error('역할 삭제에 실패했습니다');
      console.error('Failed to delete service role:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'service_id',
      headerName: '서비스',
      flex: 0.6,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="body2" color="primary" fontWeight={500}>
          {params.row.service_id}
        </Typography>
      ),
    },
    {
      field: 'role_name',
      headerName: 'Role Name',
      flex: 0.7,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.role_name}
        </Typography>
      ),
    },
    {
      field: 'is_system_role',
      headerName: '타입',
      flex: 0.4,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) =>
        params.row.is_system_role ? (
          <Tooltip title="시스템 역할 (삭제/비활성화 불가)">
            <Chip label="SYSTEM" color="error" size="small" />
          </Tooltip>
        ) : (
          <Chip label="사용자" color="success" size="small" />
        ),
    },
    {
      field: 'display_name',
      headerName: '표시명',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="body2">{params.row.display_name}</Typography>
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.description || '-'}
        </Typography>
      ),
    },
    {
      field: 'permissions',
      headerName: '권한 수',
      flex: 0.3,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.permissions?.length || 0}
        </Typography>
      ),
    },
    {
      field: 'is_active',
      headerName: '상태',
      flex: 0.4,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Switch
          size="small"
          checked={params.row.is_active}
          onChange={(e) =>
            handleToggleActive(params.row.service_id, params.row.role_name, e.target.checked)
          }
          disabled={params.row.is_system_role}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.created_at ? new Date(params.row.created_at).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'created_by',
      headerName: '생성자',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.created_by || '-'}
        </Typography>
      ),
    },
    {
      field: 'updated_at',
      headerName: '수정일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updated_at ? new Date(params.row.updated_at).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'updated_by',
      headerName: '수정자',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updated_by || '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.4,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<ServiceRoleDefinition>) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedRole(params.row);
              setModalOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            disabled={params.row.is_system_role}
            onClick={() =>
              confirmDelete(params.row.service_id, params.row.role_name, params.row.is_system_role)
            }
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          서비스 역할 ({filteredRoles.length}개)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          특정 서비스에만 적용되는 역할
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 필터/검색 및 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 250 }} size="small">
              <InputLabel>서비스 필터</InputLabel>
              <Select
                value={selectedServiceFilter || 'all'}
                onChange={(e) => setSelectedServiceFilter(e.target.value === 'all' ? '' : e.target.value)}
                label="서비스 필터"
              >
                <MenuItem value="all">전체 서비스</MenuItem>
                {services.map((s) => (
                  <MenuItem key={s.service_id} value={s.service_id}>
                    {s.service_id} ({s.description})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder="Role Name, 표시명 또는 설명으로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              slotProps={{
                input: {
                  endAdornment: searchKeyword && (
                    <IconButton size="small" onClick={() => setSearchKeyword('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRoles} disabled={loading}>
              새로고침
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedRole(null);
                setModalOpen(true);
              }}
            >
              역할 추가
            </Button>
          </Box>
        </Box>

        {/* 테이블 */}
        <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRoles}
          columns={columns}
          getRowId={(row) => `${row.service_id}:${row.role_name}`}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'service_id', sort: 'asc' }] },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex !important',
              alignItems: 'center !important',
              padding: '0 16px !important',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
        </Box>
      </Box>

      {/* 역할 추가/수정 모달 */}
      <ServiceRoleFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSave}
        role={selectedRole}
        services={services}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>역할 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 역할을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}