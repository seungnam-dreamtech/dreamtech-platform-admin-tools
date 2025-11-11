// OAuth2/OIDC 클라이언트 관리 페이지

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Api as ApiIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { OAuthClient, ClientType, UserTypeDefinition } from '../../types/user-management';
import {
  CLIENT_TYPE_OPTIONS,
  // GRANT_TYPE_OPTIONS, // TODO: 폼 구현 시 사용
  // COMMON_SCOPES, // TODO: 폼 구현 시 사용
  // MOCK_SERVICES, // TODO: 폼 구현 시 사용
} from '../../constants/user-management';
// import { ClientAuthorityTypesManager } from '../../components/oauth/ClientAuthorityTypesManager'; // TODO: 폼 구현 시 사용
import { userManagementService } from '../../services/userManagementService';
import { formatTokenDuration } from '../../utils/tokenUtils';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function OAuthClients() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<OAuthClient[]>([]);
  const [userTypeDefinitions, setUserTypeDefinitions] = useState<UserTypeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<OAuthClient | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterClientType, setFilterClientType] = useState<ClientType | 'ALL'>('ALL');
  const [filterEnabled, setFilterEnabled] = useState<'ALL' | 'enabled' | 'disabled'>('ALL');
  const snackbar = useSnackbar();

  // 삭제 확인 다이얼로그
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // User Type Definitions 조회
  const fetchUserTypeDefinitions = async () => {
    try {
      const data = await userManagementService.getUserTypeDefinitions();
      const activeTypes = data.filter(type => type.is_active);
      setUserTypeDefinitions(activeTypes);
    } catch (error) {
      snackbar.error('User Type 정의 조회에 실패했습니다');
      console.error(error);
    }
  };

  // 클라이언트 목록 조회 (비활성화된 것 포함)
  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getClients({ includeDeleted: true });
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      snackbar.error('OAuth 클라이언트 목록 조회에 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTypeDefinitions();
    fetchClients();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...clients];

    // Client Type 필터 (optional 필드이므로 존재 여부 체크)
    if (filterClientType !== 'ALL') {
      filtered = filtered.filter(client => client.client_type === filterClientType);
    }

    // Enabled 필터 (deleted_at 기반: null이면 활성, 값 있으면 비활성)
    if (filterEnabled !== 'ALL') {
      filtered = filtered.filter(client =>
        filterEnabled === 'enabled' ? !client.deleted_at : !!client.deleted_at
      );
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        client =>
          client.client_name.toLowerCase().includes(keyword) ||
          client.client_id.toLowerCase().includes(keyword)
      );
    }

    setFilteredClients(filtered);
  }, [searchKeyword, filterClientType, filterEnabled, clients]);

  // 클라이언트 추가/수정 (TODO: 모달 폼 구현 후 완성)
  const handleSave = async () => {
    try {
      // TODO: 모달 폼 validation 및 데이터 수집
      snackbar.info('폼 구현 진행 중입니다');
    } catch (error) {
      snackbar.error('OAuth 클라이언트 저장에 실패했습니다');
      console.error('Form save failed:', error);
    }
  };

  // 클라이언트 삭제 확인
  const confirmDelete = (id: string) => {
    setClientToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // 클라이언트 삭제 (소프트 삭제)
  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      await userManagementService.deleteClient(clientToDelete);
      snackbar.success('OAuth 클라이언트가 삭제되었습니다');
      fetchClients();
    } catch (error) {
      snackbar.error('OAuth 클라이언트 삭제에 실패했습니다');
      console.error(error);
    } finally {
      setDeleteConfirmOpen(false);
      setClientToDelete(null);
    }
  };

  // 클라이언트 활성화/비활성화 (deleted_at 기반)
  const handleToggleEnabled = async (client: OAuthClient) => {
    try {
      const isCurrentlyActive = !client.deleted_at;

      if (isCurrentlyActive) {
        // 비활성화 = 삭제
        await userManagementService.deleteClient(client.id);
        snackbar.success('클라이언트가 비활성화되었습니다');
      } else {
        // 활성화 = 복원 (백엔드 API 필요)
        // TODO: 백엔드에 PATCH /v1/management/clients/{clientId}/restore API 추가 필요
        snackbar.warning('클라이언트 활성화 API가 아직 구현되지 않았습니다');
        console.warn('Restore API not implemented yet');
      }

      fetchClients();
    } catch (error) {
      snackbar.error('클라이언트 상태 변경에 실패했습니다');
      console.error(error);
    }
  };

  // Client Secret 복사
  const handleCopySecret = (clientId: string) => {
    if (clientId) {
      // 마스킹된 시크릿이므로 그대로 복사 (실제로는 regenerate API 호출 필요)
      navigator.clipboard.writeText('********');
      snackbar.info('Client Secret은 보안상 마스킹되어 있습니다. 재생성 기능을 사용하세요.');
    }
  };


  // 모달 열기
  const handleOpenModal = (client?: OAuthClient) => {
    if (client) {
      setSelectedClient(client);
      // TODO: 폼 state 설정
    } else {
      setSelectedClient(null);
      // TODO: 폼 state 초기화
    }
    setModalOpen(true);
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'client',
      headerName: '클라이언트 정보',
      width: 240,
      renderCell: (params: GridRenderCellParams<OAuthClient>) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ApiIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={500}>
              {params.row.client_name}
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary">
            {params.row.client_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'client_type',
      headerName: '타입',
      width: 130,
      renderCell: (params: GridRenderCellParams<OAuthClient>) => {
        if (!params.row.client_type) return <Chip label="-" size="small" />;
        const typeOption = CLIENT_TYPE_OPTIONS.find(t => t.value === params.row.client_type);
        return <Chip label={typeOption?.label || params.row.client_type} color="primary" size="small" />;
      },
    },
    {
      field: 'status',
      headerName: '상태',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<OAuthClient>) => {
        const isActive = !params.row.deleted_at;
        return (
          <Switch
            size="small"
            checked={isActive}
            onChange={() => handleToggleEnabled(params.row)}
          />
        );
      },
    },
    {
      field: 'authorization_grant_types',
      headerName: 'Grant Types',
      width: 160,
      renderCell: (params: GridRenderCellParams<OAuthClient>) => {
        const types = params.row.authorization_grant_types;
        return (
          <Tooltip title={types?.join(', ') || ''}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {types?.slice(0, 2).map(type => (
                <Chip key={type} label={type.replace('_', ' ')} size="small" />
              ))}
              {types && types.length > 2 && (
                <Chip label={`+${types.length - 2}`} size="small" />
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'authority_types',
      headerName: '생성 가능 User Type',
      width: 170,
      renderCell: (params: GridRenderCellParams<OAuthClient>) => {
        const authorityTypes = params.row.authority_types;
        if (!authorityTypes || authorityTypes.length === 0) {
          return <Typography variant="body2" color="textSecondary">없음</Typography>;
        }
        const tooltipTitle = authorityTypes
          .map(at => {
            const userTypeDef = userTypeDefinitions.find(ut => ut.type_id === at.user_type);
            return `${userTypeDef?.display_name || at.user_type}${at.is_default ? ' (기본)' : ''}`;
          })
          .join(', ');
        return (
          <Tooltip title={tooltipTitle}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {authorityTypes.slice(0, 2).map(at => {
                const userTypeDef = userTypeDefinitions.find(ut => ut.type_id === at.user_type);
                return (
                  <Chip
                    key={at.user_type}
                    label={userTypeDef?.display_name || at.user_type}
                    color={at.is_default ? 'warning' : 'secondary'}
                    size="small"
                  />
                );
              })}
              {authorityTypes.length > 2 && (
                <Chip label={`+${authorityTypes.length - 2}`} size="small" />
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'scopes',
      headerName: 'Scopes',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<OAuthClient>) => {
        const scopes = params.row.scopes;
        return (
          <Tooltip title={scopes?.join(', ') || ''}>
            <Badge badgeContent={scopes?.length || 0} color="success" />
          </Tooltip>
        );
      },
    },
    {
      field: 'redirect_uris',
      headerName: 'URIs',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<OAuthClient>) => {
        const uris = params.row.redirect_uris;
        return (
          <Tooltip title={uris?.join('\n') || ''}>
            <Badge badgeContent={uris?.length || 0} color="secondary" />
          </Tooltip>
        );
      },
    },
    {
      field: 'use_public_client',
      headerName: 'PKCE',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<OAuthClient>) =>
        params.row.use_public_client ? (
          <Chip label="Public" color="success" size="small" />
        ) : (
          <Chip label="Confidential" size="small" />
        ),
    },
    {
      field: 'tokenValidity',
      headerName: '토큰 유효기간',
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<OAuthClient>) => (
        <Box>
          <Typography variant="caption" color="textSecondary">
            Access: {formatTokenDuration(params.row.access_token_time_to_live)}
          </Typography>
          <br />
          <Typography variant="caption" color="textSecondary">
            Refresh: {formatTokenDuration(params.row.refresh_token_time_to_live)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<OAuthClient>) => (
        <Box>
          <Tooltip title="Client Secret 복사">
            <IconButton size="small" onClick={() => handleCopySecret(params.row.client_id)}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => handleOpenModal(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => confirmDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            OAuth 클라이언트 ({filteredClients.length}개)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            OAuth2/OpenID Connect 클라이언트 관리
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchClients} disabled={loading}>
            새로고침
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            클라이언트 추가
          </Button>
        </Box>
      </Box>

      {/* 검색 및 필터 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>클라이언트 타입</InputLabel>
          <Select
            value={filterClientType}
            onChange={(e) => setFilterClientType(e.target.value as ClientType | 'ALL')}
            label="클라이언트 타입"
          >
            <MenuItem value="ALL">전체 타입</MenuItem>
            {CLIENT_TYPE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>상태</InputLabel>
          <Select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value as 'ALL' | 'enabled' | 'disabled')}
            label="상태"
          >
            <MenuItem value="ALL">전체 상태</MenuItem>
            <MenuItem value="enabled">활성</MenuItem>
            <MenuItem value="disabled">비활성</MenuItem>
          </Select>
        </FormControl>
        <TextField
          placeholder="클라이언트명, Client ID로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
          slotProps={{
            input: {
              endAdornment: searchKeyword && (
                <IconButton size="small" onClick={() => setSearchKeyword('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            },
          }}
        />
      </Box>

      {/* 테이블 */}
      <Box sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={filteredClients}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
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

      {/* OAuth 클라이언트 추가/수정 모달 (TODO: 폼 구현 필요) */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedClient(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedClient ? 'OAuth 클라이언트 수정' : '새 OAuth 클라이언트 추가'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            OAuth2/OIDC 클라이언트 설정 폼은 구현 중입니다.
          </Alert>
          <Typography variant="body2" color="textSecondary">
            TODO: 복잡한 OAuth 클라이언트 폼을 Material-UI로 구현 필요
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            - 클라이언트 정보 (이름, 타입, authority types)<br />
            - Redirect URIs, Post Logout URIs<br />
            - Scopes, Grant Types, PKCE 설정<br />
            - 토큰 유효기간 설정
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setModalOpen(false);
            setSelectedClient(null);
          }}>
            취소
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedClient ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>OAuth 클라이언트 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 OAuth 클라이언트를 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}