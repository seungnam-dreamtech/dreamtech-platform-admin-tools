// 글로벌 역할 관리 탭

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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { GlobalRoleFormModal } from './GlobalRoleFormModal';
import { GlobalRoleDetailDrawer } from './GlobalRoleDetailDrawer';
import { userManagementService } from '../../services/userManagementService';
import type { GlobalRole } from '../../types/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function GlobalRolesTab() {
  const [roles, setRoles] = useState<GlobalRole[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<GlobalRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<GlobalRole | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const snackbar = useSnackbar();

  // 상세 보기 Drawer 상태
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailRole, setDetailRole] = useState<GlobalRole | null>(null);

  // 삭제 확인 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; isSystem: boolean } | null>(null);

  // 역할 목록 조회
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await userManagementService.getGlobalRoles({ page: 0, size: 100 });
      const data = response.content;
      console.log('📋 Global Roles fetched:', data);
      console.log('📋 Data type:', typeof data, 'Is Array:', Array.isArray(data));

      // 배열이 아닌 경우 빈 배열로 처리
      const rolesList = Array.isArray(data) ? data : [];

      if (!Array.isArray(data)) {
        console.error('⚠️ API response is not an array:', data);
        snackbar.warning('API 응답 형식이 올바르지 않습니다. 빈 목록으로 표시합니다.');
      }

      // parent_role_id 필드 확인
      if (rolesList.length > 0) {
        console.log('🔍 First role sample:', rolesList[0]);
        console.log('🔍 Roles with parent_role_id:', rolesList.filter((r) => r.parent_role_id));
        console.log('🔍 Roles with parent_role:', rolesList.filter((r) => r.parent_role));
        console.log(
          '🔍 모든 역할의 부모 정보:',
          rolesList.map((r) => ({
            id: r.role_id,
            parent_role_id: r.parent_role_id,
            parent_role: r.parent_role,
            has_parent: !!(r.parent_role_id || r.parent_role),
          }))
        );
      }

      setRoles(rolesList);
      setFilteredRoles(rolesList);
    } catch (error) {
      snackbar.error('글로벌 역할 목록 조회에 실패했습니다');
      console.error('Failed to fetch global roles:', error);
      setRoles([]);
      setFilteredRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const filtered = roles.filter(
        (role) =>
          role.role_id.toLowerCase().includes(keyword) ||
          role.display_name.toLowerCase().includes(keyword) ||
          (role.description?.toLowerCase().includes(keyword) ?? false)
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [searchKeyword, roles]);

  // 역할 추가/수정
  const handleSave = async (roleData: GlobalRole) => {
    try {
      if (selectedRole) {
        // 수정 모드: 모달에서 API 호출을 처리하므로 목록만 새로고침
        fetchRoles();
      } else {
        // 추가 모드: 새로운 역할 생성
        await userManagementService.createGlobalRole({
          role_id: roleData.role_id,
          display_name: roleData.display_name,
          description: roleData.description || '',
          authority_level: roleData.authority_level,
          permissions: roleData.permissions,
          parent_role_id: roleData.parent_role_id || undefined,
        });
        snackbar.success('새 글로벌 역할이 추가되었습니다');
        fetchRoles();
      }
      setModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      snackbar.error('역할 저장에 실패했습니다');
      console.error('Failed to save global role:', error);
    }
  };

  // 역할 활성화/비활성화 토글
  const handleToggleActive = async (roleId: string, isActive: boolean) => {
    try {
      await userManagementService.toggleGlobalRoleActivation(roleId, isActive);
      snackbar.success(`역할이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchRoles();
    } catch (error) {
      snackbar.error('역할 상태 변경에 실패했습니다');
      console.error('Failed to toggle global role:', error);
    }
  };

  // 역할 삭제 확인
  const confirmDelete = (roleId: string, isSystemRole: boolean) => {
    if (isSystemRole) {
      snackbar.warning('시스템 역할은 삭제할 수 없습니다');
      return;
    }
    setRoleToDelete({ id: roleId, isSystem: isSystemRole });
    setDeleteConfirmOpen(true);
  };

  // 역할 삭제
  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await userManagementService.deleteGlobalRole(roleToDelete.id);
      snackbar.success('역할이 삭제되었습니다');
      fetchRoles();
    } catch (error) {
      snackbar.error('역할 삭제에 실패했습니다');
      console.error('Failed to delete global role:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  // 권한 레벨 색상
  const getLevelColor = (level: number): 'error' | 'warning' | 'success' => {
    if (level <= 10) return 'error';
    if (level <= 50) return 'warning';
    return 'success';
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'role_id',
      headerName: 'Role ID',
      flex: 0.7,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.role_id}
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
      renderCell: (params: GridRenderCellParams<GlobalRole>) =>
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
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
        <Typography variant="body2">{params.row.display_name}</Typography>
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.description || '-'}
        </Typography>
      ),
    },
    {
      field: 'authority_level',
      headerName: '레벨',
      flex: 0.3,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
        <Tooltip title="1-100 범위, 낮을수록 높은 권한">
          <Chip label={params.row.authority_level} color={getLevelColor(params.row.authority_level)} size="small" />
        </Tooltip>
      ),
    },
    {
      field: 'parent_role',
      headerName: '부모',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<GlobalRole>) => {
        const parentRole = params.row.parent_role;
        if (parentRole && parentRole.role_id) {
          return (
            <Tooltip title={`${parentRole.display_name} (Level ${parentRole.authority_level})`}>
              <Typography variant="body2" color="primary">
                {parentRole.role_id}
              </Typography>
            </Tooltip>
          );
        }
        return (
          <Typography variant="body2" color="textSecondary">
            -
          </Typography>
        );
      },
    },
    {
      field: 'permissions',
      headerName: '권한 수',
      flex: 0.3,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
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
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
        <Switch
          size="small"
          checked={params.row.is_active}
          onChange={(e) => handleToggleActive(params.row.role_id, e.target.checked)}
          disabled={params.row.is_system_role}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
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
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
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
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
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
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updated_by || '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.6,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<GlobalRole>) => (
        <Box>
          <Tooltip title="상세 보기">
            <IconButton
              size="small"
              onClick={() => {
                setDetailRole(params.row);
                setDetailDrawerOpen(true);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
            onClick={() => confirmDelete(params.row.role_id, params.row.is_system_role)}
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
          글로벌 역할 ({filteredRoles.length}개)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          플랫폼 전체에 적용되는 역할
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 검색 및 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Role ID, 표시명 또는 설명으로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="small"
            sx={{ width: 400 }}
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
          getRowId={(row) => row.role_id}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'role_id', sort: 'asc' }] },
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
      <GlobalRoleFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSave}
        role={selectedRole}
        existingRoles={roles}
      />

      {/* 역할 상세 조회 Drawer */}
      <GlobalRoleDetailDrawer
        open={detailDrawerOpen}
        role={detailRole}
        allRoles={roles}
        onClose={() => {
          setDetailDrawerOpen(false);
          setDetailRole(null);
        }}
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
