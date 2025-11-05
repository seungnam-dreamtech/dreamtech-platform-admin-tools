// Permission Template 관리 페이지

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  Select,
  Tooltip,
  Switch,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { PermissionTemplate } from '../../types/user-management';
import TemplateFormModal from '../../components/settings/TemplateFormModal';
import TemplateDetailModal from '../../components/settings/TemplateDetailModal';
import { userManagementService } from '../../services/userManagementService';

const { Search } = Input;

export default function PermissionTemplates() {
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 카테고리 목록 (템플릿에서 추출)
  const [categories, setCategories] = useState<string[]>([]);

  // 템플릿 목록 조회
  const fetchTemplates = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await userManagementService.getPermissionTemplates({
        category: filterCategory,
        isActive: filterActive,
        page: page - 1, // Spring Page는 0부터 시작
        size: pageSize,
      });

      setTemplates(response.content);
      setPagination({
        current: response.number + 1, // Spring Page number는 0부터 시작
        pageSize: response.size,
        total: response.totalElements,
      });

      // 카테고리 목록 추출 (중복 제거)
      const uniqueCategories = Array.from(
        new Set(response.content.map((t) => t.category).filter((c) => c))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      message.error('Permission Template 목록 조회에 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(pagination.current, pagination.pageSize);
  }, [filterCategory, filterActive]);

  // 테이블 페이지 변경 핸들러
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchTemplates(newPagination.current || 1, newPagination.pageSize || 10);
  };

  // 템플릿 추가/수정
  const handleSave = async (templateData: any) => {
    try {
      if (selectedTemplate) {
        // 수정: 모달에서 이미 API 호출했으므로 목록만 새로고침
        message.success('Permission Template이 수정되었습니다');
      } else {
        // 추가: 새로운 템플릿 생성
        await userManagementService.createPermissionTemplate(templateData);
        message.success('새 Permission Template이 추가되었습니다');
      }
      fetchTemplates(pagination.current, pagination.pageSize);
      setModalOpen(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      message.error(error?.message || 'Permission Template 저장에 실패했습니다');
      console.error(error);
    }
  };

  // 템플릿 삭제
  const handleDelete = async (id: number) => {
    try {
      await userManagementService.deletePermissionTemplate(id);
      message.success('Permission Template이 삭제되었습니다');
      fetchTemplates(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.message || 'Permission Template 삭제에 실패했습니다');
      console.error(error);
    }
  };

  // 활성화/비활성화 토글
  const handleToggleActive = async (id: number, currentActive: boolean, name: string) => {
    const newActiveState = !currentActive;
    try {
      await userManagementService.togglePermissionTemplateActivation(id, newActiveState);
      message.success(`"${name}" 템플릿이 ${newActiveState ? '활성화' : '비활성화'}되었습니다`);
      fetchTemplates(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.message || '활성 상태 변경에 실패했습니다');
      console.error(error);
    }
  };

  // 상세 보기 모달 열기
  const handleOpenDetailModal = (template: PermissionTemplate) => {
    setViewingTemplate(template);
    setDetailModalOpen(true);
  };

  // 상세 보기 모달 닫기
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setViewingTemplate(null);
  };

  // 검색 필터 적용
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
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

  // 테이블 컬럼 정의
  const columns: ColumnsType<PermissionTemplate> = [
    {
      title: <span style={{ fontSize: '11px' }}>ID</span>,
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.id - b.id,
      render: (id) => <span style={{ fontSize: '11px', color: '#999' }}>{id}</span>,
    },
    {
      title: <span style={{ fontSize: '11px' }}>템플릿 이름</span>,
      dataIndex: 'name',
      key: 'name',
      width: 220,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Tooltip title={record.description || text}>
          <span style={{ fontSize: '12px', fontWeight: 500 }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>카테고리</span>,
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) =>
        category ? (
          <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
            {category}
          </Tag>
        ) : (
          <span style={{ fontSize: '11px', color: '#999' }}>-</span>
        ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>포함된 역할</span>,
      key: 'roles',
      width: 350,
      render: (_, record) => {
        const totalRoles = record.global_roles.length + record.service_roles.length;

        if (totalRoles === 0) {
          return <span style={{ fontSize: '11px', color: '#999' }}>역할 없음</span>;
        }

        return (
          <Tooltip
            title={
              <div>
                {record.global_roles.length > 0 && (
                  <div>
                    <strong>글로벌 역할:</strong>
                    <br />
                    {record.global_roles.map((r) => `• ${r.role_id}: ${r.display_name}`).join('\n')}
                  </div>
                )}
                {record.service_roles.length > 0 && (
                  <div style={{ marginTop: record.global_roles.length > 0 ? 8 : 0 }}>
                    <strong>서비스 역할:</strong>
                    <br />
                    {record.service_roles.map((r) => `• ${r.service_id}:${r.role_name}`).join('\n')}
                  </div>
                )}
              </div>
            }
          >
            <Space wrap size={4}>
              {/* 글로벌 역할 표시 (최대 2개) */}
              {record.global_roles.slice(0, 2).map((role) => (
                <Tag key={role.role_id} color="purple" style={{ fontSize: '10px', margin: 0 }}>
                  {role.role_id}
                </Tag>
              ))}

              {/* 서비스 역할 표시 (최대 2개) */}
              {record.service_roles.slice(0, 2).map((role) => (
                <Tag
                  key={`${role.service_id}:${role.role_name}`}
                  color="cyan"
                  style={{ fontSize: '10px', margin: 0 }}
                >
                  {role.service_id}
                </Tag>
              ))}

              {/* 총 개수가 4개 초과 시 +N 표시 */}
              {totalRoles > 4 && (
                <Tag color="default" style={{ fontSize: '10px', margin: 0 }}>
                  +{totalRoles - 4}
                </Tag>
              )}
            </Space>
          </Tooltip>
        );
      },
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
          onChange={() => handleToggleActive(record.id, record.is_active, record.name)}
        />
      ),
    },
    {
      title: <span style={{ fontSize: '11px' }}>작업</span>,
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="text"
            onClick={() => {
              setSelectedTemplate(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Permission Template 삭제"
            description={`"${record.name}" 템플릿을 삭제하시겠습니까?`}
            onConfirm={() => handleDelete(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button icon={<DeleteOutlined />} size="small" type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            Permission Templates ({filteredTemplates.length}개)
          </span>
          <span style={{ marginLeft: 8, color: '#999' }}>권한 역할 조합 템플릿 관리</span>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchTemplates(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            새로고침
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedTemplate(null);
              setModalOpen(true);
            }}
          >
            템플릿 추가
          </Button>
        </Space>
      </div>

      {/* 필터 및 검색 */}
      <Space style={{ width: '100%' }} size="middle">
        <Select
          placeholder="카테고리 필터"
          allowClear
          style={{ width: 200 }}
          value={filterCategory}
          onChange={setFilterCategory}
          suffixIcon={<FilterOutlined />}
          options={[
            { label: '전체 카테고리', value: undefined },
            ...categories.map((category) => ({
              label: category,
              value: category,
            })),
          ]}
        />
        <Select
          placeholder="활성 상태"
          allowClear
          style={{ width: 150 }}
          value={filterActive}
          onChange={setFilterActive}
          suffixIcon={<FilterOutlined />}
          options={[
            { label: '전체', value: undefined },
            { label: '활성만', value: true },
            { label: '비활성만', value: false },
          ]}
        />
        <Search
          placeholder="템플릿명, 설명, 카테고리로 검색"
          allowClear
          value={searchKeyword}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 500 }}
        />
      </Space>

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredTemplates}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: (event) => {
            // Switch, Button 클릭 시에는 상세 모달 열지 않음
            const target = event.target as HTMLElement;
            if (
              target.closest('.ant-switch') ||
              target.closest('.ant-btn') ||
              target.closest('.ant-popover')
            ) {
              return;
            }
            handleOpenDetailModal(record);
          },
          style: { cursor: 'pointer' },
        })}
      />

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
        onClose={handleCloseDetailModal}
        template={viewingTemplate}
      />
    </Space>
  );
}