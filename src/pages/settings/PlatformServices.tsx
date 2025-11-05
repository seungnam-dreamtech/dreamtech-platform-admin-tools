// 플랫폼 서비스 관리 페이지

import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Input, Typography, Switch, Alert } from 'antd';
import { PlusOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ServiceFormModal } from '../../components/settings/ServiceFormModal';
import { userManagementService } from '../../services/userManagementService';
import type { ServiceScope } from '../../types/user-management';

const { Search } = Input;
const { Title, Text } = Typography;

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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      render: (id) => <Text type="secondary">#{id}</Text>,
    },
    {
      title: '서비스 ID',
      dataIndex: 'service_id',
      key: 'service_id',
      width: 200,
      sorter: (a, b) => a.service_id.localeCompare(b.service_id),
      render: (serviceId) => (
        <Tag color="cyan" style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {serviceId}
        </Tag>
      ),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '비트 위치',
      dataIndex: 'bit_position',
      key: 'bit_position',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.bit_position - b.bit_position,
      render: (position) => (
        <Tag color="purple">Bit {position}</Tag>
      ),
    },
    {
      title: '활성 상태',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      align: 'center',
      filters: [
        { text: '활성', value: true },
        { text: '비활성', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.service_id, checked)}
        />
      ),
    },
    {
      title: '생성일시',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleString('ko-KR')}
        </Text>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => {
            setSelectedService(record);
            setModalOpen(true);
          }}
        >
          수정
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 안내 메시지 */}
          <Alert
            message="서비스 스코프 (Service Scopes) 관리"
            description={
              <div>
                <p>서비스 스코프는 플랫폼에서 제공하는 마이크로서비스를 정의합니다.</p>
                <ul style={{ marginLeft: -16, marginBottom: 0 }}>
                  <li><strong>서비스 ID</strong>: 고유한 서비스 식별자 (예: auth, notification, ecg-analysis)</li>
                  <li><strong>비트 위치</strong>: 권한 비트마스크에서의 위치 (자동 할당)</li>
                  <li><strong>활성 상태</strong>: 서비스 사용 여부를 실시간으로 제어합니다</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                플랫폼 서비스 관리
              </Title>
              <Text type="secondary">
                플랫폼의 마이크로서비스 스코프를 관리합니다
              </Text>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchServices}
                loading={loading}
              >
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
            scroll={{ x: 1400 }}
          />
        </Space>
      </Card>

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
    </div>
  );
}