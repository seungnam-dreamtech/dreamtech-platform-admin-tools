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
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import { notificationService } from '../../services/notificationService';
import type { EmailManagementResponse, EmailUpdateRequest, EmailRegistrationRequest } from '../../types/notification';
import { userManagementService } from '../../services/userManagementService';
import type { PlatformUser } from '../../types/user-management';
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
  const [editedIsActive, setEditedIsActive] = useState(true);
  const [emailUserInfo, setEmailUserInfo] = useState<PlatformUser | null>(null);
  const [emailMismatch, setEmailMismatch] = useState(false);

  // 삭제 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<number | null>(null);

  // 이메일 등록 다이얼로그
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<PlatformUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [userInfo, setUserInfo] = useState<PlatformUser | null>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [emailEditable, setEmailEditable] = useState(false);

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
  const openEditDialog = async (email: EmailManagementResponse) => {
    setEmailToEdit(email);
    setEditedEmail(email.email);
    setEditedIsActive(email.is_active);
    setEmailMismatch(false);
    setEmailUserInfo(null);

    // 사용자 정보 조회하여 이메일 불일치 확인
    try {
      const user = await userManagementService.getUser(email.user_id);
      setEmailUserInfo(user);

      // 사용자 정보의 이메일과 알림 서비스의 이메일이 다른 경우
      if (user.email && user.email.trim() && user.email !== email.email) {
        setEmailMismatch(true);
        console.log(
          '⚠️ Email mismatch detected:',
          'User profile:',
          user.email,
          'Notification service:',
          email.email
        );
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // 사용자 정보 조회 실패해도 다이얼로그는 열림
    }

    setEditDialogOpen(true);
  };

  // 사용자 정보의 이메일로 동기화
  const handleSyncEmail = () => {
    if (emailUserInfo && emailUserInfo.email) {
      setEditedEmail(emailUserInfo.email);
      setEmailMismatch(false);
      snackbar.info('사용자 정보의 이메일로 동기화되었습니다');
    }
  };

  // 이메일 수정
  const handleUpdateEmail = async () => {
    if (!emailToEdit) return;

    // 이메일 주소 또는 활성화 상태가 변경되었는지 확인
    const emailChanged = editedEmail !== emailToEdit.email;
    const activeChanged = editedIsActive !== emailToEdit.is_active;

    if (!emailChanged && !activeChanged) {
      snackbar.warning('변경사항이 없습니다');
      return;
    }

    // 이메일 주소가 변경된 경우 형식 검증
    if (emailChanged) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedEmail)) {
        snackbar.warning('올바른 이메일 형식이 아닙니다');
        return;
      }
    }

    try {
      const updateData: EmailUpdateRequest = {};

      if (emailChanged) {
        updateData.email = editedEmail;
      }

      if (activeChanged) {
        updateData.is_active = editedIsActive;
      }

      await notificationService.updateEmail(emailToEdit.email_id, updateData);

      if (emailChanged && activeChanged) {
        snackbar.success('이메일과 활성화 상태가 수정되었습니다');
      } else if (emailChanged) {
        snackbar.success('이메일이 수정되었습니다');
      } else {
        snackbar.success(`알림이 ${editedIsActive ? '활성화' : '비활성화'}되었습니다`);
      }

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

  // 이메일 등록 다이얼로그 열기
  const openRegisterDialog = () => {
    setRegisterDialogOpen(true);
    setSearchKeyword('');
    setSearchResults([]);
    setSelectedUserId('');
    setRegisterEmail('');
    setUserInfo(null);
    setEmailEditable(false);
  };

  // 사용자 검색 (ID 또는 이름)
  const handleSearchUsers = async () => {
    if (!searchKeyword.trim()) {
      snackbar.warning('사용자 ID 또는 이름을 입력해주세요');
      return;
    }

    setUserInfoLoading(true);
    setSearchResults([]);
    setUserInfo(null);
    setSelectedUserId('');

    try {
      // 1. 먼저 정확한 ID로 조회 시도
      try {
        const user = await userManagementService.getUser(searchKeyword.trim());
        console.log('👤 User found by ID:', user);
        setSearchResults([user]);
        setSelectedUserId(user.id);
        handleSelectUser(user);
        return;
      } catch (idError) {
        console.log('User not found by ID, searching by keyword...');
      }

      // 2. ID로 찾지 못하면 keyword로 검색 (이름, 이메일)
      const users = await userManagementService.getUsers({ keyword: searchKeyword.trim() });
      console.log('👥 Users found by keyword:', users);

      if (users.length === 0) {
        snackbar.warning('검색 결과가 없습니다');
        setSearchResults([]);
      } else if (users.length === 1) {
        // 한 명만 검색되면 자동 선택
        setSearchResults(users);
        setSelectedUserId(users[0].id);
        handleSelectUser(users[0]);
        snackbar.success('사용자를 찾았습니다');
      } else {
        // 여러 명 검색되면 선택 리스트 표시
        setSearchResults(users);
        snackbar.info(`${users.length}명의 사용자를 찾았습니다. 선택해주세요`);
      }
    } catch (error) {
      snackbar.error('사용자 검색에 실패했습니다');
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setUserInfoLoading(false);
    }
  };

  // 사용자 선택
  const handleSelectUser = (user: PlatformUser) => {
    setUserInfo(user);
    setSelectedUserId(user.id);

    // 사용자 정보에 이메일이 있으면 자동으로 채우고 수정 불가
    if (user.email && user.email.trim()) {
      setRegisterEmail(user.email);
      setEmailEditable(false);
      snackbar.info('사용자 정보에서 이메일을 가져왔습니다');
    } else {
      // 이메일이 없으면 수동 입력 가능
      setRegisterEmail('');
      setEmailEditable(true);
      snackbar.warning('사용자 정보에 이메일이 없습니다. 직접 입력해주세요');
    }
  };

  // 이메일 등록
  const handleRegisterEmail = async () => {
    if (!userInfo || !selectedUserId) {
      snackbar.warning('먼저 사용자를 검색하고 선택해주세요');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      snackbar.warning('올바른 이메일 형식이 아닙니다');
      return;
    }

    setLoading(true);
    try {
      // 1. 알림 서비스에 이메일 등록
      const emailData: EmailRegistrationRequest = {
        email: registerEmail,
      };
      await notificationService.registerEmail(selectedUserId, emailData);
      snackbar.success('이메일이 등록되었습니다');

      // 2. 사용자 정보에 이메일이 없었다면 사용자 정보에도 업데이트
      if (emailEditable && (!userInfo.email || !userInfo.email.trim())) {
        try {
          await userManagementService.updateUser(selectedUserId, {
            email: registerEmail,
          });
          snackbar.success('사용자 정보에 이메일이 저장되었습니다');
        } catch (error) {
          console.error('Failed to update user email:', error);
          snackbar.warning('알림 서비스에는 등록되었으나, 사용자 정보 업데이트에 실패했습니다');
        }
      }

      fetchEmails();
      setRegisterDialogOpen(false);
    } catch (error) {
      snackbar.error('이메일 등록에 실패했습니다');
      console.error('Failed to register email:', error);
    } finally {
      setLoading(false);
    }
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

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openRegisterDialog}
            >
              이메일 등록
            </Button>
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
            <EditIcon />
            이메일 정보 수정
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* 사용자 정보 */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              사용자 ID: {emailToEdit?.user_id}
            </Typography>
            {emailUserInfo && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                사용자 이름: {emailUserInfo.name}
              </Typography>
            )}

            {/* 이메일 불일치 경고 */}
            {emailMismatch && emailUserInfo && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  ⚠️ 사용자 프로필의 이메일과 불일치합니다
                </Typography>
                <Typography variant="caption" display="block">
                  알림 서비스: {emailToEdit?.email}
                </Typography>
                <Typography variant="caption" display="block">
                  사용자 프로필: {emailUserInfo.email}
                </Typography>
                <Button size="small" variant="outlined" onClick={handleSyncEmail} sx={{ mt: 1 }}>
                  사용자 프로필 이메일로 동기화
                </Button>
              </Alert>
            )}

            {/* 알림 수신 활성화 상태 */}
            <FormControlLabel
              control={
                <Switch
                  checked={editedIsActive}
                  onChange={(e) => setEditedIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2">알림 수신 활성화</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {editedIsActive
                      ? '이메일로 알림을 수신합니다'
                      : '이메일 알림을 받지 않습니다'}
                  </Typography>
                </Box>
              }
              sx={{ mt: 2, mb: 2 }}
            />

            {/* 이메일 주소 */}
            <TextField
              fullWidth
              label="이메일 주소"
              type="email"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              placeholder="example@domain.com"
              disabled={!emailMismatch}
              helperText={
                emailMismatch
                  ? '사용자 프로필과 불일치하여 수정 가능합니다'
                  : '이메일 주소는 사용자 프로필과 일치할 때 자동으로 잠깁니다'
              }
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleUpdateEmail}
            variant="contained"
            disabled={
              !editedEmail.trim() ||
              (editedEmail === emailToEdit?.email && editedIsActive === emailToEdit?.is_active)
            }
          >
            저장
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

      {/* 이메일 등록 다이얼로그 */}
      <Dialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            이메일 수동 등록
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              회원 가입 시 이벤트 실패로 이메일이 등록되지 않은 경우 사용합니다.
            </Typography>

            {/* 사용자 검색 */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="사용자 ID 또는 이름"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="사용자 ID 또는 이름을 입력하세요"
                disabled={!!userInfo}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
              />
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={handleSearchUsers}
                disabled={!searchKeyword.trim() || userInfoLoading || !!userInfo}
                sx={{ mt: 1 }}
              >
                {userInfoLoading ? '검색 중...' : '사용자 검색'}
              </Button>
            </Box>

            {/* 검색 결과 리스트 (여러 명인 경우) */}
            {searchResults.length > 1 && !userInfo && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  검색 결과 ({searchResults.length}명)
                </Typography>
                <List
                  sx={{
                    maxHeight: 300,
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  {searchResults.map((user, index) => (
                    <Box key={user.id}>
                      {index > 0 && <Divider />}
                      <ListItemButton
                        selected={selectedUserId === user.id}
                        onClick={() => handleSelectUser(user)}
                      >
                        <ListItemText
                          primary={user.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                ID: {user.id}
                              </Typography>
                              {' • '}
                              <Typography component="span" variant="body2">
                                이메일: {user.email || '(없음)'}
                              </Typography>
                            </>
                          }
                        />
                      </ListItemButton>
                    </Box>
                  ))}
                </List>
              </Box>
            )}

            {/* 선택된 사용자 정보 표시 */}
            {userInfo && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  선택된 사용자 정보
                </Typography>
                <Typography variant="body2">ID: {userInfo.id}</Typography>
                <Typography variant="body2">이름: {userInfo.name}</Typography>
                <Typography variant="body2">
                  기존 이메일: {userInfo.email || '(없음)'}
                </Typography>
                {!userInfo.email && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                    ⚠ 사용자 정보에 이메일이 없습니다. 등록 시 사용자 정보에도 저장됩니다.
                  </Typography>
                )}
                <Button
                  size="small"
                  onClick={() => {
                    setUserInfo(null);
                    setSelectedUserId('');
                    setRegisterEmail('');
                    setSearchResults([]);
                  }}
                  sx={{ mt: 1 }}
                >
                  다시 검색
                </Button>
              </Box>
            )}

            {/* 이메일 주소 입력 */}
            {userInfo && (
              <TextField
                fullWidth
                label="이메일 주소"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="example@domain.com"
                disabled={!emailEditable}
                sx={{ mt: 2 }}
                helperText={
                  !emailEditable
                    ? '사용자 정보에서 가져온 이메일입니다'
                    : '사용자 정보에 이메일이 없어 직접 입력 가능합니다'
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleRegisterEmail}
            variant="contained"
            disabled={!userInfo || !registerEmail.trim() || loading}
          >
            등록
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
