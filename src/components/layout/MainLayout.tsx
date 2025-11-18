import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Monitor as MonitorIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Api as ApiIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { ROUTES } from '../../constants';

const DRAWER_WIDTH = 240;

interface MenuItemType {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItemType[];
}

// Main layout component for the admin interface
// 관리자 인터페이스를 위한 메인 레이아웃 컴포넌트
const MainLayout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const snackbar = useSnackbar();

  const menuItems: MenuItemType[] = [
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardIcon />,
      label: '대시보드',
    },
    {
      key: 'gateway',
      icon: <ApiIcon />,
      label: '게이트웨이',
      children: [
        {
          key: ROUTES.SERVICES,
          icon: null,
          label: '라우팅 설정',
        },
      ],
    },
    {
      key: 'user-management',
      icon: <GroupIcon />,
      label: '사용자 관리',
      children: [
        {
          key: '/system/user-types',
          icon: null,
          label: '사용자 유형',
        },
        {
          key: ROUTES.USERS,
          icon: null,
          label: '플랫폼 사용자',
        },
        {
          key: '/users/oauth-clients',
          icon: null,
          label: 'OAuth 클라이언트',
        },
      ],
    },
    {
      key: 'service-management',
      icon: <ApiIcon />,
      label: '서비스 관리',
      children: [
        {
          key: '/system/services',
          icon: null,
          label: '서비스 스코프',
        },
      ],
    },
    {
      key: 'access-control',
      icon: <SecurityIcon />,
      label: '권한 관리',
      children: [
        {
          key: '/access/roles',
          icon: null,
          label: '역할 관리',
        },
        {
          key: '/access/permissions',
          icon: null,
          label: '권한 정의',
        },
        {
          key: '/access/templates',
          icon: null,
          label: '권한 템플릿',
        },
        {
          key: '/system/codes',
          icon: null,
          label: '공통 코드',
        },
      ],
    },
    {
      key: 'scheduler',
      icon: <ScheduleIcon />,
      label: '스케줄러',
      children: [
        {
          key: '/scheduler/tasks',
          icon: null,
          label: '작업 클래스',
        },
        {
          key: '/scheduler/schedules',
          icon: null,
          label: '스케쥴 관리',
        },
      ],
    },
    {
      key: 'notifications',
      icon: <NotificationsIcon />,
      label: '알림 서비스',
      children: [
        {
          key: '/notifications/send',
          icon: null,
          label: '알림 전송',
        },
        {
          key: '/notifications/push-tokens',
          icon: null,
          label: '푸시 토큰 관리',
        },
        {
          key: '/notifications/emails',
          icon: null,
          label: '이메일 관리',
        },
        {
          key: '/notifications/history',
          icon: null,
          label: '알림 이력',
        },
      ],
    },
    {
      key: 'monitoring',
      icon: <MonitorIcon />,
      label: '모니터링',
      children: [
        {
          key: '/audit/logs',
          icon: null,
          label: '감사 로그',
        },
      ],
    },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (key: string, hasChildren: boolean) => {
    if (hasChildren) {
      // 하위 메뉴 토글
      setExpandedMenus((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    } else {
      // 페이지 이동
      navigate(key);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      snackbar.success('로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout error:', error);
      snackbar.error('로그아웃 중 오류가 발생했습니다.');
    }
    handleUserMenuClose();
  };

  const renderMenuItem = (item: MenuItemType, level: number = 0) => {
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isExpanded = expandedMenus.includes(item.key);
    const isSelected = location.pathname === item.key;

    return (
      <React.Fragment key={item.key}>
        <ListItemButton
          selected={isSelected}
          onClick={() => handleMenuClick(item.key, hasChildren)}
          sx={{
            pl: level * 2 + 2,
            bgcolor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.12)',
            },
          }}
        >
          {item.icon && <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>}
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: level === 0 ? '0.95rem' : '0.875rem',
              fontWeight: isSelected ? 600 : 400,
            }}
          />
          {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            DreamTech Admin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleUserMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {user?.profile?.name || user?.profile?.preferred_username || '사용자'}
            </Typography>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose}>
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>프로필</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>설정</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>로그아웃</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1e1e1e',
            color: 'white',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: 'white' }}>
            DreamTech
          </Typography>
        </Toolbar>
        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
        <List sx={{ pt: 1 }}>{menuItems.map((item) => renderMenuItem(item))}</List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: drawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          transition: (theme) =>
            theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
