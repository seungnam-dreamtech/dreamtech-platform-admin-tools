// 알림 이력 조회 페이지

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  InfoOutlined,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { notificationService } from '../../services/notificationService';
import type {
  NotificationHistoryResponse,
  NotificationType,
  NotificationStatus,
} from '../../types/notification';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function NotificationHistory() {
  const [histories, setHistories] = useState<NotificationHistoryResponse[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<NotificationHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [searchedUserId, setSearchedUserId] = useState('');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'ALL'>('ALL');
  const snackbar = useSnackbar();

  // 알림 이력 목록 조회
  const fetchHistories = async (targetUserId: string) => {
    if (!targetUserId.trim()) {
      snackbar.warning('사용자 ID를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const data = await notificationService.listNotificationHistories(targetUserId);
      console.log('📋 Notification Histories fetched:', data);
      setHistories(data);
      setFilteredHistories(data);
      setSearchedUserId(targetUserId);
    } catch (error) {
      snackbar.error('알림 이력 조회에 실패했습니다');
      console.error('Failed to fetch notification histories:', error);
      setHistories([]);
      setFilteredHistories([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    fetchHistories(userId);
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 필터링 적용
  useEffect(() => {
    let filtered = [...histories];

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((h) => h.notification_type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((h) => h.status === statusFilter);
    }

    setFilteredHistories(filtered);
  }, [typeFilter, statusFilter, histories]);

  // 알림 타입 색상
  const getTypeColor = (
    type: NotificationType
  ): 'primary' | 'success' | 'info' | 'warning' => {
    switch (type) {
      case 'WEB_PUSH':
        return 'warning';
      case 'MOBILE_PUSH':
        return 'success';
      case 'EMAIL':
        return 'info';
      default:
        return 'primary';
    }
  };

  // 알림 타입 라벨
  const getTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case 'WEB_PUSH':
        return '웹 푸시';
      case 'MOBILE_PUSH':
        return '모바일 푸시';
      case 'EMAIL':
        return '이메일';
      default:
        return type;
    }
  };

  // 상태 색상
  const getStatusColor = (status: NotificationStatus): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'NOTIFICATION_SUCCESS':
        return 'success';
      case 'TRANSFER_TO_PROVIDER':
        return 'warning';
      case 'NOTIFICATION_FAILED':
        return 'error';
      default:
        return 'warning';
    }
  };

  // 상태 라벨
  const getStatusLabel = (status: NotificationStatus): string => {
    switch (status) {
      case 'NOTIFICATION_SUCCESS':
        return '전송 성공';
      case 'TRANSFER_TO_PROVIDER':
        return '전송 중';
      case 'NOTIFICATION_FAILED':
        return '전송 실패';
      default:
        return status;
    }
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'request_id',
      headerName: '요청 ID',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<NotificationHistoryResponse>) => (
        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.row.request_id}
        </Typography>
      ),
    },
    {
      field: 'message_id',
      headerName: '메시지 ID',
      flex: 0.8,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<NotificationHistoryResponse>) => (
        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.row.message_id}
        </Typography>
      ),
    },
    {
      field: 'notification_type',
      headerName: '알림 타입',
      flex: 0.6,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<NotificationHistoryResponse>) => (
        <Chip
          label={getTypeLabel(params.row.notification_type)}
          color={getTypeColor(params.row.notification_type)}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: '전송 상태',
      flex: 0.6,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<NotificationHistoryResponse>) => (
        <Chip
          label={getStatusLabel(params.row.status)}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일시',
      flex: 0.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<NotificationHistoryResponse>) => (
        <Typography variant="caption" color="textSecondary">
          {new Date(params.row.created_at).toLocaleString('ko-KR')}
        </Typography>
      ),
    },
    {
      field: 'updated_at',
      headerName: '수정일시',
      flex: 0.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<NotificationHistoryResponse>) => (
        <Typography variant="caption" color="textSecondary">
          {new Date(params.row.updated_at).toLocaleString('ko-KR')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          알림 이력 조회 {searchedUserId && `(${filteredHistories.length}건)`}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          사용자별 푸시 알림 및 이메일 전송 이력 조회
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
                onClick={() => fetchHistories(searchedUserId)}
                disabled={loading}
              >
                새로고침
              </Button>
            )}
          </Box>
        </Box>

        {/* 현재 조회 정보 및 필터 */}
        {searchedUserId && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={`조회 사용자: ${searchedUserId}`} color="primary" variant="outlined" size="small" />
            <Chip label={`전체: ${histories.length}건`} variant="outlined" size="small" />

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>알림 타입</InputLabel>
                <Select
                  value={typeFilter}
                  label="알림 타입"
                  onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'ALL')}
                >
                  <MenuItem value="ALL">전체</MenuItem>
                  <MenuItem value="WEB_PUSH">웹 푸시</MenuItem>
                  <MenuItem value="MOBILE_PUSH">모바일 푸시</MenuItem>
                  <MenuItem value="EMAIL">이메일</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>전송 상태</InputLabel>
                <Select
                  value={statusFilter}
                  label="전송 상태"
                  onChange={(e) => setStatusFilter(e.target.value as NotificationStatus | 'ALL')}
                >
                  <MenuItem value="ALL">전체</MenuItem>
                  <MenuItem value="NOTIFICATION_SUCCESS">전송 성공</MenuItem>
                  <MenuItem value="TRANSFER_TO_PROVIDER">전송 중</MenuItem>
                  <MenuItem value="NOTIFICATION_FAILED">전송 실패</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {/* 테이블 */}
        {searchedUserId ? (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredHistories}
              columns={columns}
              getRowId={(row) => row.request_id}
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
            />
          </Box>
        ) : (
          <Paper sx={{ p: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined color="info" />
              <Typography variant="body2" color="info.dark">
                사용자 ID를 입력하여 알림 이력을 조회하세요.
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
