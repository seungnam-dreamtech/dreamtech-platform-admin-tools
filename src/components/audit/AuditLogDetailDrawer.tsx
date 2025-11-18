// 감사 로그 상세 정보 Drawer

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { AuditEvent, SecurityLevel, EventStatus } from '../../types/user-management';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AuditLogDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  event: AuditEvent | null;
}

// 보안 레벨 색상
const getSecurityLevelColor = (level: SecurityLevel) => {
  switch (level) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'NORMAL':
      return 'info';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
};

// 이벤트 상태 색상
const getEventStatusColor = (status: EventStatus) => {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'FAILURE':
      return 'error';
    case 'PARTIAL':
      return 'warning';
    case 'PENDING':
      return 'info';
    case 'CANCELLED':
      return 'default';
    default:
      return 'default';
  }
};

// 정보 블록 컴포넌트
interface InfoBlockProps {
  title: string;
  children: React.ReactNode;
}

const InfoBlock = ({ title, children }: InfoBlockProps) => (
  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
    <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={600}>
      {title}
    </Typography>
    {children}
  </Paper>
);

// 필드 표시 컴포넌트
interface FieldProps {
  label: string;
  value: React.ReactNode;
}

const Field = ({ label, value }: FieldProps) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" color="textSecondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.5 }}>
      {value || '-'}
    </Typography>
  </Box>
);

// JSON 데이터 표시 컴포넌트
interface JsonDisplayProps {
  data: string | object | null | undefined;
}

const JsonDisplay = ({ data }: JsonDisplayProps) => {
  if (!data) return <Typography variant="body2">-</Typography>;

  let jsonObject;
  if (typeof data === 'string') {
    try {
      jsonObject = JSON.parse(data);
    } catch {
      return <Typography variant="body2">{data}</Typography>;
    }
  } else {
    jsonObject = data;
  }

  return (
    <Box
      component="pre"
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.100',
        p: 1.5,
        borderRadius: 1,
        overflow: 'auto',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        maxHeight: 300,
      }}
    >
      {JSON.stringify(jsonObject, null, 2)}
    </Box>
  );
};

export default function AuditLogDetailDrawer({ open, onClose, event }: AuditLogDetailDrawerProps) {
  if (!event) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 700 } },
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            감사 로그 상세
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Event ID: {event.event_id}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 내용 */}
      <Box sx={{ p: 3, overflow: 'auto' }}>
        {/* 기본 정보 */}
        <InfoBlock title="이벤트 기본 정보">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Field label="이벤트 타입" value={event.event_type} />
            <Field label="이벤트 카테고리" value={event.event_category} />
            <Field
              label="발생 시각"
              value={format(new Date(event.event_timestamp), 'PPP p', { locale: ko })}
            />
            <Field
              label="보안 레벨"
              value={
                <Chip
                  label={event.security_level}
                  color={getSecurityLevelColor(event.security_level)}
                  size="small"
                />
              }
            />
            <Field
              label="상태"
              value={
                <Chip
                  label={event.status}
                  color={getEventStatusColor(event.status)}
                  size="small"
                />
              }
            />
            <Field label="액션" value={event.action} />
          </Box>
        </InfoBlock>

        {/* 행위자 정보 */}
        <InfoBlock title="행위자 (Actor)">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Field label="타입" value={event.actor_type} />
            <Field label="ID" value={event.actor_id} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Field label="사용자명" value={event.actor_username} />
          </Box>
        </InfoBlock>

        {/* 대상 정보 */}
        <InfoBlock title="대상 (Target)">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Field label="타입" value={event.target_type} />
            <Field label="ID" value={event.target_id} />
          </Box>
        </InfoBlock>

        {/* 설명 */}
        <InfoBlock title="설명">
          <Typography variant="body2">{event.description}</Typography>
        </InfoBlock>

        {/* 네트워크 정보 */}
        <InfoBlock title="네트워크 정보">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Field label="IP 주소" value={event.ip_address} />
            <Field label="User Agent" value={event.user_agent} />
          </Box>
        </InfoBlock>

        {/* 변경 추적 */}
        {(event.before_state || event.after_state || event.changes_summary) && (
          <InfoBlock title="변경 추적">
            {event.changes_summary && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  변경 요약
                </Typography>
                <Typography variant="body2">{event.changes_summary}</Typography>
              </Box>
            )}

            {event.before_state && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  이전 상태
                </Typography>
                <JsonDisplay data={event.before_state} />
              </Box>
            )}

            {event.after_state && (
              <Box>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  이후 상태
                </Typography>
                <JsonDisplay data={event.after_state} />
              </Box>
            )}
          </InfoBlock>
        )}

        {/* 보안 플래그 */}
        <InfoBlock title="보안 분류">
          <Stack direction="row" spacing={1}>
            {event.is_security_event && (
              <Chip label="보안 이벤트" color="error" size="small" />
            )}
            {event.is_compliance_event && (
              <Chip label="컴플라이언스 이벤트" color="warning" size="small" />
            )}
            {!event.is_security_event && !event.is_compliance_event && (
              <Typography variant="body2" color="textSecondary">
                특별한 분류 없음
              </Typography>
            )}
          </Stack>
        </InfoBlock>

        {/* 세션 및 추적 정보 */}
        <InfoBlock title="세션 및 추적">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Field label="세션 ID" value={event.session_id} />
            <Field label="요청 ID" value={event.request_id} />
            <Field label="상관관계 ID" value={event.correlation_id} />
            <Field label="추적 ID" value={event.trace_id} />
            <Field label="Span ID" value={event.span_id} />
          </Box>
        </InfoBlock>

        {/* 추가 데이터 */}
        {event.additional_data && (
          <InfoBlock title="추가 데이터">
            <JsonDisplay data={event.additional_data} />
          </InfoBlock>
        )}

        {/* 보관 정보 */}
        <InfoBlock title="보관 정보">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Field label="아카이브 여부" value={event.archived ? '예' : '아니오'} />
            <Field
              label="아카이브 일시"
              value={
                event.archived_at &&
                format(new Date(event.archived_at), 'PPP p', { locale: ko })
              }
            />
            <Field label="아카이브 위치" value={event.archive_location} />
          </Box>
        </InfoBlock>

        {/* 메타데이터 */}
        <InfoBlock title="메타데이터">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Field label="연도" value={`${event.year}년`} />
            <Field label="월" value={`${event.month}월`} />
          </Box>
        </InfoBlock>
      </Box>
    </Drawer>
  );
}
