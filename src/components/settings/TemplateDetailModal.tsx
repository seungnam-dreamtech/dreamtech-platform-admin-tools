// Permission Template 상세 모달
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import type { PermissionTemplate } from '../../types/user-management';

interface TemplateDetailModalProps {
  open: boolean;
  onClose: () => void;
  template: PermissionTemplate | null;
}

export default function TemplateDetailModal({
  open,
  onClose,
  template,
}: TemplateDetailModalProps) {
  if (!template) {
    return null;
  }

  const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ py: 1.5 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">
            {template.name}
          </Typography>
          <Chip label={template.is_active ? '활성' : '비활성'} color={template.is_active ? 'success' : 'default'} size="small" />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <InfoRow label="ID">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {template.id}
            </Typography>
          </InfoRow>

          <Divider />

          <InfoRow label="템플릿 이름">
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {template.name}
            </Typography>
          </InfoRow>

          {template.category && (
            <>
              <Divider />
              <InfoRow label="카테고리">
                <Chip label={template.category} color="primary" size="small" />
              </InfoRow>
            </>
          )}

          {template.description && (
            <>
              <Divider />
              <InfoRow label="설명">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {template.description}
                </Typography>
              </InfoRow>
            </>
          )}

          <Divider />

          <InfoRow label="글로벌 역할">
            {template.global_roles.length === 0 ? (
              <Box
                sx={{
                  py: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontSize: '14px',
                }}
              >
                글로벌 역할 없음
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {template.global_roles.map((role) => (
                  <Paper
                    key={role.role_id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={role.role_id} size="small" color="secondary" />
                      <Typography variant="body2">{role.display_name}</Typography>
                    </Box>
                    {role.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {role.description}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </InfoRow>

          <Divider />

          <InfoRow label="서비스 역할">
            {template.service_roles.length === 0 ? (
              <Box
                sx={{
                  py: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontSize: '14px',
                }}
              >
                서비스 역할 없음
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {template.service_roles.map((role) => (
                  <Paper
                    key={`${role.service_id}:${role.role_name}`}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={role.service_id} size="small" color="info" />
                      <Chip label={role.role_name} size="small" color="primary" />
                    </Box>
                    {role.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {role.description}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </InfoRow>

          <Divider />

          <InfoRow label="생성 정보">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                생성자: {template.created_by}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                생성일: {new Date(template.created_at).toLocaleString('ko-KR')}
              </Typography>
            </Box>
          </InfoRow>

          {template.updated_at && (
            <>
              <Divider />
              <InfoRow label="수정 정보">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    수정자: {template.updated_by}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    수정일: {new Date(template.updated_at).toLocaleString('ko-KR')}
                  </Typography>
                </Box>
              </InfoRow>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
