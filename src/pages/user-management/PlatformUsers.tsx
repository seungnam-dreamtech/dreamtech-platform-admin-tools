// 플랫폼 사용자 관리 페이지
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { PlatformUser } from '../../types/user-management';
import { UserDetailModal } from '../../components/user-management/UserDetailModal';
import {
  MOCK_USERS,
  USER_STATUS_OPTIONS,
} from '../../constants/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { userManagementService } from '../../services/userManagementService';

export default function PlatformUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'inactive' | 'suspended'>('ALL');
  const snackbar = useSnackbar();

  // 삭제 확인 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // 사용자 목록 조회
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 실제 API 연동 - 페이징 파라미터 포함
      const response = await userManagementService.getUsers(undefined, {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: ['createdAt,DESC'],
      });
      setUsers(response.content);
      setTotalElements(response.totalElements || response.total_elements || 0);
    } catch (error) {
      snackbar.error('사용자 목록 조회에 실패했습니다');
      console.error(error);
      // API 실패 시 Mock 데이터 사용 (개발 환경)
      if (import.meta.env.DEV) {
        console.warn('🔄 API 실패, Mock 데이터로 대체합니다');
        const data: PlatformUser[] = [...MOCK_USERS];
        setUsers(data);
        setTotalElements(data.length);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize]);

  // TODO: 검색 및 필터링을 서버 API와 연동 필요
  // 현재는 서버 사이드 페이징만 구현됨
  // searchKeyword, filterStatus를 API 파라미터로 전달해야 함

  // 사용자 삭제 확인
  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // 사용자 삭제
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await userManagementService.deleteUser(userToDelete);
      snackbar.success('사용자가 삭제되었습니다');
      fetchUsers();
    } catch (error) {
      snackbar.error('사용자 삭제에 실패했습니다');
      console.error(error);
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };


  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: '사용자',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }} src={params.row.profileImage}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.username || params.row.email}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.name || '-'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: '이메일',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="body2">
          {params.row.email || '-'}
        </Typography>
      ),
    },
    {
      field: 'userType',
      headerName: 'User Type',
      flex: 0.7,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => {
        const getColor = () => {
          if (!params.row.userType) return 'default';
          if (params.row.userType.includes('ADMIN')) return 'error';
          if (params.row.userType.includes('MANAGER')) return 'warning';
          if (params.row.userType.includes('DOCTOR')) return 'info';
          return 'default';
        };
        return (
          <Chip
            label={params.row.userType || 'N/A'}
            color={getColor()}
            size="small"
          />
        );
      },
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 0.5,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<PlatformUser>) => {
        const statusOption = USER_STATUS_OPTIONS.find(s => s.value === params.row.status);
        const getColor = () => {
          if (statusOption?.value === 'active') return 'success';
          if (statusOption?.value === 'inactive') return 'default';
          if (statusOption?.value === 'suspended') return 'error';
          return 'default';
        };
        return <Chip label={statusOption?.label || params.row.status} color={getColor()} size="small" />;
      },
    },
    {
      field: 'position',
      headerName: '부서/직책',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Box>
          {params.row.department && (
            <Typography variant="body2">{params.row.department}</Typography>
          )}
          {params.row.position && (
            <Typography variant="caption" color="textSecondary">
              {params.row.position}
            </Typography>
          )}
          {!params.row.department && !params.row.position && (
            <Typography variant="body2" color="textSecondary">-</Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'platformRoles',
      headerName: '플랫폼 역할',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => {
        const roles = params.row.platformRoles;
        return (
          <Tooltip title={roles.join(', ')}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {roles.slice(0, 2).map(role => (
                <Chip key={role} label={role} color="primary" size="small" />
              ))}
              {roles.length > 2 && (
                <Chip label={`+${roles.length - 2}`} size="small" />
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'serviceSubscriptions',
      headerName: '서비스 가입',
      flex: 0.5,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Badge badgeContent={params.row.serviceSubscriptions.length} color="info" />
      ),
    },
    {
      field: 'phoneNumber',
      headerName: '연락처',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.phoneNumber || '-'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: '생성일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.createdAt ? new Date(params.row.createdAt).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'createdBy',
      headerName: '생성자',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="textSecondary">
          {(params.row as any).createdBy || '-'}
        </Typography>
      ),
    },
    {
      field: 'updatedAt',
      headerName: '수정일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updatedAt ? new Date(params.row.updatedAt).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'updatedBy',
      headerName: '수정자',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="textSecondary">
          {(params.row as any).updatedBy || '-'}
        </Typography>
      ),
    },
    {
      field: 'deletedAt',
      headerName: '삭제일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="error">
          {(params.row as any).deletedAt ? new Date((params.row as any).deletedAt).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'deletedBy',
      headerName: '삭제자',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="error">
          {(params.row as any).deletedBy || '-'}
        </Typography>
      ),
    },
    {
      field: 'lastLoginAt',
      headerName: '최근 로그인',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.lastLoginAt ? new Date(params.row.lastLoginAt).toLocaleString('ko-KR') : '-'}
        </Typography>
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
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUser(params.row);
              setModalOpen(true);
            }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUser(params.row);
              setModalOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => confirmDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // 통계 계산 (현재 페이지 데이터 기준)
  const stats = {
    total: totalElements, // 전체 사용자 수
    currentPage: users.length, // 현재 페이지 사용자 수
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          플랫폼 사용자 (총 {stats.total}명)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          플랫폼에 등록된 모든 사용자 관리 | 현재 페이지: 활성 {stats.active}명 / 비활성 {stats.inactive}명 / 정지 {stats.suspended}명
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 필터/검색 및 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>상태</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'active' | 'inactive' | 'suspended')}
                label="상태"
              >
                <MenuItem value="ALL">전체 상태</MenuItem>
                {USER_STATUS_OPTIONS.map(status => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder="사용자ID, 이름, 이메일, 연락처로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              size="small"
              sx={{ width: 350 }}
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
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsers} disabled={loading}>
              새로고침
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedUser(null);
                setModalOpen(true);
              }}
            >
              사용자 추가
            </Button>
          </Box>
        </Box>

        {/* 테이블 */}
        <Box sx={{
          height: 'calc(100vh - 280px)',
          width: '100%',
          minHeight: 400,
        }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalElements}
          pageSizeOptions={[10, 20, 50, 100]}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: '등록된 사용자가 없습니다',
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
      </Box>

      {/* 사용자 상세/추가/수정 모달 */}
      <UserDetailModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUsers();
          setModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>사용자 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 사용자를 삭제하시겠습니까?</Typography>
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