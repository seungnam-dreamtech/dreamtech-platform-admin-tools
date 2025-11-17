// 사용자 이메일 관리 페이지

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  InfoOutlined,
} from '@mui/icons-material';
import { notificationService } from '../../services/notificationService';
import type { EmailResponse, EmailRegistrationRequest } from '../../types/notification';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function UserEmails() {
  const [userId, setUserId] = useState('');
  const [searchedUserId, setSearchedUserId] = useState('');
  const [emailData, setEmailData] = useState<EmailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const snackbar = useSnackbar();

  // 이메일 정보 조회
  const fetchEmail = async (targetUserId: string) => {
    if (!targetUserId.trim()) {
      snackbar.warning('사용자 ID를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const data = await notificationService.getUserEmail(targetUserId);
      console.log('📧 User Email fetched:', data);
      setEmailData(data);
      setSearchedUserId(targetUserId);
      setNewEmail(data?.email || '');
      setEditMode(false);
    } catch (error) {
      snackbar.error('이메일 정보 조회에 실패했습니다');
      console.error('Failed to fetch user email:', error);
      setEmailData(null);
      setSearchedUserId(targetUserId);
      setNewEmail('');
    } finally {
      setLoading(false);
    }
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    fetchEmail(userId);
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 이메일 등록/수정
  const handleSaveEmail = async () => {
    if (!searchedUserId) return;
    if (!newEmail.trim()) {
      snackbar.warning('이메일 주소를 입력해주세요');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      snackbar.warning('올바른 이메일 형식이 아닙니다');
      return;
    }

    setLoading(true);
    try {
      const request: EmailRegistrationRequest = {
        email: newEmail,
      };
      await notificationService.registerEmail(searchedUserId, request);
      snackbar.success(emailData ? '이메일이 수정되었습니다' : '이메일이 등록되었습니다');
      fetchEmail(searchedUserId);
    } catch (error) {
      snackbar.error('이메일 저장에 실패했습니다');
      console.error('Failed to save email:', error);
    } finally {
      setLoading(false);
    }
  };

  // 이메일 비활성화
  const handleDeleteEmail = async () => {
    if (!searchedUserId) return;

    setLoading(true);
    try {
      await notificationService.deactivateUserEmail(searchedUserId);
      snackbar.success('이메일이 비활성화되었습니다');
      fetchEmail(searchedUserId);
    } catch (error) {
      snackbar.error('이메일 비활성화에 실패했습니다');
      console.error('Failed to deactivate email:', error);
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  // 수정 모드 진입
  const handleEditMode = () => {
    setEditMode(true);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setNewEmail(emailData?.email || '');
    setEditMode(false);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          이메일 관리
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          사용자별 알림 수신 이메일 관리 (사용자당 1개)
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
          </Box>
        </Box>

        {/* 현재 조회 정보 */}
        {searchedUserId && (
          <Box sx={{ mb: 2 }}>
            <Chip label={`조회 사용자: ${searchedUserId}`} color="primary" variant="outlined" size="small" />
          </Box>
        )}

        {/* 이메일 정보 카드 */}
        {searchedUserId && (
          <Paper sx={{ p: 3 }}>
            {emailData ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon />
                    등록된 이메일
                  </Typography>
                  <Chip
                    label={emailData.is_active ? '활성' : '비활성'}
                    color={emailData.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="caption" color="textSecondary">
                        이메일 ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {emailData.email_id}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="caption" color="textSecondary">
                        사용자 ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {emailData.user_id}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      이메일 주소
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="이메일 주소를 입력하세요"
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {emailData.email}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="caption" color="textSecondary">
                        마지막 사용
                      </Typography>
                      <Typography variant="body2">
                        {emailData.last_used_at
                          ? new Date(emailData.last_used_at).toLocaleString('ko-KR')
                          : '-'}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="caption" color="textSecondary">
                        등록일시
                      </Typography>
                      <Typography variant="body2">
                        {new Date(emailData.created_at).toLocaleString('ko-KR')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {editMode ? (
                    <>
                      <Button variant="outlined" onClick={handleCancelEdit}>
                        취소
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={handleSaveEmail}
                        disabled={loading || newEmail === emailData.email}
                      >
                        저장
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditMode}
                        disabled={!emailData.is_active}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={!emailData.is_active}
                      >
                        비활성화
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <EmailIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  등록된 이메일이 없습니다
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  새 이메일을 등록하시겠습니까?
                </Typography>

                <TextField
                  label="이메일 주소"
                  placeholder="example@domain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  size="small"
                  sx={{ width: 300, mb: 2 }}
                />

                <Box>
                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={handleSaveEmail}
                    disabled={loading || !newEmail.trim()}
                  >
                    이메일 등록
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* 안내 메시지 */}
        {!searchedUserId && (
          <Paper sx={{ p: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined color="info" />
              <Typography variant="body2" color="info.dark">
                사용자 ID를 입력하여 이메일 정보를 조회하세요.
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>이메일 비활성화</DialogTitle>
        <DialogContent>
          <Typography>이 이메일을 비활성화하시겠습니까?</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            비활성화된 이메일은 알림을 받을 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button onClick={handleDeleteEmail} color="error" variant="contained">
            비활성화
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
