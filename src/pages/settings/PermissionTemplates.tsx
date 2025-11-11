// Permission Template 관리 페이지
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Chip,
  Switch,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { PermissionTemplate } from '../../types/user-management';
import TemplateFormModal from '../../components/settings/TemplateFormModal';
import TemplateDetailModal from '../../components/settings/TemplateDetailModal';
import { userManagementService } from '../../services/userManagementService';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function PermissionTemplates() {
  const snackbar = useSnackbar();
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<PermissionTemplate | null>(null);

  // 필터링 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  // 페이지네이션 상태
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState(0);

  // 카테고리 목록
  const [categories, setCategories] = useState<string[]>([]);

  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PermissionTemplate | null>(null);

  // 템플릿 목록 조회
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await userManagementService.getPermissionTemplates({
        category: filterCategory,
        isActive: filterActive,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });

      setTemplates(response.content);
      setTotalElements(response.totalElements);

      // 카테고리 목록 추출
      const uniqueCategories = Array.from(
        new Set(response.content.map((t) => t.category).filter((c) => c))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      snackbar.error('Permission Template 목록 조회에 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterActive, paginationModel]);

  // 템플릿 추가/수정
  const handleSave = async (templateData: any) => {
    try {
      if (selectedTemplate) {
        snackbar.success('Permission Template이 수정되었습니다');
      } else {
        await userManagementService.createPermissionTemplate(templateData);
        snackbar.success('새 Permission Template이 추가되었습니다');
      }
      fetchTemplates();
      setModalOpen(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      snackbar.error(error?.message || 'Permission Template 저장에 실패했습니다');
      console.error(error);
    }
  };

  // 템플릿 삭제
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await userManagementService.deletePermissionTemplate(templateToDelete.id);
      snackbar.success('Permission Template이 삭제되었습니다');
      fetchTemplates();
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error: any) {
      snackbar.error(error?.message || 'Permission Template 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 활성화/비활성화 토글
  const handleToggleActive = async (id: number, currentActive: boolean, name: string) => {
    const newActiveState = !currentActive;
    try {
      await userManagementService.togglePermissionTemplateActivation(id, newActiveState);
      snackbar.success(`"${name}" 템플릿이 ${newActiveState ? '활성화' : '비활성화'}되었습니다`);
      fetchTemplates();
    } catch (error: any) {
      snackbar.error(error?.message || '활성 상태 변경에 실패했습니다');
      console.error(error);
    }
  };

  // 클라이언트 측 검색 필터링
  const filteredTemplates = searchKeyword
    ? templates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (template.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false) ||
          (template.category?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false)
      )
    : templates;

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      renderCell: (params: GridRenderCellParams<PermissionTemplate>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.id}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: '템플릿 이름',
      width: 220,
      renderCell: (params: GridRenderCellParams<PermissionTemplate>) => (
        <Tooltip title={params.row.description || params.row.name}>
          <Typography variant="body2" fontWeight={500}>
            {params.row.name}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'category',
      headerName: '카테고리',
      width: 120,
      renderCell: (params: GridRenderCellParams<PermissionTemplate>) =>
        params.row.category ? (
          <Chip label={params.row.category} color="primary" size="small" />
        ) : (
          <Typography variant="caption" color="textSecondary">
            -
          </Typography>
        ),
    },
    {
      field: 'roles',
      headerName: '포함된 역할',
      width: 350,
      sortable: false,
      renderCell: (params: GridRenderCellParams<PermissionTemplate>) => {
        const totalRoles = params.row.global_roles.length + params.row.service_roles.length;

        if (totalRoles === 0) {
          return (
            <Typography variant="caption" color="textSecondary">
              역할 없음
            </Typography>
          );
        }

        const tooltipContent = (
          <Box>
            {params.row.global_roles.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  글로벌 역할:
                </Typography>
                {params.row.global_roles.map((r) => (
                  <Typography key={r.role_id} variant="caption" display="block">
                    • {r.role_id}: {r.display_name}
                  </Typography>
                ))}
              </Box>
            )}
            {params.row.service_roles.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  서비스 역할:
                </Typography>
                {params.row.service_roles.map((r) => (
                  <Typography key={`${r.service_id}:${r.role_name}`} variant="caption" display="block">
                    • {r.service_id}:{r.role_name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );

        return (
          <Tooltip title={tooltipContent}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {/* 글로벌 역할 표시 (최대 2개) */}
              {params.row.global_roles.slice(0, 2).map((role) => (
                <Chip key={role.role_id} label={role.role_id} color="secondary" size="small" />
              ))}

              {/* 서비스 역할 표시 (최대 2개) */}
              {params.row.service_roles.slice(0, 2).map((role) => (
                <Chip
                  key={`${role.service_id}:${role.role_name}`}
                  label={role.service_id}
                  color="info"
                  size="small"
                />
              ))}

              {/* 총 개수가 4개 초과 시 +N 표시 */}
              {totalRoles > 4 && (
                <Chip label={`+${totalRoles - 4}`} size="small" variant="outlined" />
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'is_active',
      headerName: '상태',
      width: 90,
      renderCell: (params: GridRenderCellParams<PermissionTemplate>) => (
        <Switch
          checked={params.row.is_active}
          onChange={() => handleToggleActive(params.row.id, params.row.is_active, params.row.name)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<PermissionTemplate>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="수정">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
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
              onClick={(e) => {
                e.stopPropagation();
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
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Permission Templates ({filteredTemplates.length}개)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              권한 역할 조합 템플릿 관리
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

        {/* 필터 및 검색 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>카테고리 필터</InputLabel>
            <Select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || undefined)}
              label="카테고리 필터"
            >
              <MenuItem value="">전체 카테고리</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>활성 상태</InputLabel>
            <Select
              value={filterActive === undefined ? '' : String(filterActive)}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(value === '' ? undefined : value === 'true');
              }}
              label="활성 상태"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="true">활성만</MenuItem>
              <MenuItem value="false">비활성만</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder="템플릿명, 설명, 카테고리로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            sx={{ flex: 1, maxWidth: 500 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">🔍</InputAdornment>
              ),
            }}
          />
        </Box>

        {/* DataGrid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTemplates}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            rowCount={totalElements}
            pageSizeOptions={[10, 20, 50, 100]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            onRowClick={(params) => {
              setViewingTemplate(params.row);
              setDetailModalOpen(true);
            }}
            sx={{ cursor: 'pointer' }}
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>

      {/* 템플릿 추가/수정 모달 */}
      <TemplateFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSave}
        template={selectedTemplate}
      />

      {/* 템플릿 상세 보기 모달 */}
      <TemplateDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setViewingTemplate(null);
        }}
        template={viewingTemplate}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
      >
        <DialogTitle>Permission Template 삭제</DialogTitle>
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
