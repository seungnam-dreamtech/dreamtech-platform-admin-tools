// 감사 로그 조회 페이지

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Drawer,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  TodayOutlined as TodayIcon,
  Security as SecurityIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import type {
  AuditEvent,
  AuditEventFilter,
  AuditEventType,
  ActorType,
  SecurityLevel,
  EventStatus,
} from '../../types/user-management';
import { AuditLogDetailDrawer } from '../../components/audit/AuditLogDetailDrawer';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function AuditLogs() {
  const snackbar = useSnackbar();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // 필터 상태
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'recent' | 'security' | 'failures'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState<AuditEventType[]>([]);
  const [selectedActorType, setSelectedActorType] = useState<ActorType | ''>('');
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState<SecurityLevel | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | ''>('');
  const [securityEventsOnly, setSecurityEventsOnly] = useState(false);

  // 상세 보기
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  // 감사 로그 조회
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let response;

      if (quickFilter === 'today') {
        response = await userManagementService.getTodayAuditEvents({ page, size: pageSize });
      } else if (quickFilter === 'recent') {
        response = await userManagementService.getRecentAuditEvents(7, { page, size: pageSize });
      } else if (quickFilter === 'security') {
        response = await userManagementService.getSecurityEvents({ page, size: pageSize });
      } else if (quickFilter === 'failures') {
        response = await userManagementService.getFailureEvents({ page, size: pageSize });
      } else if (startDate && endDate) {
        // 날짜 범위 검색
        response = await userManagementService.getAuditEventsByTimeRange(
          startDate.toISOString(),
          endDate.toISOString(),
          { page, size: pageSize }
        );
      } else {
        // 필터 검색 또는 전체 조회
        const hasFilter =
          searchKeyword ||
          selectedEventTypes.length > 0 ||
          selectedActorType ||
          selectedSecurityLevel ||
          selectedStatus ||
          securityEventsOnly;

        if (hasFilter) {
          const filter: AuditEventFilter = {};
          if (searchKeyword) filter.description_keyword = searchKeyword;
          if (selectedEventTypes.length > 0) filter.event_types = selectedEventTypes;
          if (selectedActorType) filter.actor_type = selectedActorType;
          if (selectedSecurityLevel) filter.security_levels = [selectedSecurityLevel];
          if (selectedStatus) filter.status = selectedStatus;
          if (securityEventsOnly) filter.is_security_event = true;
          if (startDate) filter.start_time = startDate.toISOString();
          if (endDate) filter.end_time = endDate.toISOString();

          response = await userManagementService.searchAuditEvents(filter, { page, size: pageSize });
        } else {
          response = await userManagementService.getAllAuditEvents({ page, size: pageSize });
        }
      }

      setEvents(response.content || []);
      setTotalElements(response.total_elements || 0);
    } catch (error) {
      snackbar.error('감사 로그 조회에 실패했습니다');
      console.error('Failed to fetch audit logs:', error);
      setEvents([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, pageSize, quickFilter]);

  // 필터 초기화
  const handleClearFilters = () => {
    setQuickFilter('all');
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    setSelectedEventTypes([]);
    setSelectedActorType('');
    setSelectedSecurityLevel('');
    setSelectedStatus('');
    setSecurityEventsOnly(false);
  };

  // 보안 레벨 색상
  const getSecurityLevelColor = (level: SecurityLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'NORMAL':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  // 이벤트 상태 색상
  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILURE':
        return 'error';
      case 'PARTIAL':
        return 'warning';
      case 'PENDING':
        return 'info';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'event_timestamp',
      headerName: '시간',
      flex: 0.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Typography variant="caption" color="textSecondary">
          {new Date(params.row.event_timestamp).toLocaleString('ko-KR')}
        </Typography>
      ),
    },
    {
      field: 'security_level',
      headerName: '레벨',
      flex: 0.4,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Chip
          label={params.row.security_level}
          color={getSecurityLevelColor(params.row.security_level)}
          size="small"
        />
      ),
    },
    {
      field: 'event_type',
      headerName: '이벤트 타입',
      flex: 0.8,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Tooltip title={params.row.event_category || ''}>
          <Typography variant="body2" fontWeight={500}>
            {params.row.event_type}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'actor_username',
      headerName: '액터',
      flex: 0.7,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Box>
          <Typography variant="body2">{params.row.actor_username}</Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.actor_type}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'action',
      headerName: '액션',
      flex: 0.4,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Chip label={params.row.action} color="primary" variant="outlined" size="small" />
      ),
    },
    {
      field: 'target',
      headerName: '대상',
      flex: 0.7,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Box>
          <Typography variant="body2">{params.row.target_username || params.row.target_id}</Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.target_type}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 0.4,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Chip label={params.row.status} color={getStatusColor(params.row.status)} size="small" />
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.description}
        </Typography>
      ),
    },
    {
      field: 'ip_address',
      headerName: 'IP 주소',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.ip_address}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.3,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<AuditEvent>) => (
        <Tooltip title="상세 보기">
          <IconButton
            size="small"
            onClick={() => {
              setSelectedEvent(params.row);
              setDetailDrawerOpen(true);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ width: '100%' }}>
        {/* 페이지 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            감사 로그 ({totalElements.toLocaleString()}건)
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            시스템의 모든 감사 이벤트 조회 및 분석 (FDA 21 CFR Part 11 준수)
          </Typography>
        </Box>

        {/* 통계 카드 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TodayIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      오늘의 이벤트
                    </Typography>
                    <Typography variant="h6">-</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="warning" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      보안 이벤트
                    </Typography>
                    <Typography variant="h6">-</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon color="error" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      실패 이벤트
                    </Typography>
                    <Typography variant="h6">-</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon sx={{ color: 'error.dark' }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      중요 이벤트
                    </Typography>
                    <Typography variant="h6">-</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 빠른 필터 및 검색 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant={quickFilter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setQuickFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={quickFilter === 'today' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<TodayIcon />}
              onClick={() => setQuickFilter('today')}
            >
              오늘
            </Button>
            <Button
              variant={quickFilter === 'recent' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setQuickFilter('recent')}
            >
              최근 7일
            </Button>
            <Button
              variant={quickFilter === 'security' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<SecurityIcon />}
              onClick={() => setQuickFilter('security')}
            >
              보안 이벤트
            </Button>
            <Button
              variant={quickFilter === 'failures' ? 'contained' : 'outlined'}
              size="small"
              color="error"
              startIcon={<ErrorIcon />}
              onClick={() => setQuickFilter('failures')}
            >
              실패 이벤트
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="설명으로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                endAdornment: searchKeyword && (
                  <IconButton size="small" onClick={() => setSearchKeyword('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
            />
            <DatePicker
              label="종료일"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
            />
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterOpen(true)}>
              고급 필터
            </Button>
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchAuditLogs}>
              검색
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAuditLogs}>
              새로고침
            </Button>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters}>
              필터 초기화
            </Button>
          </Box>
        </Box>

        {/* 테이블 */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={events}
            columns={columns}
            getRowId={(row) => row.event_id}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={totalElements}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
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
          />
        </Box>

        {/* 상세 보기 Drawer */}
        <AuditLogDetailDrawer
          open={detailDrawerOpen}
          event={selectedEvent}
          onClose={() => {
            setDetailDrawerOpen(false);
            setSelectedEvent(null);
          }}
        />

        {/* 고급 필터 Drawer */}
        <Drawer
          anchor="right"
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          PaperProps={{ sx: { width: 400, p: 3 } }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            고급 필터
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>액터 타입</InputLabel>
            <Select
              value={selectedActorType}
              onChange={(e) => setSelectedActorType(e.target.value as ActorType)}
              label="액터 타입"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="USER">사용자</MenuItem>
              <MenuItem value="ADMIN">관리자</MenuItem>
              <MenuItem value="SYSTEM">시스템</MenuItem>
              <MenuItem value="SERVICE">서비스</MenuItem>
              <MenuItem value="CLIENT">클라이언트</MenuItem>
              <MenuItem value="ANONYMOUS">익명</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>보안 레벨</InputLabel>
            <Select
              value={selectedSecurityLevel}
              onChange={(e) => setSelectedSecurityLevel(e.target.value as SecurityLevel)}
              label="보안 레벨"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="LOW">낮음</MenuItem>
              <MenuItem value="NORMAL">보통</MenuItem>
              <MenuItem value="HIGH">높음</MenuItem>
              <MenuItem value="CRITICAL">중요</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>이벤트 상태</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as EventStatus)}
              label="이벤트 상태"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="SUCCESS">성공</MenuItem>
              <MenuItem value="FAILURE">실패</MenuItem>
              <MenuItem value="PARTIAL">부분</MenuItem>
              <MenuItem value="PENDING">대기</MenuItem>
              <MenuItem value="CANCELLED">취소</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setFilterOpen(false)}>
              닫기
            </Button>
            <Button fullWidth variant="contained" onClick={() => { fetchAuditLogs(); setFilterOpen(false); }}>
              적용
            </Button>
          </Box>
        </Drawer>
      </Box>
    </LocalizationProvider>
  );
}
