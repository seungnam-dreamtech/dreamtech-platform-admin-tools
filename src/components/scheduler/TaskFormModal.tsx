import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface TaskFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (task: Task) => void;
  task?: Task;
}

interface FormData {
  name: string;
  description: string;
  task_class_name: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onCancel,
  onSave,
  task,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    task_class_name: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useAuth();
  const snackbar = useSnackbar();

  const isEditing = !!task;

  useEffect(() => {
    if (open) {
      setHasChanges(false);
      setErrors({});

      if (task) {
        // 수정 모드: 기존 데이터 로드
        setFormData({
          name: task.name,
          description: task.description || '',
          task_class_name: task.task_class_name,
        });
      } else {
        // 생성 모드: 폼 초기화
        setFormData({
          name: '',
          description: '',
          task_class_name: '',
        });
      }
    }
  }, [open, task]);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (!isEditing || field !== 'description') {
      setHasChanges(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '작업명을 입력해주세요';
    } else if (formData.name.length > 100) {
      newErrors.name = '작업명은 최대 100자까지 입력 가능합니다';
    }

    if (!formData.task_class_name.trim()) {
      newErrors.task_class_name = '작업 클래스명을 입력해주세요';
    } else if (!/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(formData.task_class_name)) {
      newErrors.task_class_name = '올바른 Java 클래스명 형식이 아닙니다';
    }

    if (formData.description.length > 500) {
      newErrors.description = '설명은 최대 500자까지 입력 가능합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    if (isEditing && !hasChanges) {
      snackbar.info('변경된 내용이 없습니다');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && task) {
        // 수정 모드
        const updateData: UpdateTaskRequest = {
          name: formData.name,
          description: formData.description,
          task_class_name: formData.task_class_name,
        };

        await schedulerService.updateTask(task.id, updateData);
        snackbar.success('작업 클래스가 수정되었습니다');

        // 최신 데이터 조회
        const updatedTask = await schedulerService.getTask(task.id);
        onSave(updatedTask);
      } else {
        // 생성 모드
        const createData: CreateTaskRequest = {
          name: formData.name,
          description: formData.description,
          task_class_name: formData.task_class_name,
          creator_id: user?.profile?.sub || 'system',
        };

        const createdTask = await schedulerService.createTask(createData);
        snackbar.success('작업 클래스가 등록되었습니다');
        onSave(createdTask);
      }

      setFormData({ name: '', description: '', task_class_name: '' });
    } catch (error: any) {
      console.error('Failed to save task:', error);
      snackbar.error(error.message || '작업 클래스 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', task_class_name: '' });
    setHasChanges(false);
    setErrors({});
    onCancel();
  };

  const isSaveButtonDisabled = isEditing && !hasChanges;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { minHeight: 400 } }}
    >
      <DialogTitle>{isEditing ? '작업 클래스 수정' : '작업 클래스 등록'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="작업명"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="예: 일일 데이터 정리 작업"
            required
            fullWidth
          />

          <TextField
            label="작업 클래스명"
            value={formData.task_class_name}
            onChange={(e) => handleFieldChange('task_class_name', e.target.value)}
            error={!!errors.task_class_name}
            helperText={
              errors.task_class_name ||
              '실행할 Java 클래스의 전체 경로 (예: com.example.tasks.DataCleanupTask)'
            }
            placeholder="com.example.tasks.MyTask"
            required
            fullWidth
            sx={{ fontFamily: 'monospace' }}
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || `${formData.description.length}/500`}
            placeholder="작업에 대한 설명을 입력해주세요"
            multiline
            rows={4}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaveButtonDisabled || loading}
        >
          {isEditing ? '수정' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
