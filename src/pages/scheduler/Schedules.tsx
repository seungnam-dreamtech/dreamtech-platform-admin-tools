import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Modal, Tag, Typography, Select } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Task, Schedule, ScheduleType } from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';
import { ScheduleFormModal } from '../../components/scheduler/ScheduleFormModal';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<ScheduleType | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = schedules;

    // 타입 필터
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((s) => s.schedule_type === typeFilter);
    }

    // 검색 필터
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.description?.toLowerCase().includes(keyword) ||
          s.schedule_group?.toLowerCase().includes(keyword)
      );
    }

    setFilteredSchedules(filtered);
  }, [searchText, typeFilter, schedules]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, tasksData] = await Promise.all([
        schedulerService.getSchedules(),
        schedulerService.getTasks(),
      ]);

      // Task 정보를 Schedule에 매핑
      const schedulesWithTask = schedulesData.map((schedule) => ({
        ...schedule,
        task: tasksData.find((task) => task.id === schedule.task_id),
      }));

      setSchedules(schedulesWithTask);
      setTasks(tasksData);
      setFilteredSchedules(schedulesWithTask);
    } catch (error: any) {
      console.error('Failed to load schedules:', error);
      message.error('스케쥴 목록 조회에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(undefined);
    setModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

  const handleDelete = (schedule: Schedule) => {
    confirm({
      title: '스케쥴 삭제',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          <p>
            스케쥴 <Text strong>{schedule.name}</Text>을(를) 삭제하시겠습니까?
          </p>
          <p>
            <Text type="warning">스케쥴이 즉시 해제되어 더 이상 실행되지 않습니다.</Text>
          </p>
        </>
      ),
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await schedulerService.deleteSchedule(schedule.id);
          message.success('스케쥴이 삭제되었습니다');
          loadData();
        } catch (error: any) {
          console.error('Failed to delete schedule:', error);
          message.error(error.message || '스케쥴 삭제에 실패했습니다');
        }
      },
    });
  };

  const handleModalSave = () => {
    setModalOpen(false);
    loadData();
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedSchedule(undefined);
  };

  const isScheduleActive = (schedule: Schedule): boolean => {
    if (schedule.deleted_at) return false;
    const now = dayjs();
    const start = dayjs(schedule.start_at);
    const end = dayjs(schedule.end_at);
    return now.isAfter(start) && now.isBefore(end);
  };

  const getScheduleStatus = (schedule: Schedule): {
    text: string;
    color: string;
  } => {
    if (schedule.deleted_at) {
      return { text: '삭제됨', color: 'red' };
    }

    const now = dayjs();
    const start = dayjs(schedule.start_at);
    const end = dayjs(schedule.end_at);

    if (now.isBefore(start)) {
      return { text: '대기중', color: 'blue' };
    } else if (now.isAfter(end)) {
      return { text: '종료됨', color: 'default' };
    } else {
      return { text: '실행중', color: 'green' };
    }
  };

  const columns: ColumnsType<Schedule> = [
    {
      title: '스케쥴명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '작업 클래스',
      key: 'task',
      width: 180,
      ellipsis: true,
      render: (_: any, record: Schedule) => (
        <Text>{record.task?.name || <Text type="secondary">-</Text>}</Text>
      ),
    },
    {
      title: '타입',
      dataIndex: 'schedule_type',
      key: 'schedule_type',
      width: 100,
      align: 'center',
      render: (type: ScheduleType) => (
        <Tag color={type === 'CRON' ? 'blue' : 'purple'}>{type}</Tag>
      ),
    },
    {
      title: '스케쥴 표현식',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 180,
      ellipsis: true,
      render: (text?: string) => (text ? <Text code>{text}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: '그룹',
      dataIndex: 'schedule_group',
      key: 'schedule_group',
      width: 120,
      ellipsis: true,
      render: (text?: string) => text || <Text type="secondary">-</Text>,
    },
    {
      title: '실행 기간',
      key: 'period',
      width: 200,
      render: (_: any, record: Schedule) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            시작: {dayjs(record.start_at).format('YYYY-MM-DD HH:mm')}
          </Text>
          <Text style={{ fontSize: 12 }}>
            종료: {dayjs(record.end_at).format('YYYY-MM-DD HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: '재시도',
      dataIndex: 'retry_count',
      key: 'retry_count',
      width: 80,
      align: 'center',
      render: (count?: number) => count ?? 0,
    },
    {
      title: '상태',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_: any, record: Schedule) => {
        const status = getScheduleStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: Schedule) => (
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
        <Title level={2}>
          <ClockCircleOutlined /> 스케쥴 관리
        </Title>
        <Text type="secondary">
          등록된 작업 클래스의 실행 스케쥴을 관리합니다.
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
            placeholder="스케쥴명, 그룹 검색"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 150 }}
          >
            <Option value="ALL">전체 타입</Option>
            <Option value="CRON">CRON</Option>
            <Option value="EVENT">EVENT</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            새로고침
          </Button>
        </Space>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          스케쥴 등록
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSchedules}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
        }}
      />

      <ScheduleFormModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onSave={handleModalSave}
        schedule={selectedSchedule}
        tasks={tasks}
      />
    </div>
  );
};

export default Schedules;
