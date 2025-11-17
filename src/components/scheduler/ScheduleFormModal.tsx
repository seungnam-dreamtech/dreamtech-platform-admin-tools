import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  message,
  Alert,
  Space,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type {
  Task,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleType,
} from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface ScheduleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (schedule: Schedule) => void;
  schedule?: Schedule;
  tasks: Task[];
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  open,
  onCancel,
  onSave,
  schedule,
  tasks,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('CRON');

  const isEditing = !!schedule;

  useEffect(() => {
    if (open) {
      setHasChanges(false);

      if (schedule) {
        // 수정 모드: 기존 데이터 로드
        form.setFieldsValue({
          task_id: schedule.task_id,
          name: schedule.name,
          description: schedule.description || '',
          schedule_group: schedule.schedule_group || '',
          schedule_type: schedule.schedule_type,
          schedule: schedule.schedule || '',
          retry_count: schedule.retry_count || 0,
          dateRange: [dayjs(schedule.start_at), dayjs(schedule.end_at)],
          timezone: schedule.timezone || 'Asia/Seoul',
        });
        setScheduleType(schedule.schedule_type);
      } else {
        // 생성 모드: 폼 초기화
        form.resetFields();
        setScheduleType('CRON');
        form.setFieldsValue({
          schedule_type: 'CRON',
          retry_count: 0,
          timezone: 'Asia/Seoul',
        });
      }
    }
  }, [open, schedule, form]);

  const handleFormChange = () => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    // 수정 모드: 필드 변경 여부 체크
    const fieldsToCheck = [
      'name',
      'description',
      'schedule_type',
      'schedule',
      'retry_count',
      'dateRange',
      'timezone',
    ];
    const touched = form.isFieldsTouched(fieldsToCheck);
    setHasChanges(touched);
  };

  const handleScheduleTypeChange = (value: ScheduleType) => {
    setScheduleType(value);
    form.setFieldValue('schedule', '');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const [startAt, endAt] = values.dateRange as [Dayjs, Dayjs];

      if (isEditing && schedule) {
        // 수정 모드
        if (!hasChanges) {
          message.info('변경된 내용이 없습니다');
          setLoading(false);
          return;
        }

        const updateData: UpdateScheduleRequest = {
          name: values.name,
          description: values.description,
          schedule_type: values.schedule_type,
          schedule: values.schedule,
          retry_count: values.retry_count,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          timezone: values.timezone,
        };

        await schedulerService.updateSchedule(schedule.id, updateData);
        message.success('스케쥴이 수정되었습니다');

        // 최신 데이터 조회
        const updatedSchedule = await schedulerService.getSchedule(schedule.id);
        onSave(updatedSchedule);
      } else {
        // 생성 모드
        const createData: CreateScheduleRequest = {
          task_id: values.task_id,
          name: values.name,
          description: values.description,
          schedule_group: values.schedule_group,
          schedule_type: values.schedule_type,
          schedule: values.schedule,
          retry_count: values.retry_count,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          timezone: values.timezone,
        };

        const createdSchedule = await schedulerService.createSchedule(createData);
        message.success('스케쥴이 등록되었습니다');
        onSave(createdSchedule);
      }

      form.resetFields();
    } catch (error: any) {
      console.error('Failed to save schedule:', error);
      message.error(error.message || '스케쥴 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setHasChanges(false);
    onCancel();
  };

  const isSaveButtonDisabled = isEditing && !hasChanges;

  const getCronHelp = () => {
    return (
      <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Cron 표현식 형식: 초 분 시 일 월 요일
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          예시: 0 0 2 * * ? (매일 새벽 2시)
        </Text>
      </Space>
    );
  };

  return (
    <Modal
      title={isEditing ? '스케쥴 수정' : '스케쥴 등록'}
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={isEditing ? '수정' : '등록'}
      cancelText="취소"
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="작업 클래스"
          name="task_id"
          rules={[{ required: true, message: '작업 클래스를 선택해주세요' }]}
        >
          <Select
            placeholder="실행할 작업 클래스를 선택하세요"
            disabled={isEditing}
            showSearch
            optionFilterProp="children"
          >
            {tasks
              .filter((task) => !task.deleted_at)
              .map((task) => (
                <Option key={task.id} value={task.id}>
                  {task.name} ({task.task_class_name})
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="스케쥴명"
          name="name"
          rules={[
            { required: true, message: '스케쥴명을 입력해주세요' },
            { max: 100, message: '스케쥴명은 최대 100자까지 입력 가능합니다' },
          ]}
        >
          <Input placeholder="예: 일일 데이터 정리 스케쥴" />
        </Form.Item>

        <Form.Item label="스케쥴 그룹" name="schedule_group">
          <Input placeholder="스케쥴을 그룹화할 수 있습니다 (선택사항)" />
        </Form.Item>

        <Form.Item
          label="스케쥴 타입"
          name="schedule_type"
          rules={[{ required: true, message: '스케쥴 타입을 선택해주세요' }]}
        >
          <Select onChange={handleScheduleTypeChange}>
            <Option value="CRON">CRON (주기적 실행)</Option>
            <Option value="EVENT">EVENT (이벤트 기반)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={scheduleType === 'CRON' ? 'Cron 표현식' : 'Event ID'}
          name="schedule"
          help={scheduleType === 'CRON' ? getCronHelp() : undefined}
        >
          <Input
            placeholder={
              scheduleType === 'CRON'
                ? '예: 0 0 2 * * ? (매일 새벽 2시)'
                : 'Event ID를 입력하세요'
            }
          />
        </Form.Item>

        <Form.Item
          label="실행 기간"
          name="dateRange"
          rules={[{ required: true, message: '실행 기간을 선택해주세요' }]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder={['시작일시', '종료일시']}
          />
        </Form.Item>

        <Form.Item
          label="타임존"
          name="timezone"
          rules={[{ required: true, message: '타임존을 선택해주세요' }]}
        >
          <Select showSearch>
            <Option value="Asia/Seoul">Asia/Seoul (한국 표준시)</Option>
            <Option value="UTC">UTC (협정 세계시)</Option>
            <Option value="America/New_York">America/New_York (동부 표준시)</Option>
            <Option value="Europe/London">Europe/London (그리니치 표준시)</Option>
            <Option value="Asia/Tokyo">Asia/Tokyo (일본 표준시)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="재시도 횟수"
          name="retry_count"
          tooltip="작업 실패 시 자동으로 재시도할 횟수"
        >
          <InputNumber min={0} max={10} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="설명" name="description">
          <TextArea
            rows={3}
            placeholder="스케쥴에 대한 설명을 입력해주세요"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>

      {scheduleType === 'CRON' && (
        <Alert
          message="Cron 표현식 가이드"
          description={
            <Space direction="vertical" size="small">
              <Text>* * * * * * (초 분 시 일 월 요일)</Text>
              <Text>- 매분 실행: 0 * * * * ?</Text>
              <Text>- 매시간 실행: 0 0 * * * ?</Text>
              <Text>- 매일 자정 실행: 0 0 0 * * ?</Text>
              <Text>- 평일 오전 9시 실행: 0 0 9 ? * MON-FRI</Text>
            </Space>
          }
          type="info"
          showIcon
        />
      )}
    </Modal>
  );
};
