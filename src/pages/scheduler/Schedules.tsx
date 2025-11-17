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
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import type { Task, Schedule, ScheduleType } from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';
import { ScheduleFormModal } from '../../components/scheduler/ScheduleFormModal';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<ScheduleType | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const snackbar = useSnackbar();

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = schedules;

    // 타입 필터
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((s) => s.schedule_type === typeFilter);
    }

    // 검색 필터
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.description?.toLowerCase().includes(keyword) ||
          s.schedule_group?.toLowerCase().includes(keyword)
      );
    }

    setFilteredSchedules(filtered);
  }, [searchText, typeFilter, schedules]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, tasksData] = await Promise.all([
        schedulerService.getSchedules(),
        schedulerService.getTasks(),
      ]);

      // Task 정보를 Schedule에 매핑
      const schedulesWithTask = schedulesData.map((schedule) => ({
        ...schedule,
        task: tasksData.find((task) => task.id === schedule.task_id),
      }));

      setSchedules(schedulesWithTask);
      setTasks(tasksData);
      setFilteredSchedules(schedulesWithTask);
    } catch (error: any) {
      console.error('Failed to load schedules:', error);
      snackbar.error('스케쥴 목록 조회에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(undefined);
    setModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

  const confirmDelete = (schedule: Schedule) => {
    setScheduleToDelete(schedule);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await schedulerService.deleteSchedule(scheduleToDelete.id);
      snackbar.success('스케쥴이 삭제되었습니다');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete schedule:', error);
      snackbar.error(error.message || '스케쥴 삭제에 실패했습니다');
    } finally {
      setDeleteConfirmOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleModalSave = () => {
    setModalOpen(false);
    loadData();
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedSchedule(undefined);
  };

  const getScheduleStatus = (
    schedule: Schedule
  ): { text: string; color: 'default' | 'primary' | 'success' | 'error' | 'info' | 'warning' } => {
    if (schedule.deleted_at) {
      return { text: '삭제됨', color: 'error' };
    }

    const now = dayjs();
    const start = dayjs(schedule.start_at);
    const end = dayjs(schedule.end_at);

    if (now.isBefore(start)) {
      return { text: '대기중', color: 'info' };
    } else if (now.isAfter(end)) {
      return { text: '종료됨', color: 'default' };
    } else {
      return { text: '실행중', color: 'success' };
    }
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: '스케쥴명',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Typography variant="body2" fontWeight={600}>
          {params.row.name}
        </Typography>
      ),
    },
    {
      field: 'task',
      headerName: '작업 클래스',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Typography variant="body2">
          {params.row.task?.name || '-'}
        </Typography>
      ),
    },
    {
      field: 'schedule_type',
      headerName: '타입',
      flex: 0.4,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Chip
          label={params.row.schedule_type}
          color={params.row.schedule_type === 'CRON' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'schedule',
      headerName: '스케쥴 표현식',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        >
          {params.row.schedule || '-'}
        </Typography>
      ),
    },
    {
      field: 'schedule_group',
      headerName: '그룹',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.schedule_group || '-'}
        </Typography>
      ),
    },
    {
      field: 'period',
      headerName: '실행 기간',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Box>
          <Typography variant="caption" display="block">
            시작: {dayjs(params.row.start_at).format('YYYY-MM-DD HH:mm')}
          </Typography>
          <Typography variant="caption" display="block">
            종료: {dayjs(params.row.end_at).format('YYYY-MM-DD HH:mm')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'retry_count',
      headerName: '재시도',
      flex: 0.3,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Typography variant="body2">{params.row.retry_count ?? 0}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 0.4,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Schedule>) => {
        const status = getScheduleStatus(params.row);
        return <Chip label={status.text} color={status.color} size="small" />;
      },
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.5,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="수정">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(params.row)}
                disabled={!!params.row.deleted_at}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="삭제">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={() => confirmDelete(params.row)}
                disabled={!!params.row.deleted_at}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h4">스케쥴 관리</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          등록된 작업 클래스의 실행 스케쥴을 관리합니다.
        </Typography>
      </Box>

      {/* 필터 및 액션 */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            placeholder="스케쥴명, 그룹 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>타입</InputLabel>
            <Select
              value={typeFilter}
              label="타입"
              onChange={(e) => setTypeFilter(e.target.value as ScheduleType | 'ALL')}
            >
              <MenuItem value="ALL">전체 타입</MenuItem>
              <MenuItem value="CRON">CRON</MenuItem>
              <MenuItem value="EVENT">EVENT</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="새로고침">
            <IconButton onClick={loadData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          스케쥴 등록
        </Button>
      </Box>

      {/* 테이블 */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredSchedules}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Box>

      {/* 스케쥴 등록/수정 모달 */}
      <ScheduleFormModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onSave={handleModalSave}
        schedule={selectedSchedule}
        tasks={tasks}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>스케쥴 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            스케쥴 <strong>{scheduleToDelete?.name}</strong>을(를) 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            ⚠️ 스케쥴이 즉시 해제되어 더 이상 실행되지 않습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
