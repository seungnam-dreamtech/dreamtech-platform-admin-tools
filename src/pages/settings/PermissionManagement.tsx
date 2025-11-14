// 권한 정의 관리 페이지

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Chip,
  Switch,
  Tooltip,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Security as SecurityIcon,
  Apps as AppsIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { userManagementService } from '../../services/userManagementService';
import type {
  PermissionDefinition,
  ServiceScope,
  PermissionSearchFilter,
} from '../../types/user-management';
import PermissionFormModal from '../../components/settings/PermissionFormModal';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function PermissionManagement() {
  const snackbar = useSnackbar();
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<PermissionDefinition[]>([]);
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string | undefined>(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(
    undefined
  );
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionDefinition | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionDefinition | null>(null);

  // 서비스 목록 조회
  const fetchServices = async () => {
    try {
      const data = await userManagementService.getServiceScopes();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  // 권한 목록 조회
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const filter: PermissionSearchFilter = {
        keyword: searchKeyword || undefined,
        service_id: selectedServiceFilter,
        category: selectedCategoryFilter,
      };

      const data = await userManagementService.getPermissions(filter);
      console.log('📋 Permissions fetched:', data);

      const permissionsList = Array.isArray(data) ? data : [];

      if (!Array.isArray(data)) {
        console.error('⚠️ API response is not an array:', data);
        snackbar.warning('API 응답 형식이 올바르지 않습니다. 빈 목록으로 표시합니다.');
      }

      setPermissions(permissionsList);
      setFilteredPermissions(permissionsList);
    } catch (error) {
      snackbar.error('권한 목록 조회에 실패했습니다');
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
      setFilteredPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, selectedServiceFilter, selectedCategoryFilter]);

  // 모달 열기
  const handleOpenModal = (permission?: PermissionDefinition) => {
    setEditingPermission(permission || null);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setEditingPermission(null);
    setIsModalOpen(false);
  };

  // 저장
  const handleSave = async (permission: PermissionDefinition) => {
    try {
      if (editingPermission) {
        // 수정
        await userManagementService.updatePermission(editingPermission.id, permission);
        snackbar.success('권한이 수정되었습니다');
      } else {
        // 생성
        await userManagementService.createPermission(permission);
        snackbar.success('새 권한이 생성되었습니다');
      }
      fetchPermissions();
      handleCloseModal();
    } catch (error) {
      snackbar.error('권한 저장에 실패했습니다');
      console.error(error);
    }
  };

  // 활성화/비활성화
  const handleToggleActive = async (permission: PermissionDefinition) => {
    try {
      await userManagementService.togglePermissionActivation(permission.id, !permission.is_active);
      snackbar.success(permission.is_active ? '비활성화되었습니다' : '활성화되었습니다');
      fetchPermissions();
    } catch (error) {
      snackbar.error('활성 상태 변경에 실패했습니다');
      console.error(error);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      await userManagementService.deletePermission(permissionToDelete.id);
      snackbar.success('권한이 삭제되었습니다');
      fetchPermissions();
      setDeleteDialogOpen(false);
      setPermissionToDelete(null);
    } catch (error) {
      snackbar.error('권한 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 카테고리 목록 추출
  const categories = Array.from(new Set(permissions.map(p => p.category).filter(Boolean)));

  // 서비스별 그룹화 데이터
  const groupedByService = services.map(service => {
    const servicePermissions = permissions.filter(p => p.service_id === service.service_id);
    const activeCount = servicePermissions.filter(p => p.is_active).length;
    return {
      service,
      permissions: servicePermissions,
      activeCount,
    };
  });

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'service_id',
      headerName: '서비스',
      flex: 0.7,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => {
        const service = services.find(s => s.service_id === params.row.service_id);
        return (
          <Chip
            label={service?.service_name || params.row.service_id}
            color="primary"
            size="small"
          />
        );
      },
    },
    {
      field: 'permission_string',
      headerName: '권한 문자열',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
        <Chip
          label={params.row.permission_string}
          variant="outlined"
          size="small"
          sx={{ fontFamily: 'monospace' }}
        />
      ),
    },
    {
      field: 'display_name',
      headerName: '표시명',
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
        <Typography variant="body2">
          {params.row.display_name}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: '카테고리',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
        <Chip label={params.row.category} size="small" variant="outlined" />
      ),
    },
    {
      field: 'is_system_permission',
      headerName: '시스템',
      flex: 0.3,
      minWidth: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) =>
        params.row.is_system_permission ? (
          <Tooltip title="시스템 권한 (삭제 불가)">
            <SecurityIcon color="warning" fontSize="small" />
          </Tooltip>
        ) : null,
    },
    {
      field: 'is_active',
      headerName: '활성',
      flex: 0.3,
      minWidth: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
        <Switch
          checked={params.row.is_active}
          onChange={() => handleToggleActive(params.row)}
          size="small"
        />
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
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
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
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
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
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
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
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
      renderCell: (params: GridRenderCellParams<PermissionDefinition>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="수정">
            <IconButton size="small" onClick={() => handleOpenModal(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.is_system_permission ? '시스템 권한은 삭제할 수 없습니다' : '삭제'}>
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={params.row.is_system_permission}
                onClick={() => {
                  setPermissionToDelete(params.row);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          권한 정의 관리 ({filteredPermissions.length}개)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          서비스별 권한을 정의하고 관리합니다 | 활성: {permissions.filter(p => p.is_active).length}개 | 비활성: {permissions.filter(p => !p.is_active).length}개
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 필터/검색 및 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>서비스 필터</InputLabel>
              <Select
                value={selectedServiceFilter || ''}
                onChange={(e) => setSelectedServiceFilter(e.target.value || undefined)}
                label="서비스 필터"
              >
                <MenuItem value="">전체 서비스</MenuItem>
                {services.map(service => (
                  <MenuItem key={service.service_id} value={service.service_id}>
                    {service.service_name || service.service_id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>카테고리 필터</InputLabel>
              <Select
                value={selectedCategoryFilter || ''}
                onChange={(e) => setSelectedCategoryFilter(e.target.value || undefined)}
                label="카테고리 필터"
              >
                <MenuItem value="">전체 카테고리</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder="권한명, 리소스, 액션으로 검색"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              size="small"
              sx={{ width: 300 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="table">
                <Tooltip title="테이블 뷰">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grouped">
                <Tooltip title="그룹 뷰">
                  <ViewModuleIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchPermissions}
              disabled={loading}
            >
              새로고침
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              권한 추가
            </Button>
          </Box>
        </Box>

        {/* 테이블 뷰 */}
        {viewMode === 'table' && (
          <Box sx={{
            height: 'calc(100vh - 280px)',
            width: '100%',
            minHeight: 400,
          }}>
          <DataGrid
            rows={filteredPermissions}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            getRowHeight={() => 'auto'}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: '등록된 권한이 없습니다',
              noResultsOverlayLabel: '검색 결과가 없습니다',
            }}
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex !important',
                alignItems: 'center !important',
                py: 1,
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
      )}

      {/* 그룹 뷰 */}
      {viewMode === 'grouped' && (
        <Box>
          {groupedByService.map(({ service, permissions: servicePermissions, activeCount }) => (
            <Accordion key={service.service_id} defaultExpanded={servicePermissions.length > 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <AppsIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {service.service_name || service.service_id}
                  </Typography>
                  <Badge badgeContent={servicePermissions.length} color="primary" />
                  <Typography variant="body2" color="textSecondary">
                    활성: {activeCount}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={servicePermissions}
                    columns={columns}
                    getRowId={(row) => row.id}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    disableRowSelectionOnClick
                    sx={{
                      '& .MuiDataGrid-cell': {
                        display: 'flex !important',
                        alignItems: 'center !important',
                        padding: '0 16px !important',
                      },
                    }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
      </Box>

      {/* 모달 */}
      <PermissionFormModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onSave={handleSave}
        permission={editingPermission}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPermissionToDelete(null);
        }}
      >
        <DialogTitle>권한 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{permissionToDelete?.permission_string}" 권한을 삭제하시겠습니까?
            <br />
            이 작업은 취소할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setPermissionToDelete(null);
            }}
          >
            취소
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
