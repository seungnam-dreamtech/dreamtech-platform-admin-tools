import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import type {
  Task,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleType,
} from '../../types/scheduler';
import { schedulerService } from '../../services/schedulerService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface ScheduleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (schedule: Schedule) => void;
  schedule?: Schedule;
  tasks: Task[];
}

interface FormData {
  task_id: string;
  name: string;
  description: string;
  schedule_group: string;
  schedule_type: ScheduleType;
  schedule: string;
  retry_count: number;
  start_at: string;
  end_at: string;
  timezone: string;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  open,
  onCancel,
  onSave,
  schedule,
  tasks,
}) => {
  const [formData, setFormData] = useState<FormData>({
    task_id: '',
    name: '',
    description: '',
    schedule_group: '',
    schedule_type: 'CRON',
    schedule: '',
    retry_count: 0,
    start_at: '',
    end_at: '',
    timezone: 'Asia/Seoul',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const snackbar = useSnackbar();

  const isEditing = !!schedule;

  useEffect(() => {
    if (open) {
      setHasChanges(false);
      setErrors({});

      if (schedule) {
        // 수정 모드: 기존 데이터 로드
        setFormData({
          task_id: schedule.task_id,
          name: schedule.name,
          description: schedule.description || '',
          schedule_group: schedule.schedule_group || '',
          schedule_type: schedule.schedule_type,
          schedule: schedule.schedule || '',
          retry_count: schedule.retry_count || 0,
          start_at: dayjs(schedule.start_at).format('YYYY-MM-DDTHH:mm'),
          end_at: dayjs(schedule.end_at).format('YYYY-MM-DDTHH:mm'),
          timezone: schedule.timezone || 'Asia/Seoul',
        });
      } else {
        // 생성 모드: 폼 초기화
        const now = dayjs();
        setFormData({
          task_id: '',
          name: '',
          description: '',
          schedule_group: '',
          schedule_type: 'CRON',
          schedule: '',
          retry_count: 0,
          start_at: now.format('YYYY-MM-DDTHH:mm'),
          end_at: now.add(1, 'month').format('YYYY-MM-DDTHH:mm'),
          timezone: 'Asia/Seoul',
        });
      }
    }
  }, [open, schedule]);

  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setHasChanges(true);
  };

  const handleScheduleTypeChange = (value: ScheduleType) => {
    setFormData((prev) => ({ ...prev, schedule_type: value, schedule: '' }));
    setHasChanges(true);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.task_id) {
      newErrors.task_id = '작업 클래스를 선택해주세요';
    }

    if (!formData.name.trim()) {
      newErrors.name = '스케쥴명을 입력해주세요';
    } else if (formData.name.length > 100) {
      newErrors.name = '스케쥴명은 최대 100자까지 입력 가능합니다';
    }

    if (!formData.schedule_type) {
      newErrors.schedule_type = '스케쥴 타입을 선택해주세요';
    }

    if (!formData.start_at) {
      newErrors.start_at = '시작일시를 선택해주세요';
    }

    if (!formData.end_at) {
      newErrors.end_at = '종료일시를 선택해주세요';
    }

    if (formData.start_at && formData.end_at) {
      if (dayjs(formData.end_at).isBefore(dayjs(formData.start_at))) {
        newErrors.end_at = '종료일시는 시작일시보다 이후여야 합니다';
      }
    }

    if (formData.retry_count < 0 || formData.retry_count > 10) {
      newErrors.retry_count = '재시도 횟수는 0~10 사이여야 합니다';
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
      if (isEditing && schedule) {
        // 수정 모드
        const updateData: UpdateScheduleRequest = {
          name: formData.name,
          description: formData.description,
          schedule_type: formData.schedule_type,
          schedule: formData.schedule,
          retry_count: formData.retry_count,
          start_at: dayjs(formData.start_at).toISOString(),
          end_at: dayjs(formData.end_at).toISOString(),
          timezone: formData.timezone,
        };

        await schedulerService.updateSchedule(schedule.id, updateData);
        snackbar.success('스케쥴이 수정되었습니다');

        // 최신 데이터 조회
        const updatedSchedule = await schedulerService.getSchedule(schedule.id);
        onSave(updatedSchedule);
      } else {
        // 생성 모드
        const createData: CreateScheduleRequest = {
          task_id: formData.task_id,
          name: formData.name,
          description: formData.description,
          schedule_group: formData.schedule_group,
          schedule_type: formData.schedule_type,
          schedule: formData.schedule,
          retry_count: formData.retry_count,
          start_at: dayjs(formData.start_at).toISOString(),
          end_at: dayjs(formData.end_at).toISOString(),
          timezone: formData.timezone,
        };

        const createdSchedule = await schedulerService.createSchedule(createData);
        snackbar.success('스케쥴이 등록되었습니다');
        onSave(createdSchedule);
      }
    } catch (error: any) {
      console.error('Failed to save schedule:', error);
      snackbar.error(error.message || '스케쥴 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setHasChanges(false);
    setErrors({});
    onCancel();
  };

  const isSaveButtonDisabled = isEditing && !hasChanges;

  const cronExamples = [
    { label: '매분 실행', value: '0 * * * * ?' },
    { label: '매시간 실행', value: '0 0 * * * ?' },
    { label: '매일 자정 실행', value: '0 0 0 * * ?' },
    { label: '평일 오전 9시', value: '0 0 9 ? * MON-FRI' },
  ];

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? '스케쥴 수정' : '스케쥴 등록'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <FormControl fullWidth required error={!!errors.task_id} disabled={isEditing}>
            <InputLabel>작업 클래스</InputLabel>
            <Select
              value={formData.task_id}
              label="작업 클래스"
              onChange={(e) => handleFieldChange('task_id', e.target.value)}
            >
              {tasks
                .filter((task) => !task.deleted_at)
                .map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.name} ({task.task_class_name})
                  </MenuItem>
                ))}
            </Select>
            {errors.task_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.task_id}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="스케쥴명"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="예: 일일 데이터 정리 스케쥴"
            required
            fullWidth
          />

          <TextField
            label="스케쥴 그룹"
            value={formData.schedule_group}
            onChange={(e) => handleFieldChange('schedule_group', e.target.value)}
            placeholder="스케쥴을 그룹화할 수 있습니다 (선택사항)"
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>스케쥴 타입</InputLabel>
            <Select
              value={formData.schedule_type}
              label="스케쥴 타입"
              onChange={(e) => handleScheduleTypeChange(e.target.value as ScheduleType)}
            >
              <MenuItem value="CRON">CRON (주기적 실행)</MenuItem>
              <MenuItem value="EVENT">EVENT (이벤트 기반)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={formData.schedule_type === 'CRON' ? 'Cron 표현식' : 'Event ID'}
            value={formData.schedule}
            onChange={(e) => handleFieldChange('schedule', e.target.value)}
            placeholder={
              formData.schedule_type === 'CRON'
                ? '예: 0 0 2 * * ? (매일 새벽 2시)'
                : 'Event ID를 입력하세요'
            }
            helperText={
              formData.schedule_type === 'CRON'
                ? 'Cron 표현식 형식: 초 분 시 일 월 요일'
                : undefined
            }
            fullWidth
            sx={{ fontFamily: 'monospace' }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="시작일시"
              type="datetime-local"
              value={formData.start_at}
              onChange={(e) => handleFieldChange('start_at', e.target.value)}
              error={!!errors.start_at}
              helperText={errors.start_at}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="종료일시"
              type="datetime-local"
              value={formData.end_at}
              onChange={(e) => handleFieldChange('end_at', e.target.value)}
              error={!!errors.end_at}
              helperText={errors.end_at}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControl fullWidth required>
            <InputLabel>타임존</InputLabel>
            <Select
              value={formData.timezone}
              label="타임존"
              onChange={(e) => handleFieldChange('timezone', e.target.value)}
            >
              <MenuItem value="Asia/Seoul">Asia/Seoul (한국 표준시)</MenuItem>
              <MenuItem value="UTC">UTC (협정 세계시)</MenuItem>
              <MenuItem value="America/New_York">
                America/New_York (동부 표준시)
              </MenuItem>
              <MenuItem value="Europe/London">Europe/London (그리니치 표준시)</MenuItem>
              <MenuItem value="Asia/Tokyo">Asia/Tokyo (일본 표준시)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="재시도 횟수"
            type="number"
            value={formData.retry_count}
            onChange={(e) => handleFieldChange('retry_count', Number(e.target.value))}
            error={!!errors.retry_count}
            helperText={errors.retry_count || '작업 실패 시 자동으로 재시도할 횟수'}
            inputProps={{ min: 0, max: 10 }}
            fullWidth
          />

          <TextField
            label="설명"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="스케쥴에 대한 설명을 입력해주세요"
            multiline
            rows={3}
            fullWidth
            helperText={`${formData.description.length}/500`}
          />

          {formData.schedule_type === 'CRON' && (
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                Cron 표현식 가이드
              </Typography>
              <Typography variant="body2" component="div">
                <strong>* * * * * *</strong> (초 분 시 일 월 요일)
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                {cronExamples.map((ex) => (
                  <li key={ex.value}>
                    <Typography variant="body2">
                      {ex.label}: <code>{ex.value}</code>
                    </Typography>
                  </li>
                ))}
              </Box>
            </Alert>
          )}
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
