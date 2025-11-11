// 플랫폼 역할 관리 페이지

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  TextField,
  Typography,
  Alert,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { PlatformRoleFormModal } from '../../components/settings/PlatformRoleFormModal';
import type { PlatformRole } from '../../types/user-management';
import { PLATFORM_ROLES } from '../../constants/user-management';

export default function PlatformRoles() {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PlatformRole | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // 역할 목록 조회
  const fetchRoles = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 연동
      // const data = await userManagementService.getPlatformRoles();
      const data = [...PLATFORM_ROLES];
      setRoles(data);
      setFilteredRoles(data);
    } catch (error) {
      enqueueSnackbar('역할 목록 조회에 실패했습니다', { variant: 'error' });
      console.error(error);
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
        role =>
          role.displayName.toLowerCase().includes(keyword) ||
          role.name.toLowerCase().includes(keyword) ||
          role.description.toLowerCase().includes(keyword)
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [searchKeyword, roles]);

  // 역할 추가/수정
  const handleSave = async () => {
    try {
      if (selectedRole) {
        // 수정
        enqueueSnackbar('역할이 수정되었습니다', { variant: 'success' });
      } else {
        // 추가
        enqueueSnackbar('새 역할이 추가되었습니다', { variant: 'success' });
      }
      fetchRoles();
      setModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      enqueueSnackbar('역할 저장에 실패했습니다', { variant: 'error' });
      console.error(error);
    }
  };

  // 역할 삭제
  const handleDelete = async (_id: string) => {
    if (window.confirm('이 역할을 삭제하시겠습니까? 이 역할을 사용 중인 사용자가 있을 수 있습니다.')) {
      try {
        // TODO: API 호출
        // await userManagementService.deletePlatformRole(id);
        enqueueSnackbar('역할이 삭제되었습니다', { variant: 'success' });
        fetchRoles();
      } catch (error) {
        enqueueSnackbar('역할 삭제에 실패했습니다', { variant: 'error' });
        console.error(error);
      }
    }
  };

  // 테이블 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: '역할 이름',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {params.row.isSystem && <LockIcon sx={{ fontSize: 16, color: '#faad14' }} />}
          <Chip
            label={params.row.name}
            color={params.row.isSystem ? 'warning' : 'primary'}
            size="small"
          />
        </Stack>
      ),
    },
    {
      field: 'displayName',
      headerName: '표시명',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'permissions',
      headerName: '권한',
      width: 300,
      renderCell: (params) => {
        const permissions = params.value as string[];
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {permissions.slice(0, 3).map((permission, index) => (
              <Chip
                key={index}
                label={permission}
                color="secondary"
                size="small"
                sx={{ fontSize: '11px' }}
              />
            ))}
            {permissions.length > 3 && (
              <Chip label={`+${permissions.length - 3}`} size="small" sx={{ fontSize: '11px' }} />
            )}
          </Stack>
        );
      },
    },
    {
      field: 'isSystem',
      headerName: '유형',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? '시스템' : '일반'}
          color={params.value ? 'warning' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedRole(params.row);
              setModalOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {!params.row.isSystem && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* 안내 메시지 */}
            <Alert severity="info">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                플랫폼 역할 관리
              </Typography>
              <Typography variant="body2" component="div">
                <p style={{ margin: '0 0 8px 0' }}>플랫폼 역할은 플랫폼 전역에서 적용되는 역할입니다.</p>
                <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                  <li><strong>시스템 역할</strong>: User Type 기반 기본 역할로 사용되며 삭제가 제한됩니다</li>
                  <li><strong>일반 역할</strong>: 사용자에게 개별적으로 부여 가능한 추가 역할입니다</li>
                  <li><strong>권한 형식</strong>: resource:action (예: user:read, service:manage) 또는 *:* (전체 권한)</li>
                </ul>
              </Typography>
            </Alert>

            {/* 헤더 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  플랫폼 역할 관리
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  플랫폼 전역에서 사용되는 역할과 권한을 관리합니다
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchRoles}
                  disabled={loading}
                >
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
              </Stack>
            </Stack>

            {/* 검색 */}
            <TextField
              placeholder="역할명 또는 설명으로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              sx={{ width: 400 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* 통계 */}
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  전체 역할:{' '}
                </Typography>
                <Typography variant="h6" component="span">
                  {roles.length}개
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  시스템 역할:{' '}
                </Typography>
                <Typography variant="h6" component="span" sx={{ color: '#faad14' }}>
                  {roles.filter(r => r.isSystem).length}개
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  일반 역할:{' '}
                </Typography>
                <Typography variant="h6" component="span" sx={{ color: '#1890ff' }}>
                  {roles.filter(r => !r.isSystem).length}개
                </Typography>
              </Box>
            </Stack>

            {/* 테이블 */}
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={filteredRoles}
                columns={columns}
                loading={loading}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell': {
                    py: 1,
                  },
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* 역할 추가/수정 모달 */}
      <PlatformRoleFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSave}
        role={selectedRole}
      />
    </Box>
  );
}
