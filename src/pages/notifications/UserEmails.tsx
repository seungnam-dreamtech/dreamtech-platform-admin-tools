// 이메일 관리 페이지 (Management API 사용)

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
  Edit as EditIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import { notificationService } from '../../services/notificationService';
import type { EmailManagementResponse, EmailUpdateRequest } from '../../types/notification';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function UserEmails() {
  const [emails, setEmails] = useState<EmailManagementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // 필터 상태
  const [userIdFilter, setUserIdFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(''); // 'true', 'false', ''

  // 수정 다이얼로그
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [emailToEdit, setEmailToEdit] = useState<EmailManagementResponse | null>(null);
  const [editedEmail, setEditedEmail] = useState('');

  // 삭제 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<number | null>(null);

  const snackbar = useSnackbar();

  // 이메일 목록 조회
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: ['created_at,desc'],
      };

      if (userIdFilter.trim()) params.userId = userIdFilter.trim();
      if (activeFilter) params.isActive = activeFilter === 'true';

      const response = await notificationService.getAllEmails(params);
      console.log('📧 Emails fetched:', response);
      setEmails(response.content);
      setTotalElements(response.total_elements);
    } catch (error) {
      snackbar.error('이메일 목록 조회에 실패했습니다');
      console.error('Failed to fetch emails:', error);
      setEmails([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터/페이징 변경 시 재조회
  useEffect(() => {
    fetchEmails();
  }, [paginationModel.page, paginationModel.pageSize]);

  // 이메일 수정 다이얼로그 열기
  const openEditDialog = (email: EmailManagementResponse) => {
    setEmailToEdit(email);
    setEditedEmail(email.email);
    setEditDialogOpen(true);
  };

  // 이메일 수정
  const handleUpdateEmail = async () => {
    if (!emailToEdit) return;

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail)) {
      snackbar.warning('올바른 이메일 형식이 아닙니다');
      return;
    }

    if (editedEmail === emailToEdit.email) {
      snackbar.warning('변경사항이 없습니다');
      return;
    }

    try {
      const updateData: EmailUpdateRequest = {
        email: editedEmail,
      };
      await notificationService.updateEmail(emailToEdit.email_id, updateData);
      snackbar.success('이메일이 수정되었습니다');
      fetchEmails();
    } catch (error) {
      snackbar.error('이메일 수정에 실패했습니다');
      console.error('Failed to update email:', error);
    } finally {
      setEditDialogOpen(false);
      setEmailToEdit(null);
    }
  };

  // 이메일 삭제
  const handleDelete = async (emailId: number) => {
    try {
      await notificationService.deleteEmailManagement(emailId);
      snackbar.success('이메일이 삭제되었습니다');
      fetchEmails();
    } catch (error) {
      snackbar.error('이메일 삭제에 실패했습니다');
      console.error('Failed to delete email:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setEmailToDelete(null);
    }
  };

  const confirmDelete = (emailId: number) => {
    setEmailToDelete(emailId);
    setDeleteConfirmOpen(true);
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setUserIdFilter('');
    setActiveFilter('');
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchEmails();
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'email_id',
      headerName: '이메일 ID',
      flex: 0.4,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<EmailManagementResponse>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.email_id}
        </Typography>
      ),
    },
    {
      field: 'user_id',
      headerName: '사용자 ID',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<EmailManagementResponse>) => (
        <Typography variant="body2">{params.row.user_id}</Typography>
      ),
    },
    {
      field: 'email',
      headerName: '이메일 주소',
      flex: 1.2,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<EmailManagementResponse>) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {params.row.email}
        </Typography>
      ),
    },
    {
      field: 'is_active',
      headerName: '활성 상태',
      flex: 0.5,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<EmailManagementResponse>) => (
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
      renderCell: (params: GridRenderCellParams<EmailManagementResponse>) => (
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
      renderCell: (params: GridRenderCellParams<EmailManagementResponse>) => (
        <Typography variant="caption" color="textSecondary">
          {new Date(params.row.created_at).toLocaleString('ko-KR')}
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
      renderCell: (params: GridRenderCellParams<EmailManagementResponse>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => openEditDialog(params.row)}
            title="이메일 수정"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => confirmDelete(params.row.email_id)}
            title="이메일 삭제"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          이메일 관리 ({totalElements}개)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          전체 사용자 알림 수신 이메일 관리
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
              disabled={!userIdFilter && !activeFilter}
            >
              초기화
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchEmails}
              disabled={loading}
            >
              새로고침
            </Button>
          </Box>
        </Box>

        {/* 테이블 */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={emails}
            columns={columns}
            getRowId={(row) => row.email_id}
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
              noRowsLabel: '등록된 이메일이 없습니다',
            }}
          />
        </Box>
      </Box>

      {/* 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon />
            이메일 수정
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              사용자 ID: {emailToEdit?.user_id}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="이메일 주소"
              type="email"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              placeholder="example@domain.com"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleUpdateEmail}
            variant="contained"
            disabled={!editedEmail.trim() || editedEmail === emailToEdit?.email}
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>이메일 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 이메일을 삭제하시겠습니까?</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            삭제된 이메일은 복구할 수 없으며, 알림을 받을 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button
            onClick={() => emailToDelete && handleDelete(emailToDelete)}
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
