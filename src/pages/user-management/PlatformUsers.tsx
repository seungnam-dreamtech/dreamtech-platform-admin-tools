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
import type { PlatformUser, UserType } from '../../types/user-management';
import { UserDetailModal } from '../../components/user-management/UserDetailModal';
import {
  MOCK_USERS,
  USER_TYPES,
  USER_STATUS_OPTIONS,
} from '../../constants/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { userManagementService } from '../../services/userManagementService';

export default function PlatformUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterUserType, setFilterUserType] = useState<UserType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'inactive' | 'suspended'>('ALL');
  const snackbar = useSnackbar();

  // 삭제 확인 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // User Type Definitions (동적 로드)
  const [userTypeOptions, setUserTypeOptions] = useState(USER_TYPES);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);

  // 사용자 목록 조회
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 실제 API 연동
      const data = await userManagementService.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      snackbar.error('사용자 목록 조회에 실패했습니다');
      console.error(error);
      // API 실패 시 Mock 데이터 사용 (개발 환경)
      if (import.meta.env.DEV) {
        console.warn('🔄 API 실패, Mock 데이터로 대체합니다');
        const data: PlatformUser[] = [...MOCK_USERS];
        setUsers(data);
        setFilteredUsers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  // User Type Definitions 로드
  const fetchUserTypes = async () => {
    setLoadingUserTypes(true);
    try {
      const types = await userManagementService.getUserTypeDefinitions();
      const options = types
        .filter(type => type.is_active)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(type => ({
          label: type.display_name,
          value: type.type_id,
          description: type.description,
        }));
      setUserTypeOptions(options);
    } catch (error) {
      console.error('User Type 목록 로드 실패:', error);
      // 실패 시 기본값 사용
    } finally {
      setLoadingUserTypes(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserTypes();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...users];

    // User Type 필터
    if (filterUserType !== 'ALL') {
      filtered = filtered.filter(user => user.userType === filterUserType);
    }

    // Status 필터
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          user.phoneNumber?.toLowerCase().includes(keyword) ||
          user.department?.toLowerCase().includes(keyword)
      );
    }

    setFilteredUsers(filtered);
  }, [searchKeyword, filterUserType, filterStatus, users]);

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
      width: 240,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }} src={params.row.profileImage}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'userType',
      headerName: 'User Type',
      width: 150,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => {
        const typeInfo = userTypeOptions.find(t => t.value === params.row.userType);
        const getColor = () => {
          if (params.row.userType.includes('ADMIN')) return 'error';
          if (params.row.userType.includes('MANAGER')) return 'warning';
          if (params.row.userType.includes('DOCTOR')) return 'info';
          return 'default';
        };
        return (
          <Tooltip title={typeInfo?.description || ''} arrow>
            <Chip
              label={typeInfo?.label || params.row.userType}
              color={getColor()}
              size="small"
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'status',
      headerName: '상태',
      width: 90,
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
      width: 160,
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
      width: 140,
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
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Badge badgeContent={params.row.serviceSubscriptions.length} color="info" />
      ),
    },
    {
      field: 'phoneNumber',
      headerName: '연락처',
      width: 140,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.phoneNumber || '-'}
        </Typography>
      ),
    },
    {
      field: 'lastLoginAt',
      headerName: '최근 로그인',
      width: 150,
      renderCell: (params: GridRenderCellParams<PlatformUser>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.lastLoginAt ? new Date(params.row.lastLoginAt).toLocaleString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
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

  // 통계 계산
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            플랫폼 사용자 ({filteredUsers.length}명)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            플랫폼에 등록된 모든 사용자 관리 | 활성: {stats.active}명 | 비활성: {stats.inactive}명 | 정지: {stats.suspended}명
          </Typography>
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

      {/* 검색 및 필터 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small" disabled={loadingUserTypes}>
          <InputLabel>User Type</InputLabel>
          <Select
            value={filterUserType}
            onChange={(e) => setFilterUserType(e.target.value as UserType | 'ALL')}
            label="User Type"
          >
            <MenuItem value="ALL">전체 User Type</MenuItem>
            {userTypeOptions.map(type => (
              <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
          placeholder="이름, 이메일, 연락처, 부서로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
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

      {/* 테이블 */}
      <Box sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: '등록된 사용자가 없습니다',
            noResultsOverlayLabel: '검색 결과가 없습니다',
          }}
          sx={{
            '& .MuiDataGrid-cell': {
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
        userTypeOptions={userTypeOptions}
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