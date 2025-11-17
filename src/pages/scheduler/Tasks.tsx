import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Modal, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Task } from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';
import { TaskFormModal } from '../../components/scheduler/TaskFormModal';

const { Title, Text } = Typography;
const { confirm } = Modal;

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  // 초기 데이터 로드
  useEffect(() => {
    loadTasks();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const keyword = searchText.toLowerCase();
    const filtered = tasks.filter(
      (task) =>
        task.name.toLowerCase().includes(keyword) ||
        task.task_class_name.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword)
    );
    setFilteredTasks(filtered);
  }, [searchText, tasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await schedulerService.getTasks();
      setTasks(data);
      setFilteredTasks(data);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      message.error('작업 목록 조회에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTask(undefined);
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    confirm({
      title: '작업 클래스 삭제',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          <p>
            작업 클래스 <Text strong>{task.name}</Text>을(를) 삭제하시겠습니까?
          </p>
          <p>
            <Text type="warning">
              이 작업에 연결된 스케쥴이 있는 경우 즉시 스케쥴이 해제됩니다.
            </Text>
          </p>
        </>
      ),
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await schedulerService.deleteTask(task.id);
          message.success('작업 클래스가 삭제되었습니다');
          loadTasks();
        } catch (error: any) {
          console.error('Failed to delete task:', error);
          message.error(error.message || '작업 클래스 삭제에 실패했습니다');
        }
      },
    });
  };

  const handleModalSave = (task: Task) => {
    setModalOpen(false);
    loadTasks();
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedTask(undefined);
  };

  const columns: ColumnsType<Task> = [
    {
      title: '작업명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '작업 클래스명',
      dataIndex: 'task_class_name',
      key: 'task_class_name',
      width: 300,
      ellipsis: true,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text?: string) => text || <Text type="secondary">-</Text>,
    },
    {
      title: '생성일시',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('ko-KR'),
    },
    {
      title: '상태',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_: any, record: Task) => (
        <Tag color={record.deleted_at ? 'red' : 'green'}>
          {record.deleted_at ? '삭제됨' : '활성'}
        </Tag>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: Task) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!!record.deleted_at}
          >
            수정
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={!!record.deleted_at}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>작업 클래스 관리</Title>
        <Text type="secondary">
          스케쥴러를 통해 실행될 배치 작업 클래스를 관리합니다.
        </Text>
      </div>

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Input
            placeholder="작업명, 클래스명 검색"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTasks}
            loading={loading}
          >
            새로고침
          </Button>
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          작업 클래스 등록
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTasks}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
        }}
      />

      <TaskFormModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onSave={handleModalSave}
        task={selectedTask}
      />
    </div>
  );
};

export default Tasks;
