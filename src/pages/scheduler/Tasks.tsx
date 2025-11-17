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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { Task } from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';
import { TaskFormModal } from '../../components/scheduler/TaskFormModal';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const snackbar = useSnackbar();

  // 초기 데이터 로드
  useEffect(() => {
    loadTasks();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const keyword = searchText.toLowerCase();
    const filtered = tasks.filter(
      (task) =>
        task.name.toLowerCase().includes(keyword) ||
        task.task_class_name.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword)
    );
    setFilteredTasks(filtered);
  }, [searchText, tasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await schedulerService.getTasks();
      setTasks(data);
      setFilteredTasks(data);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      snackbar.error('작업 목록 조회에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTask(undefined);
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const confirmDelete = (task: Task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      await schedulerService.deleteTask(taskToDelete.id);
      snackbar.success('작업 클래스가 삭제되었습니다');
      loadTasks();
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      snackbar.error(error.message || '작업 클래스 삭제에 실패했습니다');
    } finally {
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleModalSave = () => {
    setModalOpen(false);
    loadTasks();
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedTask(undefined);
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: '작업명',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <Typography variant="body2" fontWeight={600}>
          {params.row.name}
        </Typography>
      ),
    },
    {
      field: 'task_class_name',
      headerName: '작업 클래스명',
      flex: 1.5,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: 'primary.main',
          }}
        >
          {params.row.task_class_name}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <Typography variant="body2" color="textSecondary">
          {params.row.description || '-'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일시',
      flex: 0.8,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <Typography variant="caption" color="textSecondary">
          {new Date(params.row.created_at).toLocaleString('ko-KR')}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 0.4,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Task>) => (
        <Chip
          label={params.row.deleted_at ? '삭제됨' : '활성'}
          color={params.row.deleted_at ? 'error' : 'success'}
          size="small"
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
      renderCell: (params: GridRenderCellParams<Task>) => (
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
        <Typography variant="h4" gutterBottom>
          작업 클래스 관리
        </Typography>
        <Typography variant="body2" color="textSecondary">
          스케쥴러를 통해 실행될 배치 작업 클래스를 관리합니다.
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
            placeholder="작업명, 클래스명 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <Tooltip title="새로고침">
            <IconButton onClick={loadTasks} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          작업 클래스 등록
        </Button>
      </Box>

      {/* 테이블 */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTasks}
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

      {/* 작업 등록/수정 모달 */}
      <TaskFormModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onSave={handleModalSave}
        task={selectedTask}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>작업 클래스 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            작업 클래스 <strong>{taskToDelete?.name}</strong>을(를) 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            ⚠️ 이 작업에 연결된 스케쥴이 있는 경우 즉시 스케쥴이 해제됩니다.
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
