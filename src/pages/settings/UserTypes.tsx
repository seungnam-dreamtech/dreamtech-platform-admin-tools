// 사용자 유형 관리 페이지

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Switch,
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
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { UserTypeFormModal } from '../../components/settings/UserTypeFormModal';
import { userManagementService } from '../../services/userManagementService';
import type { UserTypeDefinition } from '../../types/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function UserTypes() {
  const [userTypes, setUserTypes] = useState<UserTypeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserTypeDefinition | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userTypeToDelete, setUserTypeToDelete] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [totalElements, setTotalElements] = useState(0);
  const snackbar = useSnackbar();

  // User Type 목록 조회
  const fetchUserTypes = async () => {
    setLoading(true);
    try {
      const response = await userManagementService.getUserTypeDefinitions({
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: ['createdAt,DESC'],
      });
      console.log('📋 User Type Definitions fetched:', response);
      setUserTypes(response.content);
      setTotalElements(response.total_elements);
    } catch (error) {
      snackbar.error('사용자 유형 목록 조회에 실패했습니다');
      console.error('Failed to fetch user types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, [paginationModel.page, paginationModel.pageSize]);

  // User Type 추가/수정
  const handleSave = async (userTypeData: UserTypeDefinition) => {
    try {
      if (selectedUserType) {
        // 수정 모드: 모달 내부에서 이미 API 호출을 처리하므로 여기서는 목록만 새로고침
        fetchUserTypes();
      } else {
        // 추가 모드: 새로운 유형 생성
        await userManagementService.createUserTypeDefinition(userTypeData);
        snackbar.success('새 사용자 유형이 추가되었습니다');
        fetchUserTypes();
      }
      setModalOpen(false);
      setSelectedUserType(null);
    } catch (error) {
      snackbar.error('사용자 유형 저장에 실패했습니다');
      console.error('Failed to save user type:', error);
    }
  };

  // User Type 활성화/비활성화 토글
  const handleToggleActive = async (typeId: string, isActive: boolean) => {
    try {
      await userManagementService.toggleUserTypeActivation(typeId, isActive);
      snackbar.success(`사용자 유형이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchUserTypes();
    } catch (error) {
      snackbar.error('사용자 유형 상태 변경에 실패했습니다');
      console.error('Failed to toggle user type:', error);
    }
  };

  // User Type 삭제
  const handleDelete = async (typeId: string) => {
    try {
      await userManagementService.deleteUserTypeDefinition(typeId);
      snackbar.success('사용자 유형이 삭제되었습니다');
      fetchUserTypes();
    } catch (error) {
      snackbar.error('사용자 유형 삭제에 실패했습니다');
      console.error('Failed to delete user type:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setUserTypeToDelete(null);
    }
  };

  const confirmDelete = (typeId: string) => {
    setUserTypeToDelete(typeId);
    setDeleteConfirmOpen(true);
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'type_id',
      headerName: '유형 ID',
      flex: 0.6,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.type_id}
        </Typography>
      ),
    },
    {
      field: 'display_name',
      headerName: '표시명',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        <Typography variant="body2" fontWeight={600}>
          {params.row.display_name}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.description || '-'}
        </Typography>
      ),
    },
    {
      field: 'is_system_type',
      headerName: '시스템',
      flex: 0.4,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        params.row.is_system_type ? (
          <Chip label="시스템" color="warning" size="small" />
        ) : (
          <Typography variant="caption" color="textSecondary">-</Typography>
        )
      ),
    },
    {
      field: 'display_order',
      headerName: '순서',
      flex: 0.3,
      minWidth: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        <Typography variant="body2">
          {params.row.display_order}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
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
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
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
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
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
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updated_by || '-'}
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
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        <Switch
          size="small"
          checked={params.row.is_active}
          onChange={(e) => handleToggleActive(params.row.type_id, e.target.checked)}
          disabled={params.row.is_system_type}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.5,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<UserTypeDefinition>) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUserType(params.row);
              setModalOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {!params.row.is_system_type && (
            <IconButton
              size="small"
              color="error"
              onClick={() => confirmDelete(params.row.type_id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          사용자 유형 ({totalElements}개)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          사용자 유형과 기본 역할 매핑 관리
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUserTypes}
            disabled={loading}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUserType(null);
              setModalOpen(true);
            }}
          >
            사용자 유형 추가
          </Button>
        </Box>

        {/* 테이블 */}
        <Box sx={{
          height: 'calc(100vh - 280px)',
          width: '100%',
          minHeight: 400,
        }}>
        <DataGrid
          rows={userTypes}
          columns={columns}
          getRowId={(row) => row.type_id}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalElements}
          pageSizeOptions={[10, 20, 50, 100]}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: '등록된 사용자 유형이 없습니다',
            noResultsOverlayLabel: '검색 결과가 없습니다',
          }}
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

      {/* 사용자 유형 추가/수정 모달 */}
      <UserTypeFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedUserType(null);
        }}
        onSave={handleSave}
        userType={selectedUserType}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>사용자 유형 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 사용자 유형을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => userTypeToDelete && handleDelete(userTypeToDelete)}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
