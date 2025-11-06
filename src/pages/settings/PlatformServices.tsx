// 플랫폼 서비스 관리 페이지

import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Input, Switch } from 'antd';
import { PlusOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ServiceFormModal } from '../../components/settings/ServiceFormModal';
import { userManagementService } from '../../services/userManagementService';
import type { ServiceScope } from '../../types/user-management';

const { Search } = Input;

export default function PlatformServices() {
  const [services, setServices] = useState<ServiceScope[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceScope[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceScope | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 서비스 목록 조회
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getServiceScopes();
      console.log('📋 Service Scopes fetched:', data);
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      message.error('서비스 목록 조회에 실패했습니다');
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
        service =>
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
        message.success('새 서비스가 추가되었습니다');
        fetchServices();
      }
      setModalOpen(false);
      setSelectedService(null);
    } catch (error) {
      message.error('서비스 저장에 실패했습니다');
      console.error('Failed to save service:', error);
    }
  };

  // 서비스 활성화/비활성화 토글
  const handleToggleActive = async (serviceId: string, isActive: boolean) => {
    try {
      await userManagementService.updateServiceScope(serviceId, { is_active: isActive });
      message.success(`서비스가 ${isActive ? '활성화' : '비활성화'}되었습니다`);
      fetchServices();
    } catch (error) {
      message.error('서비스 상태 변경에 실패했습니다');
      console.error('Failed to toggle service:', error);
    }
  };

  // 테이블 컬럼 정의
  const columns: ColumnsType<ServiceScope> = [
    {
      title: <span style={{ fontSize: '11px' }}>ID</span>,
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
      render: (id) => <span style={{ fontSize: '11px', color: '#999' }}>#{id}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>서비스 ID</span>,
      dataIndex: 'service_id',
      key: 'service_id',
      width: 180,
      sorter: (a, b) => a.service_id.localeCompare(b.service_id),
      render: (serviceId) => (
        <span style={{ fontWeight: 500, fontSize: '12px' }}>{serviceId}</span>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>설명</span>,
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
      render: (text) => <span style={{ fontSize: '11px', color: '#666' }}>{text || '-'}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>비트 위치</span>,
      dataIndex: 'bit_position',
      key: 'bit_position',
      width: 90,
      align: 'center',
      sorter: (a, b) => a.bit_position - b.bit_position,
      render: (position) => (
        <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
          Bit {position}
        </Tag>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>상태</span>,
      dataIndex: 'is_active',
      key: 'is_active',
      width: 70,
      align: 'center',
      filters: [
        { text: '활성', value: true },
        { text: '비활성', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive: boolean, record) => (
        <Switch
          size="small"
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.service_id, checked)}
        />
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>생성일</span>,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date) => (
        <span style={{ fontSize: '10px', color: '#999' }}>
          {new Date(date).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>작업</span>,
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          type="text"
          onClick={() => {
            setSelectedService(record);
            setModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            플랫폼 서비스 ({filteredServices.length}개)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>
            플랫폼의 마이크로서비스 스코프 관리
          </span>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchServices} loading={loading}>
            새로고침
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedService(null);
              setModalOpen(true);
            }}
          >
            서비스 추가
          </Button>
        </Space>
      </div>

      {/* 검색 */}
      <Search
        placeholder="서비스명 또는 설명으로 검색"
        allowClear
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ width: 400 }}
      />

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredServices}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
        }}
        scroll={{ x: 1200 }}
      />

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
    </Space>
  );
}