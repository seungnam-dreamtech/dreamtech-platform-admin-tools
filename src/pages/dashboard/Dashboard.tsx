import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Api as ApiIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

// Dashboard page component showing system overview
// 시스템 개요를 보여주는 대시보드 페이지 컴포넌트
const Dashboard: React.FC = () => {
  // Mock data - will be replaced with actual API calls
  // 목 데이터 - 실제 API 호출로 교체될 예정
  const systemStats = {
    totalUsers: 1247,
    activeServices: 8,
    scheduledJobs: 15,
    notifications: 342,
  };

  const serviceStatus = [
    { name: '인증 서비스', status: 'healthy', uptime: 99.9 },
    { name: 'API 게이트웨이', status: 'healthy', uptime: 99.8 },
    { name: '스케줄링 서비스', status: 'healthy', uptime: 99.7 },
    { name: '알림 서비스', status: 'degraded', uptime: 98.5 },
    { name: 'FastAPI 서비스 #1', status: 'healthy', uptime: 99.6 },
    { name: 'FastAPI 서비스 #2', status: 'healthy', uptime: 99.4 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4caf50';
      case 'degraded':
        return '#ff9800';
      default:
        return '#f44336';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return '정상';
      case 'degraded':
        return '저하됨';
      default:
        return '비정상';
    }
  };

  // Statistic Card Component
  const StatisticCard = ({
    title,
    value,
    icon,
    color,
    showTrend = false,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    showTrend?: boolean;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h4" component="div" sx={{ color, fontWeight: 600 }}>
                {value.toLocaleString()}
              </Typography>
              {showTrend && (
                <TrendingUpIcon sx={{ ml: 1, color: '#4caf50', fontSize: 20 }} />
              )}
            </Box>
          </Box>
          <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        대시보드
      </Typography>

      {/* System Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatisticCard
          title="총 사용자"
          value={systemStats.totalUsers}
          icon={<PersonIcon sx={{ fontSize: 40 }} />}
          color="#3f8600"
          showTrend
        />
        <StatisticCard
          title="활성 서비스"
          value={systemStats.activeServices}
          icon={<ApiIcon sx={{ fontSize: 40 }} />}
          color="#1976d2"
        />
        <StatisticCard
          title="예약된 작업"
          value={systemStats.scheduledJobs}
          icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
          color="#7b1fa2"
        />
        <StatisticCard
          title="총 알림"
          value={systemStats.notifications}
          icon={<NotificationsIcon sx={{ fontSize: 40 }} />}
          color="#c2185b"
          showTrend
        />
      </Box>

      {/* Service Status & System Performance */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              서비스 상태
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>서비스명</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>가동 시간</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceStatus.map((service) => (
                    <TableRow key={service.name} hover>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: getStatusColor(service.status), fontWeight: 500 }}
                        >
                          {getStatusText(service.status)}
                        </Typography>
                      </TableCell>
                      <TableCell>{service.uptime}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              시스템 성능
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                CPU 사용률
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(25, 118, 210, 0.12)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: '#1976d2',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ ml: 2, minWidth: 40, fontWeight: 500 }}>
                  65%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                메모리 사용률
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={78}
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(25, 118, 210, 0.12)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: '#1976d2',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ ml: 2, minWidth: 40, fontWeight: 500 }}>
                  78%
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                디스크 사용률
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={45}
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(76, 175, 80, 0.12)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: '#4caf50',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ ml: 2, minWidth: 40, fontWeight: 500 }}>
                  45%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
