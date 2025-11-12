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
  Grid,
  Divider,
  Autocomplete,
  FormControlLabel,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Api as ApiIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { OAuthClient, ClientType, UserTypeDefinition, ClientAuthorityType } from '../../types/user-management';
import {
  CLIENT_TYPE_OPTIONS,
  GRANT_TYPE_OPTIONS,
  COMMON_SCOPES,
} from '../../constants/user-management';
import { ClientAuthorityTypesManager } from '../../components/oauth/ClientAuthorityTypesManager';
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

  // 폼 상태
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientType: '' as ClientType | '',
    redirectUris: [''] as string[],
    postLogoutRedirectUris: [''] as string[],
    scopes: [] as string[],
    grantTypes: [] as string[],
    authMethods: ['CLIENT_SECRET_BASIC'] as string[],
    accessTokenTTL: '1H',
    refreshTokenTTL: '24H',
    requirePkce: false,
    reuseRefreshTokens: false,
    authorityTypes: [] as ClientAuthorityType[],
  });

  // 폼 에러 상태
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Accordion 확장 상태
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('oauth2');

  // Redirect URI 추가
  const handleAddRedirectUri = () => {
    setFormData({ ...formData, redirectUris: [...formData.redirectUris, ''] });
  };

  // Redirect URI 삭제
  const handleRemoveRedirectUri = (index: number) => {
    const newUris = formData.redirectUris.filter((_, i) => i !== index);
    setFormData({ ...formData, redirectUris: newUris.length > 0 ? newUris : [''] });
  };

  // Redirect URI 변경
  const handleChangeRedirectUri = (index: number, value: string) => {
    const newUris = [...formData.redirectUris];
    newUris[index] = value;
    setFormData({ ...formData, redirectUris: newUris });
  };

  // Post Logout URI 추가
  const handleAddPostLogoutUri = () => {
    setFormData({ ...formData, postLogoutRedirectUris: [...formData.postLogoutRedirectUris, ''] });
  };

  // Post Logout URI 삭제
  const handleRemovePostLogoutUri = (index: number) => {
    const newUris = formData.postLogoutRedirectUris.filter((_, i) => i !== index);
    setFormData({ ...formData, postLogoutRedirectUris: newUris.length > 0 ? newUris : [''] });
  };

  // Post Logout URI 변경
  const handleChangePostLogoutUri = (index: number, value: string) => {
    const newUris = [...formData.postLogoutRedirectUris];
    newUris[index] = value;
    setFormData({ ...formData, postLogoutRedirectUris: newUris });
  };

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

  // 폼 검증
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedClient && !formData.clientId) {
      errors.clientId = 'Client ID를 입력하세요';
    } else if (!selectedClient && !/^[a-zA-Z0-9-_]+$/.test(formData.clientId)) {
      errors.clientId = '영문, 숫자, -, _ 만 사용 가능합니다';
    }

    if (!formData.clientName) {
      errors.clientName = '클라이언트 이름을 입력하세요';
    }

    // Redirect URIs 검증 (최소 1개, 빈 문자열 제외)
    const validRedirectUris = formData.redirectUris.filter(uri => uri.trim());
    if (validRedirectUris.length === 0) {
      errors.redirectUris = '최소 하나 이상의 Redirect URI를 입력하세요';
    }

    if (formData.scopes.length === 0) {
      errors.scopes = '최소 하나 이상의 scope를 선택하세요';
    }

    if (formData.grantTypes.length === 0) {
      errors.grantTypes = '최소 하나 이상의 grant type을 선택하세요';
    }

    if (formData.authMethods.length === 0) {
      errors.authMethods = '인증 방식을 선택하세요';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 클라이언트 추가/수정
  const handleSave = async () => {
    if (!validateForm()) {
      snackbar.error('입력값을 확인해주세요');
      return;
    }

    try {
      // URI 배열 필터링 (빈 문자열 제거)
      const validRedirectUris = formData.redirectUris.filter(uri => uri.trim());
      const validPostLogoutUris = formData.postLogoutRedirectUris.filter(uri => uri.trim());

      if (selectedClient) {
        // 수정: PUT /v1/management/clients/{clientId}
        const updateData: import('../../types/user-management').ClientUpdateRequest = {
          client_name: formData.clientName,
          redirect_uris: validRedirectUris,
          post_logout_redirect_uris: validPostLogoutUris.length > 0 ? validPostLogoutUris : undefined,
          scopes: formData.scopes,
          authorization_grant_types: formData.grantTypes,
          client_authentication_methods: formData.authMethods,
          access_token_time_to_live: formData.accessTokenTTL,
          refresh_token_time_to_live: formData.refreshTokenTTL,
          use_public_client: formData.requirePkce,
          reuse_refresh_tokens: formData.reuseRefreshTokens,
        };

        await userManagementService.updateClient(selectedClient.id, updateData);
        snackbar.success('OAuth 클라이언트가 수정되었습니다');
      } else {
        // 추가: POST /v1/management/clients
        const createData: import('../../types/user-management').ClientCreateRequest = {
          client_id: formData.clientId,
          client_name: formData.clientName,
          redirect_uris: validRedirectUris,
          post_logout_redirect_uris: validPostLogoutUris.length > 0 ? validPostLogoutUris : undefined,
          scopes: formData.scopes,
          authorization_grant_types: formData.grantTypes,
          client_authentication_methods: formData.authMethods,
          access_token_time_to_live: formData.accessTokenTTL,
          refresh_token_time_to_live: formData.refreshTokenTTL,
          use_public_client: formData.requirePkce,
          reuse_refresh_tokens: formData.reuseRefreshTokens,
        };

        await userManagementService.createClient(createData);
        snackbar.success('새 OAuth 클라이언트가 추가되었습니다');
      }

      fetchClients();
      setModalOpen(false);
      setSelectedClient(null);
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
      setFormData({
        clientId: client.client_id,
        clientName: client.client_name,
        clientType: client.client_type || '',
        redirectUris: client.redirect_uris && client.redirect_uris.length > 0 ? client.redirect_uris : [''],
        postLogoutRedirectUris: client.post_logout_redirect_uris && client.post_logout_redirect_uris.length > 0
          ? client.post_logout_redirect_uris
          : [''],
        scopes: client.scopes || [],
        grantTypes: client.authorization_grant_types || [],
        authMethods: client.client_authentication_methods || ['CLIENT_SECRET_BASIC'],
        accessTokenTTL: client.access_token_time_to_live || '1H',
        refreshTokenTTL: client.refresh_token_time_to_live || '24H',
        requirePkce: client.use_public_client || false,
        reuseRefreshTokens: client.reuse_refresh_tokens || false,
        authorityTypes: client.authority_types || [],
      });
    } else {
      setSelectedClient(null);
      setFormData({
        clientId: '',
        clientName: '',
        clientType: '',
        redirectUris: [''],
        postLogoutRedirectUris: [''],
        scopes: [],
        grantTypes: [],
        authMethods: ['CLIENT_SECRET_BASIC'],
        accessTokenTTL: '1H',
        refreshTokenTTL: '24H',
        requirePkce: false,
        reuseRefreshTokens: false,
        authorityTypes: [],
      });
    }
    setFormErrors({});
    setExpandedAccordion('oauth2'); // 기본적으로 OAuth2 설정 아코디언 열기
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

      {/* OAuth 클라이언트 추가/수정 모달 */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedClient(null);
        }}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            height: '90vh',
          },
        }}
      >
        <DialogTitle>
          {selectedClient ? 'OAuth 클라이언트 수정' : '새 OAuth 클라이언트 추가'}
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            OAuth2/OIDC 클라이언트 설정 - 애플리케이션이 인증 서버와 통신하기 위한 클라이언트 설정을 관리합니다.
          </Alert>

          <Box component="form" noValidate>
            {/* 기본 정보 (항상 표시) */}
            <Typography variant="h6" gutterBottom>
              기본 정보
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Client ID"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  disabled={!!selectedClient}
                  error={!!formErrors.clientId}
                  helperText={formErrors.clientId || '예: healthcare-web-app'}
                  fullWidth
                  required={!selectedClient}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="클라이언트 이름"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  error={!!formErrors.clientName}
                  helperText={formErrors.clientName || '예: Healthcare Web Application'}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>클라이언트 타입</InputLabel>
                  <Select
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value as ClientType })}
                    label="클라이언트 타입"
                  >
                    <MenuItem value="">
                      <em>선택 안함</em>
                    </MenuItem>
                    {CLIENT_TYPE_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>UI 분류용 (선택사항)</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.requirePkce}
                        onChange={(e) => setFormData({ ...formData, requirePkce: e.target.checked })}
                      />
                    }
                    label="Public Client (PKCE)"
                  />
                  <FormHelperText>
                    Public Client는 PKCE를 필수로 사용합니다 (예: 모바일 앱, SPA)
                  </FormHelperText>
                </Box>
              </Grid>
            </Grid>

            {/* Accordion 섹션들 */}
            <Accordion
              expanded={expandedAccordion === 'oauth2'}
              onChange={() => setExpandedAccordion(expandedAccordion === 'oauth2' ? false : 'oauth2')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>OAuth2 설정</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Stack spacing={3}>
                  {/* Redirect URIs */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Redirect URIs *
                    </Typography>
                    {formErrors.redirectUris && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {formErrors.redirectUris}
                      </Alert>
                    )}
                    <Stack spacing={1}>
                      {formData.redirectUris.map((uri, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            value={uri}
                            onChange={(e) => handleChangeRedirectUri(index, e.target.value)}
                            placeholder="https://example.com/callback"
                            fullWidth
                            size="small"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveRedirectUri(index)}
                            disabled={formData.redirectUris.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddRedirectUri}
                        variant="outlined"
                        size="small"
                      >
                        Redirect URI 추가
                      </Button>
                    </Stack>
                  </Box>

                  {/* Post Logout Redirect URIs */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Post Logout Redirect URIs
                    </Typography>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      로그아웃 후 리다이렉트할 URI (선택사항)
                    </Typography>
                    <Stack spacing={1}>
                      {formData.postLogoutRedirectUris.map((uri, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            value={uri}
                            onChange={(e) => handleChangePostLogoutUri(index, e.target.value)}
                            placeholder="https://example.com"
                            fullWidth
                            size="small"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemovePostLogoutUri(index)}
                            disabled={formData.postLogoutRedirectUris.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddPostLogoutUri}
                        variant="outlined"
                        size="small"
                      >
                        Post Logout URI 추가
                      </Button>
                    </Stack>
                  </Box>

                  {/* Scopes */}
                  <Autocomplete
                    multiple
                    freeSolo
                    options={COMMON_SCOPES}
                    value={formData.scopes}
                    onChange={(_, newValue) => setFormData({ ...formData, scopes: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Scopes"
                        error={!!formErrors.scopes}
                        helperText={formErrors.scopes || 'Scope 선택 또는 직접 입력'}
                        required
                      />
                    )}
                  />

                  {/* Grant Types */}
                  <FormControl fullWidth error={!!formErrors.grantTypes} required>
                    <InputLabel>Grant Types</InputLabel>
                    <Select
                      multiple
                      value={formData.grantTypes}
                      onChange={(e) => setFormData({ ...formData, grantTypes: e.target.value as string[] })}
                      label="Grant Types"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {GRANT_TYPE_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                    {formErrors.grantTypes && (
                      <FormHelperText>{formErrors.grantTypes}</FormHelperText>
                    )}
                  </FormControl>

                  {/* Authentication Methods */}
                  <FormControl fullWidth error={!!formErrors.authMethods} required>
                    <InputLabel>Client Authentication Methods</InputLabel>
                    <Select
                      multiple
                      value={formData.authMethods}
                      onChange={(e) => setFormData({ ...formData, authMethods: e.target.value as string[] })}
                      label="Client Authentication Methods"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="CLIENT_SECRET_BASIC">Client Secret Basic</MenuItem>
                      <MenuItem value="CLIENT_SECRET_POST">Client Secret Post</MenuItem>
                      <MenuItem value="CLIENT_SECRET_JWT">Client Secret JWT</MenuItem>
                      <MenuItem value="PRIVATE_KEY_JWT">Private Key JWT</MenuItem>
                      <MenuItem value="NONE">None (Public Client)</MenuItem>
                    </Select>
                    {formErrors.authMethods && (
                      <FormHelperText>{formErrors.authMethods}</FormHelperText>
                    )}
                  </FormControl>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* 토큰 설정 */}
            <Accordion
              expanded={expandedAccordion === 'token'}
              onChange={() => setExpandedAccordion(expandedAccordion === 'token' ? false : 'token')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>토큰 설정</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Stack spacing={2}>
                  <TextField
                    label="Access Token 유효기간"
                    value={formData.accessTokenTTL}
                    onChange={(e) => setFormData({ ...formData, accessTokenTTL: e.target.value })}
                    helperText="예: 1H (1시간), 30M (30분)"
                    fullWidth
                    placeholder="1H"
                  />
                  <TextField
                    label="Refresh Token 유효기간"
                    value={formData.refreshTokenTTL}
                    onChange={(e) => setFormData({ ...formData, refreshTokenTTL: e.target.value })}
                    helperText="예: 24H (24시간), 7D (7일)"
                    fullWidth
                    placeholder="24H"
                  />
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.reuseRefreshTokens}
                          onChange={(e) => setFormData({ ...formData, reuseRefreshTokens: e.target.checked })}
                        />
                      }
                      label="Refresh Token 재사용"
                    />
                    <FormHelperText>Refresh Token을 재사용할지 여부</FormHelperText>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* User Type 관리 */}
            <Accordion
              expanded={expandedAccordion === 'usertype'}
              onChange={() => setExpandedAccordion(expandedAccordion === 'usertype' ? false : 'usertype')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>허용된 User Type 관리</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    이 클라이언트를 통해 회원가입 시 생성 가능한 사용자 유형을 설정합니다
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <ClientAuthorityTypesManager
                      value={formData.authorityTypes}
                      onChange={(value) => setFormData({ ...formData, authorityTypes: value })}
                      userTypeDefinitions={userTypeDefinitions}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
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