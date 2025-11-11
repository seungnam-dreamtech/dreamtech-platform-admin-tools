// 글로벌 역할 상세 조회 Modal

import { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Typography,
  Stack,
  Card,
  CardContent,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  AccountTree as AccountTreeIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  HelpOutline as HelpOutlineIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import type { TreeViewBaseItem } from '@mui/x-tree-view/models';
import type { GlobalRole } from '../../types/user-management';
import { RoleHierarchyGraph } from './RoleHierarchyGraph';

interface GlobalRoleDetailDrawerProps {
  open: boolean;
  role: GlobalRole | null;
  allRoles: GlobalRole[];
  onClose: () => void;
}

export function GlobalRoleDetailDrawer({
  open,
  role,
  allRoles,
  onClose,
}: GlobalRoleDetailDrawerProps) {
  // 모달이 열릴 때 데이터 확인
  if (open && role) {
    console.log('📋 상세 모달 열림:', {
      role_id: role.role_id,
      parent_role_id: role.parent_role_id,
      parent_role: role.parent_role,
      allRoles_count: allRoles.length,
    });
  }

  // 역할 계층 구조 생성 (부모 → 자식)
  const roleHierarchy = useMemo(() => {
    if (!role) return [];

    const hierarchy: GlobalRole[] = [];
    let currentRole: GlobalRole | undefined = role;

    // 현재 역할부터 최상위 부모까지 역순으로 추적
    while (currentRole) {
      hierarchy.unshift(currentRole);

      if (currentRole.parent_role?.role_id) {
        currentRole = allRoles.find((r) => r.role_id === currentRole!.parent_role!.role_id);
      } else {
        break;
      }
    }

    return hierarchy;
  }, [role, allRoles]);

  // 모든 상속된 권한 수집 (중복 제거)
  const allInheritedPermissions = useMemo(() => {
    const permissionsMap = new Map<string, { permission: string; from: string }>();

    roleHierarchy.forEach((r) => {
      r.permissions.forEach((perm) => {
        if (!permissionsMap.has(perm)) {
          permissionsMap.set(perm, { permission: perm, from: r.role_id });
        }
      });
    });

    return Array.from(permissionsMap.values());
  }, [roleHierarchy]);

  // 권한을 리소스별로 그룹화
  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, { permission: string; from: string }[]>();

    allInheritedPermissions.forEach((item) => {
      const [resource] = item.permission.split(':');
      if (!groups.has(resource)) {
        groups.set(resource, []);
      }
      groups.get(resource)!.push(item);
    });

    return groups;
  }, [allInheritedPermissions]);

  // Tree 데이터 생성
  const treeItems: TreeViewBaseItem[] = useMemo(() => {
    return Array.from(groupedPermissions.entries()).map(([resource, perms]) => ({
      id: resource,
      label: `${resource} (${perms.length})`,
      children: perms.map((item, idx) => ({
        id: `${resource}-${idx}`,
        label: `${item.permission}${item.from !== role?.role_id ? ` [from ${item.from}]` : ''}`,
      })),
    }));
  }, [groupedPermissions, role]);

  // JWT 토큰 페이로드 시뮬레이션 (실제 표준 형식)
  const jwtPayloadPreview = useMemo(() => {
    if (!role) return null;

    const now = Math.floor(Date.now() / 1000);

    return {
      sub: 'user@example.com',
      roles: [role.role_id],
      iss: 'https://api.cardiacinsight.com',
      uuid: '01987921-53c4-7c42-9486-f0903807d05b',
      aud: 'platform-management-client',
      user_type: 'PLATFORM_ADMIN',
      service_scopes: ['ecg-assist-lite', 'notification', 'medical-data', 'schedule', 'auth'],
      permissions: allInheritedPermissions.map((p) => p.permission),
      azp: 'platform-management-client',
      scope: 'openid profile email',
      svc_act: 63,
      exp: now + 21600, // 6시간 후
      iat: now,
      svc_reg: 63,
      jti: '0199eb6c-ad75-7b61-af1c-c7043505f0a9',
    };
  }, [role, allInheritedPermissions]);

  if (!role) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccountTreeIcon />
            <Typography variant="h6">역할 상세 정보: {role.role_id}</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* 상단: 역할 정보 */}
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <InfoIcon fontSize="small" />
                <Typography variant="subtitle2">역할 정보</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Role ID
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {role.role_id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        표시명
                      </Typography>
                      <Typography variant="body2">{role.display_name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        권한 레벨
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label={`Level ${role.authority_level}`}
                          size="small"
                          color={
                            role.authority_level <= 10
                              ? 'error'
                              : role.authority_level <= 50
                              ? 'warning'
                              : 'success'
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          (낮을수록 높은 권한)
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        생성일시
                      </Typography>
                      <Typography variant="body2" fontSize="11px">
                        {new Date(role.created_at).toLocaleString('ko-KR')}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        타입
                      </Typography>
                      <Box>
                        {role.is_system_role ? (
                          <Chip label="SYSTEM" size="small" color="error" />
                        ) : (
                          <Chip label="사용자 정의" size="small" color="success" />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        상태
                      </Typography>
                      <Box>
                        {role.is_active ? (
                          <Chip label="활성" size="small" color="success" />
                        ) : (
                          <Chip label="비활성" size="small" color="default" />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        생성자
                      </Typography>
                      <Typography variant="body2" fontSize="11px">
                        {role.created_by || '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        수정자
                      </Typography>
                      <Typography variant="body2" fontSize="11px">
                        {role.updated_by || '-'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      설명
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="11px">
                      {role.description || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 하단: 역할 계층 그래프 & 권한/JWT 정보 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Card variant="outlined" sx={{ height: 496 }}>
                <CardContent sx={{ height: '100%', p: 0, '&:last-child': { pb: 0 } }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
                  >
                    <AccountTreeIcon fontSize="small" />
                    <Typography variant="subtitle2">역할 계층 구조</Typography>
                    {roleHierarchy.length > 1 && (
                      <Tooltip title="하위 역할은 상위 역할의 모든 권한을 자동으로 상속받습니다. 드래그, 줌, 팬 가능">
                        <HelpOutlineIcon fontSize="small" color="primary" />
                      </Tooltip>
                    )}
                  </Stack>
                  <Box sx={{ height: 'calc(100% - 41px)' }}>
                    <RoleHierarchyGraph allRoles={allRoles} currentRoleId={role.role_id} />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Stack spacing={2}>
                <Card variant="outlined" sx={{ height: 240 }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <SecurityIcon fontSize="small" />
                      <Typography variant="subtitle2">권한 목록</Typography>
                      <Chip
                        label={`총 ${allInheritedPermissions.length}개`}
                        size="small"
                        color="secondary"
                      />
                      {roleHierarchy.length > 1 && (
                        <Tooltip
                          title={`직접 권한 ${role.permissions.length}개 + 상속 권한 ${
                            allInheritedPermissions.length - role.permissions.length
                          }개`}
                        >
                          <HelpOutlineIcon fontSize="small" color="success" />
                        </Tooltip>
                      )}
                    </Stack>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      {treeItems.length > 0 ? (
                        <RichTreeView
                          items={treeItems}
                          defaultExpandedItems={treeItems.map((item) => item.id)}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          권한이 없습니다
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ height: 240 }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <CodeIcon fontSize="small" />
                      <Typography variant="subtitle2">JWT 페이로드 미리보기</Typography>
                      <Tooltip title="사용자에게 이 역할이 할당되면 JWT 토큰에 다음과 같은 형태로 포함됩니다">
                        <HelpOutlineIcon fontSize="small" color="warning" />
                      </Tooltip>
                    </Stack>
                    <Box
                      sx={{
                        flex: 1,
                        overflow: 'auto',
                        bgcolor: 'grey.100',
                        p: 1.5,
                        borderRadius: 1,
                      }}
                    >
                      <pre
                        style={{
                          fontSize: '11px',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {JSON.stringify(jwtPayloadPreview, null, 2)}
                      </pre>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
