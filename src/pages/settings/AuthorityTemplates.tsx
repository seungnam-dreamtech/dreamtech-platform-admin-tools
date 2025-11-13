// 권한 템플릿 관리 페이지
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Clear as ClearIcon,
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

    // User Type 필터 (역조회 방식)
    if (filterUserType !== 'ALL') {
      const selectedUserType = userTypes.find(ut => ut.type_id === filterUserType);
      if (selectedUserType) {
        filtered = filtered.filter(template =>
          selectedUserType.default_template_names?.includes(template.name)
        );
      }
    }

    // 키워드 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.name.toLowerCase().includes(keyword) ||
          (template.description?.toLowerCase().includes(keyword) ?? false) ||
          (template.category?.toLowerCase().includes(keyword) ?? false)
      );
    }

    setFilteredTemplates(filtered);
  }, [searchKeyword, filterUserType, templates, userTypes]);

  // 템플릿 추가/수정 완료 후 호출
  const handleSave = async () => {
    // 모달 내부에서 이미 처리되므로 목록만 새로고침
    fetchTemplates();
    setModalOpen(false);
    setSelectedTemplate(null);
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


  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: '템플릿 이름',
      flex: 1,
      minWidth: 200,
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
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: 'user_type',
      headerName: 'User Type',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => {
        // 템플릿 name으로 해당 템플릿을 기본으로 사용하는 User Type들 찾기
        const matchingUserTypes = userTypes.filter(ut =>
          ut.default_template_names?.includes(params.row.name)
        );

        if (matchingUserTypes.length === 0) {
          return <Typography variant="caption" color="textSecondary">-</Typography>;
        }

        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {matchingUserTypes.map(ut => (
              <Chip
                key={ut.type_id}
                label={ut.display_name}
                color="secondary"
                size="small"
              />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'global_roles',
      headerName: '글로벌 역할',
      flex: 0.7,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => {
        const globalRoles = params.row.global_roles || [];
        const roleNames = globalRoles.map(r => r.display_name);
        return (
          <Tooltip title={roleNames.length > 0 ? roleNames.join(', ') : '없음'}>
            <Badge badgeContent={globalRoles.length} color="primary" showZero>
              <Box sx={{ width: 24 }} />
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      field: 'service_roles',
      headerName: '서비스 역할',
      flex: 0.7,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
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
      field: 'created_at',
      headerName: '생성일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.created_at ? new Date(params.row.created_at).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'created_by',
      headerName: '생성자',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.created_by || '-'}
        </Typography>
      ),
    },
    {
      field: 'updated_at',
      headerName: '수정일',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updated_at ? new Date(params.row.updated_at).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'updated_by',
      headerName: '수정자',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updated_by || '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.6,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<AuthorityTemplate>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={params.row.is_default ? '기본 템플릿 해제' : '기본 템플릿으로 설정'}>
            <IconButton
              size="small"
              color={params.row.is_default ? 'primary' : 'default'}
              onClick={() => handleToggleDefault(params.row)}
            >
              {params.row.is_default ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
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

  // 통계 계산
  const stats = {
    total: templates.length,
    withDefault: templates.filter(t => t.is_default).length,
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            권한 템플릿 ({filteredTemplates.length}개)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            User Type별 사전 정의된 권한 세트 관리 | 전체: {stats.total}개 | 기본 템플릿: {stats.withDefault}개
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchTemplates} disabled={loading}>
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
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>User Type</InputLabel>
          <Select
            value={filterUserType}
            onChange={(e) => setFilterUserType(e.target.value)}
            label="User Type"
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
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 450 }}
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

      {/* DataGrid */}
      <Box sx={{
        height: 'calc(100vh - 280px)',
        width: '100%',
        minHeight: 400,
      }}>
        <DataGrid
          rows={filteredTemplates}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: '등록된 권한 템플릿이 없습니다',
            noResultsOverlayLabel: '검색 결과가 없습니다',
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
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