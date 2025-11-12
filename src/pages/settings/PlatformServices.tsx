// 플랫폼 서비스 관리 페이지

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ServiceFormModal } from '../../components/settings/ServiceFormModal';
import { userManagementService } from '../../services/userManagementService';
import type { ServiceScope } from '../../types/user-management';
import { useSnackbar } from '../../contexts/SnackbarContext';

export default function PlatformServices() {
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceScope[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceScope | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const snackbar = useSnackbar();

  // 서비스 목록 조회
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getServiceScopes();
      console.log('📋 Service Scopes fetched:', data);
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      snackbar.error('서비스 목록 조회에 실패했습니다');
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const filtered = services.filter(
        (service) =>
          service.service_id.toLowerCase().includes(keyword) ||
          service.description.toLowerCase().includes(keyword)
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchKeyword, services]);

  // 서비스 추가/수정
  const handleSave = async (serviceData: ServiceScope) => {
    try {
      if (selectedService) {
        // 수정 모드: 모달에서 API 호출을 처리하므로 목록만 새로고침
        fetchServices();
      } else {
        // 추가 모드: 새로운 서비스 생성
        await userManagementService.createServiceScope({
          service_id: serviceData.service_id,
          description: serviceData.description,
        });
        snackbar.success('새 서비스가 추가되었습니다');
        fetchServices();
      }
      setModalOpen(false);
      setSelectedService(null);
    } catch (error) {
      snackbar.error('서비스 저장에 실패했습니다');
      console.error('Failed to save service:', error);
    }
  };

  // 서비스 활성화/비활성화 토글
  const handleToggleActive = async (serviceId: string, isActive: boolean) => {
    try {
      await userManagementService.updateServiceScope(serviceId, { is_active: isActive });
      snackbar.success(`서비스가 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchServices();
    } catch (error) {
      snackbar.error('서비스 상태 변경에 실패했습니다');
      console.error('Failed to toggle service:', error);
    }
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <Typography variant="body2" color="textSecondary">
          #{params.row.id}
        </Typography>
      ),
    },
    {
      field: 'service_id',
      headerName: '서비스 ID',
      width: 180,
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.service_id}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: '설명',
      width: 250,
      flex: 1,
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <Typography variant="body2" color="textSecondary" noWrap>
          {params.row.description || '-'}
        </Typography>
      ),
    },
    {
      field: 'bit_position',
      headerName: '비트 위치',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <Chip label={`Bit ${params.row.bit_position}`} color="secondary" size="small" />
      ),
    },
    {
      field: 'is_active',
      headerName: '상태',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <Switch
          size="small"
          checked={params.row.is_active}
          onChange={(e) => handleToggleActive(params.row.service_id, e.target.checked)}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일',
      width: 110,
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.created_at ? new Date(params.row.created_at).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'updated_at',
      headerName: '수정일',
      width: 110,
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <Typography variant="caption" color="textSecondary">
          {params.row.updated_at ? new Date(params.row.updated_at).toLocaleDateString('ko-KR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<ServiceScope>) => (
        <IconButton
          size="small"
          onClick={() => {
            setSelectedService(params.row);
            setModalOpen(true);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            플랫폼 서비스 ({filteredServices.length}개)
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            플랫폼의 마이크로서비스 스코프 관리
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchServices}
            disabled={loading}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedService(null);
              setModalOpen(true);
            }}
          >
            서비스 추가
          </Button>
        </Box>
      </Box>

      {/* 검색 */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="서비스명 또는 설명으로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="small"
          sx={{ width: 400 }}
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
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredServices}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'id', sort: 'asc' }] },
          }}
          disableRowSelectionOnClick
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

      {/* 서비스 추가/수정 모달 */}
      <ServiceFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSave}
        service={selectedService}
      />
    </Box>
  );
}
