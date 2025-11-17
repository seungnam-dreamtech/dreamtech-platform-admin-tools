// 알림 전송 페이지

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import {
  Send as SendIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { notificationService } from '../../services/notificationService';
import type {
  PushNotificationRequest,
  EmailSendRequest,
  PlatformType,
} from '../../types/notification';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SendNotification() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const snackbar = useSnackbar();

  // 푸시 알림 상태
  const [pushUserId, setPushUserId] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);
  const [additionalData, setAdditionalData] = useState<Array<{ key: string; value: string }>>([]);

  // 이메일 상태
  const [emailUserId, setEmailUserId] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateData, setTemplateData] = useState<Array<{ key: string; value: string }>>([]);

  // 푸시 알림 전송
  const handleSendPush = async () => {
    if (!pushUserId.trim()) {
      snackbar.warning('사용자 ID를 입력해주세요');
      return;
    }
    if (!pushTitle.trim()) {
      snackbar.warning('제목을 입력해주세요');
      return;
    }
    if (!pushMessage.trim()) {
      snackbar.warning('메시지를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const additionalDataObj: Record<string, string> = {};
      additionalData.forEach((item) => {
        if (item.key && item.value) {
          additionalDataObj[item.key] = item.value;
        }
      });

      const request: PushNotificationRequest = {
        title: pushTitle,
        message: pushMessage,
        notification_type: 'MOBILE_PUSH',
        ...(selectedPlatforms.length > 0 && { target_platforms: selectedPlatforms }),
        ...(Object.keys(additionalDataObj).length > 0 && { additional_data: additionalDataObj }),
      };

      const response = await notificationService.sendPushNotification(pushUserId, request);
      snackbar.success(
        `푸시 알림이 전송되었습니다 (${response.total_targets}개 대상)`
      );

      // 폼 초기화
      setPushTitle('');
      setPushMessage('');
      setSelectedPlatforms([]);
      setAdditionalData([]);
    } catch (error) {
      snackbar.error('푸시 알림 전송에 실패했습니다');
      console.error('Failed to send push notification:', error);
    } finally {
      setLoading(false);
    }
  };

  // 이메일 전송
  const handleSendEmail = async () => {
    if (!emailUserId.trim()) {
      snackbar.warning('사용자 ID를 입력해주세요');
      return;
    }
    if (!emailSubject.trim()) {
      snackbar.warning('제목을 입력해주세요');
      return;
    }
    if (!emailContent.trim()) {
      snackbar.warning('내용을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const templateDataObj: Record<string, string> = {};
      templateData.forEach((item) => {
        if (item.key && item.value) {
          templateDataObj[item.key] = item.value;
        }
      });

      const request: EmailSendRequest = {
        subject: emailSubject,
        content: emailContent,
        ...(templateName && { template_name: templateName }),
        ...(Object.keys(templateDataObj).length > 0 && { template_data: templateDataObj }),
      };

      await notificationService.sendEmail(emailUserId, request);
      snackbar.success('이메일이 전송되었습니다');

      // 폼 초기화
      setEmailSubject('');
      setEmailContent('');
      setTemplateName('');
      setTemplateData([]);
    } catch (error) {
      snackbar.error('이메일 전송에 실패했습니다');
      console.error('Failed to send email:', error);
    } finally {
      setLoading(false);
    }
  };

  // 플랫폼 토글
  const handlePlatformToggle = (platform: PlatformType) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  // 추가 데이터 관리
  const addAdditionalDataField = () => {
    setAdditionalData([...additionalData, { key: '', value: '' }]);
  };

  const removeAdditionalDataField = (index: number) => {
    setAdditionalData(additionalData.filter((_, i) => i !== index));
  };

  const updateAdditionalData = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...additionalData];
    updated[index][field] = value;
    setAdditionalData(updated);
  };

  // 템플릿 데이터 관리
  const addTemplateDataField = () => {
    setTemplateData([...templateData, { key: '', value: '' }]);
  };

  const removeTemplateDataField = (index: number) => {
    setTemplateData(templateData.filter((_, i) => i !== index));
  };

  const updateTemplateData = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...templateData];
    updated[index][field] = value;
    setTemplateData(updated);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActiveIcon />
          알림 전송
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          사용자에게 푸시 알림 또는 이메일을 전송합니다
        </Typography>
      </Box>

      {/* 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="푸시 알림" />
          <Tab label="이메일" />
        </Tabs>
      </Box>

      {/* 푸시 알림 탭 */}
      <TabPanel value={currentTab} index={0}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="사용자 ID"
              placeholder="알림을 받을 사용자 ID"
              value={pushUserId}
              onChange={(e) => setPushUserId(e.target.value)}
              size="small"
              required
              slotProps={{
                input: {
                  endAdornment: pushUserId && (
                    <IconButton size="small" onClick={() => setPushUserId('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                },
              }}
            />

            <TextField
              label="제목"
              placeholder="알림 제목"
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
              size="small"
              required
            />

            <TextField
              label="메시지"
              placeholder="알림 메시지 내용"
              value={pushMessage}
              onChange={(e) => setPushMessage(e.target.value)}
              multiline
              rows={4}
              required
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                대상 플랫폼 (미선택 시 모든 플랫폼)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPlatforms.includes('ANDROID')}
                      onChange={() => handlePlatformToggle('ANDROID')}
                    />
                  }
                  label="Android"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPlatforms.includes('IOS')}
                      onChange={() => handlePlatformToggle('IOS')}
                    />
                  }
                  label="iOS"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPlatforms.includes('WEB')}
                      onChange={() => handlePlatformToggle('WEB')}
                    />
                  }
                  label="Web"
                />
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">추가 데이터 (선택)</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addAdditionalDataField}>
                  추가
                </Button>
              </Box>
              {additionalData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    placeholder="키"
                    value={item.key}
                    onChange={(e) => updateAdditionalData(index, 'key', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    placeholder="값"
                    value={item.value}
                    onChange={(e) => updateAdditionalData(index, 'value', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <IconButton size="small" color="error" onClick={() => removeAdditionalDataField(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSendPush}
                disabled={loading}
              >
                푸시 알림 전송
              </Button>
            </Box>
          </Stack>
        </Paper>
      </TabPanel>

      {/* 이메일 탭 */}
      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="사용자 ID"
              placeholder="이메일을 받을 사용자 ID"
              value={emailUserId}
              onChange={(e) => setEmailUserId(e.target.value)}
              size="small"
              required
              slotProps={{
                input: {
                  endAdornment: emailUserId && (
                    <IconButton size="small" onClick={() => setEmailUserId('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                },
              }}
            />

            <TextField
              label="제목"
              placeholder="이메일 제목"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              size="small"
              required
            />

            <TextField
              label="내용"
              placeholder="이메일 내용"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              multiline
              rows={6}
              required
            />

            <TextField
              label="템플릿 이름 (선택)"
              placeholder="사용할 템플릿 이름"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              size="small"
            />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">템플릿 데이터 (선택)</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addTemplateDataField}>
                  추가
                </Button>
              </Box>
              {templateData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    placeholder="키"
                    value={item.key}
                    onChange={(e) => updateTemplateData(index, 'key', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    placeholder="값"
                    value={item.value}
                    onChange={(e) => updateTemplateData(index, 'value', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <IconButton size="small" color="error" onClick={() => removeTemplateDataField(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSendEmail}
                disabled={loading}
              >
                이메일 전송
              </Button>
            </Box>
          </Stack>
        </Paper>
      </TabPanel>
    </Box>
  );
}
