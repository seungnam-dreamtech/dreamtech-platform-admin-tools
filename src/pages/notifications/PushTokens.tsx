// 푸시 토큰 관리 페이지

import { useState } from 'react';
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
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Smartphone as SmartphoneIcon,
  InfoOutlined,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { notificationService } from '../../services/notificationService';
import type { TokenResponse, PlatformType } from '../../types/notification';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function PushTokens() {
  const [tokens, setTokens] = useState<TokenResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [searchedUserId, setSearchedUserId] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<number | null>(null);
  const [activeTokenCount, setActiveTokenCount] = useState<number>(0);
  const snackbar = useSnackbar();

  // 푸시 토큰 목록 조회
  const fetchTokens = async (targetUserId: string) => {
    if (!targetUserId.trim()) {
      snackbar.warning('사용자 ID를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const data = await notificationService.getUserTokens(targetUserId);
      console.log('📋 Push Tokens fetched:', data);
      setTokens(data);
      setSearchedUserId(targetUserId);

      // 활성 토큰 개수 조회
      const count = await notificationService.getActiveTokenCount(targetUserId);
      setActiveTokenCount(count);
    } catch (error) {
      snackbar.error('푸시 토큰 목록 조회에 실패했습니다');
      console.error('Failed to fetch push tokens:', error);
      setTokens([]);
      setActiveTokenCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    fetchTokens(userId);
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 토큰 삭제
  const handleDelete = async (tokenId: number) => {
    if (!searchedUserId) return;

    try {
      await notificationService.deactivateToken(searchedUserId, tokenId);
      snackbar.success('푸시 토큰이 비활성화되었습니다');
      fetchTokens(searchedUserId);
    } catch (error) {
      snackbar.error('푸시 토큰 비활성화에 실패했습니다');
      console.error('Failed to deactivate token:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setTokenToDelete(null);
    }
  };

  const confirmDelete = (tokenId: number) => {
    setTokenToDelete(tokenId);
    setDeleteConfirmOpen(true);
  };

  // 플랫폼 타입 색상 매핑
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
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.token_id}
        </Typography>
      ),
    },
    {
      field: 'platform_type',
      headerName: '플랫폼',
      flex: 0.5,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
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
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
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
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
        <Typography variant="body2">{params.row.device_name || '-'}</Typography>
      ),
    },
    {
      field: 'app_version',
      headerName: '앱 버전',
      flex: 0.5,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
        <Typography variant="body2" color="textSecondary">{params.row.app_version || '-'}</Typography>
      ),
    },
    {
      field: 'is_active',
      headerName: '활성 상태',
      flex: 0.5,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
        <Chip
          label={params.row.is_active ? '활성' : '비활성'}
          color={params.row.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'last_used_at',
      headerName: '마지막 사용',
      flex: 0.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.last_used_at
            ? new Date(params.row.last_used_at).toLocaleString('ko-KR')
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: '등록일시',
      flex: 0.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
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
      renderCell: (params: GridRenderCellParams<TokenResponse>) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => confirmDelete(params.row.token_id)}
          disabled={!params.row.is_active}
          title="토큰 비활성화"
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
          푸시 토큰 관리 {searchedUserId && `(${activeTokenCount}개 활성)`}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          사용자별 푸시 알림 토큰 관리
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 검색 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="사용자 ID를 입력하세요"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{ width: 400 }}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                endAdornment: userId && (
                  <IconButton size="small" onClick={() => setUserId('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading || !userId.trim()}
            >
              조회
            </Button>
            {searchedUserId && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => fetchTokens(searchedUserId)}
                disabled={loading}
              >
                새로고침
              </Button>
            )}
          </Box>
        </Box>

        {/* 현재 조회 정보 */}
        {searchedUserId && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Chip label={`조회 사용자: ${searchedUserId}`} color="primary" variant="outlined" size="small" />
            <Chip label={`전체: ${tokens.length}개`} variant="outlined" size="small" />
          </Box>
        )}

        {/* 테이블 또는 안내 메시지 */}
        {searchedUserId ? (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={tokens}
              columns={columns}
              getRowId={(row) => row.token_id}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
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
              localeText={{
                noRowsLabel: '등록된 푸시 토큰이 없습니다',
              }}
            />
          </Box>
        ) : (
          <Paper sx={{ p: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined color="info" />
              <Typography variant="body2" color="info.dark">
                사용자 ID를 입력하여 푸시 토큰을 조회하세요.
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>푸시 토큰 비활성화</DialogTitle>
        <DialogContent>
          <Typography>이 푸시 토큰을 비활성화하시겠습니까?</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            비활성화된 토큰은 푸시 알림을 받을 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button
            onClick={() => tokenToDelete && handleDelete(tokenToDelete)}
            color="error"
            variant="contained"
          >
            비활성화
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
