import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';
import { useAuth } from '../../hooks/useAuth';

const { TextArea } = Input;

interface TaskFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (task: Task) => void;
  task?: Task;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onCancel,
  onSave,
  task,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useAuth();

  const isEditing = !!task;

  useEffect(() => {
    if (open) {
      setHasChanges(false);

      if (task) {
        // 수정 모드: 기존 데이터 로드
        form.setFieldsValue({
          name: task.name,
          description: task.description || '',
          task_class_name: task.task_class_name,
        });
      } else {
        // 생성 모드: 폼 초기화
        form.resetFields();
      }
    }
  }, [open, task, form]);

  const handleFormChange = () => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    // 수정 모드: 필드 변경 여부 체크
    const fieldsToCheck = ['name', 'description', 'task_class_name'];
    const touched = form.isFieldsTouched(fieldsToCheck);
    setHasChanges(touched);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditing && task) {
        // 수정 모드
        if (!hasChanges) {
          message.info('변경된 내용이 없습니다');
          setLoading(false);
          return;
        }

        const updateData: UpdateTaskRequest = {
          name: values.name,
          description: values.description,
          task_class_name: values.task_class_name,
        };

        await schedulerService.updateTask(task.id, updateData);
        message.success('작업 클래스가 수정되었습니다');

        // 최신 데이터 조회
        const updatedTask = await schedulerService.getTask(task.id);
        onSave(updatedTask);
      } else {
        // 생성 모드
        const createData: CreateTaskRequest = {
          name: values.name,
          description: values.description,
          task_class_name: values.task_class_name,
          creator_id: user?.id || 'unknown',
        };

        const createdTask = await schedulerService.createTask(createData);
        message.success('작업 클래스가 등록되었습니다');
        onSave(createdTask);
      }

      form.resetFields();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      message.error(error.message || '작업 클래스 저장에 실패했습니다');
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

  return (
    <Modal
      title={isEditing ? '작업 클래스 수정' : '작업 클래스 등록'}
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={isEditing ? '수정' : '등록'}
      cancelText="취소"
      okButtonProps={{ disabled: isSaveButtonDisabled }}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="작업명"
          name="name"
          rules={[
            { required: true, message: '작업명을 입력해주세요' },
            { max: 100, message: '작업명은 최대 100자까지 입력 가능합니다' },
          ]}
        >
          <Input placeholder="예: 일일 데이터 정리 작업" />
        </Form.Item>

        <Form.Item
          label="작업 클래스명"
          name="task_class_name"
          rules={[
            { required: true, message: '작업 클래스명을 입력해주세요' },
            {
              pattern: /^[a-zA-Z_$][a-zA-Z0-9_$.]*$/,
              message: '올바른 Java 클래스명 형식이 아닙니다',
            },
          ]}
          tooltip="실행할 Java 클래스의 전체 경로 (예: com.example.tasks.DataCleanupTask)"
        >
          <Input placeholder="com.example.tasks.MyTask" />
        </Form.Item>

        <Form.Item label="설명" name="description">
          <TextArea
            rows={4}
            placeholder="작업에 대한 설명을 입력해주세요"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
