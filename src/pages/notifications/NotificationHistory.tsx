// 알림 이력 조회 페이지 (Management API 사용)

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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import { notificationService } from '../../services/notificationService';
import type {
  NotificationHistoryManagementResponse,
  NotificationType,
  NotificationStatus,
} from '../../types/notification';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function NotificationHistory() {
  const [histories, setHistories] = useState<NotificationHistoryManagementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // 필터 상태
  const [userIdFilter, setUserIdFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | ''>('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const snackbar = useSnackbar();

  // 알림 이력 목록 조회
  const fetchHistories = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: ['created_at,desc'],
      };

      if (userIdFilter.trim()) params.userId = userIdFilter.trim();
      if (typeFilter) params.notificationType = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;

      const response = await notificationService.getAllNotificationHistories(params);
      console.log('📋 Notification Histories fetched:', response);
      setHistories(response.content);
      setTotalElements(response.total_elements);
    } catch (error) {
      snackbar.error('알림 이력 조회에 실패했습니다');
      console.error('Failed to fetch notification histories:', error);
      setHistories([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터/페이징 변경 시 재조회
  useEffect(() => {
    fetchHistories();
  }, [paginationModel.page, paginationModel.pageSize]);

  // 필터 초기화
  const handleClearFilters = () => {
    setUserIdFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchHistories();
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
      field: 'history_id',
      headerName: 'ID',
      flex: 0.3,
      minWidth: 80,
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.history_id}
        </Typography>
      ),
    },
    {
      field: 'user_id',
      headerName: '사용자 ID',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
        <Typography variant="body2">{params.row.user_id}</Typography>
      ),
    },
    {
      field: 'request_id',
      headerName: '요청 ID',
      flex: 0.8,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
        >
          {params.row.request_id}
        </Typography>
      ),
    },
    {
      field: 'message_id',
      headerName: '메시지 ID',
      flex: 0.8,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
        >
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
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
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
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
        <Chip
          label={getStatusLabel(params.row.status)}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: 'message_event',
      headerName: '이벤트',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.message_event || '-'}
        </Typography>
      ),
    },
    {
      field: 'error_code',
      headerName: '에러 코드',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
        <Typography variant="caption" color="error">
          {params.row.error_code || '-'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일시',
      flex: 0.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
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
      renderCell: (params: GridRenderCellParams<NotificationHistoryManagementResponse>) => (
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
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <HistoryIcon />
          알림 이력 조회 ({totalElements}건)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          전체 푸시 알림 및 이메일 전송 이력 조회
        </Typography>
      </Box>

      {/* 컨텐츠 영역 */}
      <Box>
        {/* 필터 영역 - 1행 */}
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
            <InputLabel>알림 타입</InputLabel>
            <Select
              value={typeFilter}
              label="알림 타입"
              onChange={(e) => setTypeFilter(e.target.value as NotificationType | '')}
            >
              <MenuItem value="">전체</MenuItem>
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
              onChange={(e) => setStatusFilter(e.target.value as NotificationStatus | '')}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="NOTIFICATION_SUCCESS">전송 성공</MenuItem>
              <MenuItem value="TRANSFER_TO_PROVIDER">전송 중</MenuItem>
              <MenuItem value="NOTIFICATION_FAILED">전송 실패</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="시작일"
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            size="small"
            sx={{ width: 160 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="종료일"
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            size="small"
            sx={{ width: 160 }}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSearch} disabled={loading}>
              검색
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={
                !userIdFilter &&
                !typeFilter &&
                !statusFilter &&
                !startDateFilter &&
                !endDateFilter
              }
            >
              초기화
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchHistories}
              disabled={loading}
            >
              새로고침
            </Button>
          </Box>
        </Box>

        {/* 테이블 */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={histories}
            columns={columns}
            getRowId={(row) => row.history_id}
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
              noRowsLabel: '알림 전송 이력이 없습니다',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
