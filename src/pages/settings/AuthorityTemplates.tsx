// 권한 템플릿 관리 페이지
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { AuthorityTemplate, UserTypeDefinition } from '../../types/user-management';
import { AuthorityTemplateFormModal } from '../../components/settings/AuthorityTemplateFormModal';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function AuthorityTemplates() {
  const snackbar = useSnackbar();
  const [templates, setTemplates] = useState<AuthorityTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AuthorityTemplate[]>([]);
  const [userTypes, setUserTypes] = useState<UserTypeDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AuthorityTemplate | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterUserType, setFilterUserType] = useState<string | 'ALL'>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<AuthorityTemplate | null>(null);

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getAuthorityTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      snackbar.error('권한 템플릿 목록 조회에 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const data = await userManagementService.getUserTypeDefinitions();
      setUserTypes(data.filter((ut) => ut.is_active));
    } catch (error) {
      console.error('Failed to load user types:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchUserTypes();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...templates];

    // User Type 필터
    if (filterUserType !== 'ALL') {
      filtered = filtered.filter(template => template.user_type === filterUserType);
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.name.toLowerCase().includes(keyword) ||
          (template.description?.toLowerCase().includes(keyword) ?? false) ||
          (template.user_type?.toLowerCase().includes(keyword) ?? false)
      );
    }

    setFilteredTemplates(filtered);
  }, [searchKeyword, filterUserType, templates]);

  // 템플릿 추가/수정
  const handleSave = async () => {
    try {
      if (selectedTemplate) {
        // 수정
        snackbar.success('권한 템플릿이 수정되었습니다');
      } else {
        // 추가
        snackbar.success('새 권한 템플릿이 추가되었습니다');
      }
      fetchTemplates();
      setModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      snackbar.error('권한 템플릿 저장에 실패했습니다');
      console.error(error);
    }
  };

  // 템플릿 삭제
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      // TODO: API 호출
      // await userManagementService.deletePermissionTemplate(templateToDelete.id);
      snackbar.success('권한 템플릿이 삭제되었습니다');
      fetchTemplates();
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      snackbar.error('권한 템플릿 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 기본 템플릿 설정/해제
  const handleToggleDefault = async (template: AuthorityTemplate) => {
    try {
      snackbar.success(
        template.is_default
          ? '기본 템플릿이 해제되었습니다'
          : `${template.name}이(가) ${template.user_type}의 기본 템플릿으로 설정되었습니다`
      );
      fetchTemplates();
    } catch (error) {
      snackbar.error('기본 템플릿 설정에 실패했습니다');
      console.error(error);
    }
  };

  // User Type별 통계
  const userTypeStats = userTypes.map(userType => {
    const typeTemplates = templates.filter(t => t.user_type === userType.type_id);
    const defaultTemplate = typeTemplates.find(t => t.is_default);
    return {
      userType: userType.type_id,
      label: userType.display_name,
      total: typeTemplates.length,
      hasDefault: !!defaultTemplate,
      defaultTemplateName: defaultTemplate?.name,
      totalAppliedUsers: typeTemplates.reduce((sum, t) => sum + (t.statistics?.applied_user_count || 0), 0),
    };
  });

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: '템플릿 이름',
      width: 250,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={params.row.is_default ? '기본 템플릿' : '일반 템플릿'}>
            {params.row.is_default ? (
              <StarIcon sx={{ color: '#faad14', fontSize: 18 }} />
            ) : (
              <StarBorderIcon sx={{ color: '#d9d9d9', fontSize: 18 }} />
            )}
          </Tooltip>
          <Typography variant="body2" fontWeight={600}>
            {params.row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'user_type',
      headerName: 'User Type',
      width: 150,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => {
        const typeInfo = userTypes.find(t => t.type_id === params.row.user_type);
        return (
          <Chip
            label={typeInfo?.display_name || params.row.user_type}
            color="secondary"
            size="small"
          />
        );
      },
    },
    {
      field: 'roles',
      headerName: '역할',
      width: 120,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => {
        const roles = params.row.roles || [];
        return (
          <Tooltip title={roles.length > 0 ? roles.join(', ') : '없음'}>
            <Badge badgeContent={roles.length} color="primary" showZero>
              <Box sx={{ width: 24 }} />
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      field: 'permissions',
      headerName: '권한',
      width: 120,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => {
        const permissions = params.row.permissions || [];
        return (
          <Tooltip title={permissions.length > 0 ? permissions.join(', ') : '없음'}>
            <Badge badgeContent={permissions.length} color="success" showZero>
              <Box sx={{ width: 24 }} />
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      field: 'service_roles',
      headerName: '서비스 역할',
      width: 180,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => {
        const serviceRoles = params.row.service_roles || [];
        const roleNames = serviceRoles.map(r => `${r.service_id}:${r.role_name}`);
        return (
          <Tooltip title={roleNames.length > 0 ? roleNames.join(', ') : '없음'}>
            <Badge badgeContent={serviceRoles.length} color="info" showZero>
              <Box sx={{ width: 24 }} />
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      field: 'applied_user_count',
      headerName: '적용 사용자 수',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Typography variant="body2" fontWeight={600}>
          {params.row.statistics?.applied_user_count || 0}명
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={params.row.is_default ? '기본 템플릿 해제' : '기본 템플릿으로 설정'}>
            <IconButton
              size="small"
              color={params.row.is_default ? 'primary' : 'default'}
              onClick={() => handleToggleDefault(params.row)}
            >
              {params.row.is_default ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="수정">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedTemplate(params.row);
                setModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setTemplateToDelete(params.row);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 안내 메시지 */}
        <Alert severity="info">
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            권한 템플릿 (Authority Template) 관리
          </Typography>
          <Typography variant="body2" paragraph>
            권한 템플릿은 User Type별로 사전 정의된 권한 세트를 제공합니다.
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0 }}>
            <li>
              <Typography variant="body2">
                <strong>권한 우선순위</strong>: User Type 기본 역할 (우선순위 90) → Template
                (85) → Individual (최고)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>기본 템플릿</strong>: User Type별로 하나의 기본 템플릿을 지정할 수 있으며,
                사용자 생성 시 자동으로 적용됩니다
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>유연한 관리</strong>: 템플릿을 통해 동일한 User Type의 사용자들에게 다양한
                권한 조합을 제공할 수 있습니다
              </Typography>
            </li>
          </Box>
        </Alert>

        {/* User Type별 통계 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            User Type별 템플릿 통계
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {userTypeStats.map(stat => (
              <Card key={stat.userType} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {stat.label}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        템플릿:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {stat.total}개
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        적용 사용자:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {stat.totalAppliedUsers}명
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {stat.hasDefault ? (
                        <>
                          <StarIcon sx={{ color: '#faad14', fontSize: 16 }} />
                          <Typography variant="caption" color="success.main">
                            {stat.defaultTemplateName}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <WarningIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                          <Typography variant="caption" color="warning.main">
                            기본 템플릿 미설정
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              권한 템플릿 관리
            </Typography>
            <Typography variant="body2" color="textSecondary">
              User Type별 사전 정의된 권한 세트를 관리합니다
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTemplates}
              disabled={loading}
            >
              새로고침
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedTemplate(null);
                setModalOpen(true);
              }}
            >
              템플릿 추가
            </Button>
          </Box>
        </Box>

        {/* 검색 및 필터 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>User Type 필터</InputLabel>
            <Select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
              label="User Type 필터"
            >
              <MenuItem value="ALL">전체 User Type</MenuItem>
              {userTypes.map(type => (
                <MenuItem key={type.type_id} value={type.type_id}>
                  {type.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            placeholder="템플릿명 또는 설명으로 검색"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">🔍</InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 통계 */}
        <Box>
          <Typography variant="body2" component="span" color="textSecondary">
            전체 템플릿:{' '}
          </Typography>
          <Typography variant="body2" component="span" fontWeight={600}>
            {templates.length}개
          </Typography>
          <Typography variant="body2" component="span" color="textSecondary" sx={{ ml: 3 }}>
            필터링된 템플릿:{' '}
          </Typography>
          <Typography variant="body2" component="span" fontWeight={600}>
            {filteredTemplates.length}개
          </Typography>
        </Box>

        {/* DataGrid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTemplates}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>

      {/* 템플릿 추가/수정 모달 */}
      <AuthorityTemplateFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSave}
        template={selectedTemplate}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
      >
        <DialogTitle>권한 템플릿 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{templateToDelete?.name}" 템플릿을 삭제하시겠습니까?
            <br />
            현재 {templateToDelete?.statistics?.applied_user_count || 0}명의 사용자에게 적용 중입니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setTemplateToDelete(null);
            }}
          >
            취소
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}