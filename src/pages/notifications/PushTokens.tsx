// 푸시 토큰 관리 페이지 (Management API 사용)

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Smartphone as SmartphoneIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import { notificationService } from '../../services/notificationService';
import type { TokenManagementResponse, PlatformType } from '../../types/notification';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function PushTokens() {
  const [tokens, setTokens] = useState<TokenManagementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // 필터 상태
  const [userIdFilter, setUserIdFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformType | ''>('');
  const [activeFilter, setActiveFilter] = useState<string>(''); // 'true', 'false', ''

  // 삭제 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<number | null>(null);

  const snackbar = useSnackbar();

  // 토큰 목록 조회
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: ['created_at,desc'],
      };

      if (userIdFilter.trim()) params.userId = userIdFilter.trim();
      if (platformFilter) params.platformType = platformFilter;
      if (activeFilter) params.isActive = activeFilter === 'true';

      const response = await notificationService.getAllTokens(params);
      console.log('📋 Push Tokens fetched:', response);
      setTokens(response.content);
      setTotalElements(response.total_elements);
    } catch (error) {
      snackbar.error('푸시 토큰 목록 조회에 실패했습니다');
      console.error('Failed to fetch push tokens:', error);
      setTokens([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터/페이징 변경 시 재조회
  useEffect(() => {
    fetchTokens();
  }, [paginationModel.page, paginationModel.pageSize]);

  // 토큰 삭제
  const handleDelete = async (tokenId: number) => {
    try {
      await notificationService.deleteToken(tokenId);
      snackbar.success('푸시 토큰이 삭제되었습니다');
      fetchTokens();
    } catch (error) {
      snackbar.error('푸시 토큰 삭제에 실패했습니다');
      console.error('Failed to delete token:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setTokenToDelete(null);
    }
  };

  const confirmDelete = (tokenId: number) => {
    setTokenToDelete(tokenId);
    setDeleteConfirmOpen(true);
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setUserIdFilter('');
    setPlatformFilter('');
    setActiveFilter('');
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchTokens();
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 플랫폼 타입 색상
  const getPlatformColor = (platform: PlatformType): 'success' | 'info' | 'warning' => {
    switch (platform) {
      case 'ANDROID':
        return 'success';
      case 'IOS':
        return 'info';
      case 'WEB':
        return 'warning';
      default:
        return 'info';
    }
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'token_id',
      headerName: '토큰 ID',
      flex: 0.4,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.token_id}
        </Typography>
      ),
    },
    {
      field: 'user_id',
      headerName: '사용자 ID',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <Typography variant="body2">{params.row.user_id}</Typography>
      ),
    },
    {
      field: 'platform_type',
      headerName: '플랫폼',
      flex: 0.5,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <Chip
          icon={<SmartphoneIcon />}
          label={params.row.platform_type}
          color={getPlatformColor(params.row.platform_type)}
          size="small"
        />
      ),
    },
    {
      field: 'device_id',
      headerName: '디바이스 ID',
      flex: 0.8,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.row.device_id}
        </Typography>
      ),
    },
    {
      field: 'device_name',
      headerName: '디바이스명',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <Typography variant="body2">{params.row.device_name || '-'}</Typography>
      ),
    },
    {
      field: 'is_active',
      headerName: '활성 상태',
      flex: 0.5,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <Chip
          label={params.row.is_active ? '활성' : '비활성'}
          color={params.row.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'created_at',
      headerName: '등록일시',
      flex: 0.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <Typography variant="caption" color="textSecondary">
          {new Date(params.row.created_at).toLocaleString('ko-KR')}
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
      renderCell: (params: GridRenderCellParams<TokenManagementResponse>) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => confirmDelete(params.row.token_id)}
          title="토큰 삭제"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          푸시 토큰 관리 ({totalElements}개)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          전체 푸시 알림 토큰 관리
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 필터 영역 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="사용자 ID"
            placeholder="사용자 ID로 필터"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{ width: 200 }}
            slotProps={{
              input: {
                endAdornment: userIdFilter && (
                  <IconButton size="small" onClick={() => setUserIdFilter('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>플랫폼</InputLabel>
            <Select
              value={platformFilter}
              label="플랫폼"
              onChange={(e) => setPlatformFilter(e.target.value as PlatformType | '')}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="ANDROID">Android</MenuItem>
              <MenuItem value="IOS">iOS</MenuItem>
              <MenuItem value="WEB">Web</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>활성 상태</InputLabel>
            <Select
              value={activeFilter}
              label="활성 상태"
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="true">활성</MenuItem>
              <MenuItem value="false">비활성</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSearch} disabled={loading}>
              검색
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!userIdFilter && !platformFilter && !activeFilter}
            >
              초기화
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTokens}
              disabled={loading}
            >
              새로고침
            </Button>
          </Box>
        </Box>

        {/* 테이블 */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={tokens}
            columns={columns}
            getRowId={(row) => row.token_id}
            loading={loading}
            rowCount={totalElements}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
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
            localeText={{
              noRowsLabel: '등록된 푸시 토큰이 없습니다',
            }}
          />
        </Box>
      </Box>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>푸시 토큰 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 푸시 토큰을 삭제하시겠습니까?</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            삭제된 토큰은 복구할 수 없으며, 푸시 알림을 받을 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button
            onClick={() => tokenToDelete && handleDelete(tokenToDelete)}
            color="error"
            variant="contained"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
