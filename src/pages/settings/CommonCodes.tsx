import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Chip,
  Switch,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { CodeGroup, Code } from '../../types/user-management';
import { userManagementService } from '../../services/userManagementService';
import CodeGroupFormModal from '../../components/settings/CodeGroupFormModal';
import CodeFormModal from '../../components/settings/CodeFormModal';
import { useSnackbar } from '../../contexts/SnackbarContext';

/**
 * 공통 코드 관리 페이지
 * - 좌측: 코드 그룹 목록
 * - 우측: 선택된 그룹의 코드 목록
 */
export default function CommonCodes() {
  const snackbar = useSnackbar();

  // 코드 그룹 상태
  const [codeGroups, setCodeGroups] = useState<CodeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CodeGroup | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CodeGroup | null>(null);
  const [groupSearchText, setGroupSearchText] = useState('');

  // 코드 상태
  const [codes, setCodes] = useState<Code[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<Code | null>(null);
  const [codeSearchText, setCodeSearchText] = useState('');

  // 삭제 확인 다이얼로그
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<CodeGroup | null>(null);
  const [deleteCodeDialogOpen, setDeleteCodeDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<Code | null>(null);

  // 초기 로드
  useEffect(() => {
    loadCodeGroups();
  }, []);

  // 그룹 선택 시 코드 로드
  useEffect(() => {
    if (selectedGroup) {
      loadCodes(selectedGroup.group_id);
    } else {
      setCodes([]);
    }
  }, [selectedGroup]);

  // 코드 그룹 목록 로드
  const loadCodeGroups = async () => {
    setLoadingGroups(true);
    try {
      const data = await userManagementService.getCodeGroups(false);
      setCodeGroups(data);
      console.log('✅ 코드 그룹 목록 로드 완료:', data.length);
    } catch (error) {
      console.error('❌ 코드 그룹 로드 실패:', error);
      snackbar.error('코드 그룹 목록을 불러오는데 실패했습니다');
    } finally {
      setLoadingGroups(false);
    }
  };

  // 특정 그룹의 코드 목록 로드
  const loadCodes = async (groupId: string) => {
    setLoadingCodes(true);
    try {
      const data = await userManagementService.getCodesByGroup(groupId, false);
      setCodes(data);
      console.log(`✅ 코드 목록 로드 완료 (${groupId}):`, data.length);
    } catch (error) {
      console.error('❌ 코드 로드 실패:', error);
      snackbar.error('코드 목록을 불러오는데 실패했습니다');
    } finally {
      setLoadingCodes(false);
    }
  };

  // 코드 그룹 생성/수정 핸들러
  const handleSaveGroup = async (values: CodeGroup) => {
    try {
      if (editingGroup) {
        // 수정
        await userManagementService.updateCodeGroup(editingGroup.group_id, {
          group_name: values.group_name,
          description: values.description,
          display_order: values.display_order,
        });
        snackbar.success('코드 그룹이 수정되었습니다');
      } else {
        // 생성
        await userManagementService.createCodeGroup({
          group_id: values.group_id,
          group_name: values.group_name,
          description: values.description,
          display_order: values.display_order,
          is_system_managed: values.is_system_managed,
          is_active: values.is_active,
        });
        snackbar.success('코드 그룹이 생성되었습니다');
      }
      setGroupModalOpen(false);
      setEditingGroup(null);
      await loadCodeGroups();
    } catch (error) {
      console.error('❌ 코드 그룹 저장 실패:', error);
      snackbar.error(
        editingGroup ? '코드 그룹 수정에 실패했습니다' : '코드 그룹 생성에 실패했습니다'
      );
    }
  };

  // 코드 그룹 삭제
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      await userManagementService.deleteCodeGroup(groupToDelete.group_id);
      snackbar.success('코드 그룹이 삭제되었습니다');
      if (selectedGroup?.group_id === groupToDelete.group_id) {
        setSelectedGroup(null);
      }
      await loadCodeGroups();
    } catch (error: unknown) {
      console.error('❌ 코드 그룹 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('코드가')) {
        snackbar.error('코드가 있는 그룹은 삭제할 수 없습니다');
      } else {
        snackbar.error('코드 그룹 삭제에 실패했습니다');
      }
    } finally {
      setDeleteGroupDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  // 코드 그룹 활성화/비활성화
  const handleToggleGroupActivation = async (groupId: string, isActive: boolean) => {
    try {
      await userManagementService.toggleCodeGroupActivation(groupId, isActive);
      snackbar.success(`코드 그룹이 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      await loadCodeGroups();
    } catch (error) {
      console.error('❌ 코드 그룹 활성화 토글 실패:', error);
      snackbar.error('코드 그룹 상태 변경에 실패했습니다');
    }
  };

  // 코드 생성/수정 핸들러
  const handleSaveCode = async (values: Code) => {
    if (!selectedGroup) return;

    try {
      if (editingCode) {
        // 수정
        await userManagementService.updateCode(editingCode.code_id, {
          code_name: values.code_name,
          description: values.description,
          display_order: values.display_order,
          is_default: values.is_default,
          extended_attributes: values.extended_attributes,
        });
        snackbar.success('코드가 수정되었습니다');
      } else {
        // 생성
        await userManagementService.createCode(selectedGroup.group_id, {
          code_value: values.code_value,
          code_name: values.code_name,
          description: values.description,
          display_order: values.display_order,
          parent_code_id: values.parent_code_id,
          is_default: values.is_default,
          is_active: values.is_active,
          extended_attributes: values.extended_attributes,
        });
        snackbar.success('코드가 생성되었습니다');
      }
      setCodeModalOpen(false);
      setEditingCode(null);
      await loadCodes(selectedGroup.group_id);
    } catch (error) {
      console.error('❌ 코드 저장 실패:', error);
      snackbar.error(editingCode ? '코드 수정에 실패했습니다' : '코드 생성에 실패했습니다');
    }
  };

  // 코드 삭제
  const handleDeleteCode = async () => {
    if (!codeToDelete || !selectedGroup) return;

    try {
      await userManagementService.deleteCode(codeToDelete.code_id);
      snackbar.success('코드가 삭제되었습니다');
      await loadCodes(selectedGroup.group_id);
    } catch (error: unknown) {
      console.error('❌ 코드 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('하위')) {
        snackbar.error('하위 코드가 있는 코드는 삭제할 수 없습니다');
      } else {
        snackbar.error('코드 삭제에 실패했습니다');
      }
    } finally {
      setDeleteCodeDialogOpen(false);
      setCodeToDelete(null);
    }
  };

  // 코드 활성화/비활성화
  const handleToggleCodeActivation = async (codeId: number, isActive: boolean) => {
    try {
      await userManagementService.toggleCodeActivation(codeId, isActive);
      snackbar.success(`코드가 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      if (selectedGroup) {
        await loadCodes(selectedGroup.group_id);
      }
    } catch (error) {
      console.error('❌ 코드 활성화 토글 실패:', error);
      snackbar.error('코드 상태 변경에 실패했습니다');
    }
  };

  // 코드 그룹 테이블 컬럼
  const groupColumns: GridColDef[] = [
    {
      field: 'group_id',
      headerName: '그룹 ID',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'group_name',
      headerName: '그룹명',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'code_count',
      headerName: '코드 수',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'is_active',
      headerName: '상태',
      width: 100,
      renderCell: (params: GridRenderCellParams<CodeGroup>) => (
        <Switch
          checked={params.row.is_active}
          onChange={(e) => handleToggleGroupActivation(params.row.group_id, e.target.checked)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '액션',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CodeGroup>) => (
        <Box>
          <Tooltip title="수정">
            <IconButton
              size="small"
              onClick={() => {
                setEditingGroup(params.row);
                setGroupModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.code_count > 0 ? '코드가 있어 삭제 불가' : '삭제'}>
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={params.row.code_count > 0}
                onClick={() => {
                  setGroupToDelete(params.row);
                  setDeleteGroupDialogOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // 코드 테이블 컬럼
  const codeColumns: GridColDef[] = [
    {
      field: 'code_value',
      headerName: '코드 값',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'code_name',
      headerName: '코드명',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'display_order',
      headerName: '순서',
      width: 70,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'is_default',
      headerName: '기본',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Code>) =>
        params.row.is_default ? <Chip label="기본" size="small" color="primary" /> : null,
    },
    {
      field: 'is_active',
      headerName: '상태',
      width: 100,
      renderCell: (params: GridRenderCellParams<Code>) => (
        <Switch
          checked={params.row.is_active}
          onChange={(e) => handleToggleCodeActivation(params.row.code_id, e.target.checked)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '액션',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Code>) => (
        <Box>
          <Tooltip title="수정">
            <IconButton
              size="small"
              onClick={() => {
                setEditingCode(params.row);
                setCodeModalOpen(true);
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
                setCodeToDelete(params.row);
                setDeleteCodeDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // 검색 필터링
  const filteredGroups = codeGroups.filter(
    (group) =>
      !groupSearchText ||
      group.group_id.toLowerCase().includes(groupSearchText.toLowerCase()) ||
      group.group_name.toLowerCase().includes(groupSearchText.toLowerCase())
  );

  const filteredCodes = codes.filter(
    (code) =>
      !codeSearchText ||
      code.code_value.toLowerCase().includes(codeSearchText.toLowerCase()) ||
      code.code_name.toLowerCase().includes(codeSearchText.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        공통 코드 관리
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
        {/* 좌측: 코드 그룹 목록 */}
        <Box sx={{ width: '40%', minWidth: 400 }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="그룹 검색"
                  value={groupSearchText}
                  onChange={(e) => setGroupSearchText(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadCodeGroups}
                >
                  새로고침
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingGroup(null);
                    setGroupModalOpen(true);
                  }}
                >
                  그룹 추가
                </Button>
              </Box>
              <Typography variant="h6">코드 그룹</Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <DataGrid
                rows={filteredGroups}
                columns={groupColumns}
                loading={loadingGroups}
                getRowId={(row) => row.group_id}
                onRowClick={(params) => setSelectedGroup(params.row)}
                pageSizeOptions={[20, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 20 } },
                }}
                sx={{
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                  },
                  '& .MuiDataGrid-row.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* 우측: 코드 목록 */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              {selectedGroup ? (
                <>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="코드 검색"
                      value={codeSearchText}
                      onChange={(e) => setCodeSearchText(e.target.value)}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => loadCodes(selectedGroup.group_id)}
                    >
                      새로고침
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingCode(null);
                        setCodeModalOpen(true);
                      }}
                    >
                      코드 추가
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">코드 목록</Typography>
                    <Chip label={selectedGroup.group_name} color="primary" size="small" />
                    {selectedGroup.is_system_managed && (
                      <Chip label="시스템 관리" color="warning" size="small" />
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="h6">코드 목록</Typography>
              )}
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              {selectedGroup ? (
                <DataGrid
                  rows={filteredCodes}
                  columns={codeColumns}
                  loading={loadingCodes}
                  getRowId={(row) => row.code_id}
                  pageSizeOptions={[20, 50, 100]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                  }}
                >
                  <Typography>좌측에서 코드 그룹을 선택하세요</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* 코드 그룹 폼 모달 */}
      <CodeGroupFormModal
        open={groupModalOpen}
        onClose={() => {
          setGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onSave={handleSaveGroup}
        codeGroup={editingGroup}
      />

      {/* 코드 폼 모달 */}
      {selectedGroup && (
        <CodeFormModal
          open={codeModalOpen}
          onClose={() => {
            setCodeModalOpen(false);
            setEditingCode(null);
          }}
          onSave={handleSaveCode}
          code={editingCode}
          groupId={selectedGroup.group_id}
          codes={codes}
        />
      )}

      {/* 코드 그룹 삭제 확인 다이얼로그 */}
      <Dialog open={deleteGroupDialogOpen} onClose={() => setDeleteGroupDialogOpen(false)}>
        <DialogTitle>코드 그룹 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            {groupToDelete?.code_count === 0
              ? `"${groupToDelete?.group_name}" 코드 그룹을 삭제하시겠습니까?`
              : '코드가 있는 그룹은 삭제할 수 없습니다'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGroupDialogOpen(false)}>취소</Button>
          {groupToDelete?.code_count === 0 && (
            <Button onClick={handleDeleteGroup} color="error" variant="contained">
              삭제
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 코드 삭제 확인 다이얼로그 */}
      <Dialog open={deleteCodeDialogOpen} onClose={() => setDeleteCodeDialogOpen(false)}>
        <DialogTitle>코드 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{codeToDelete?.code_name}" 코드를 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCodeDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteCode} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
