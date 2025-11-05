import React from 'react';
import { Row, Col, Card, Statistic, Progress, Typography, Table } from 'antd';
import {
  ArrowUpOutlined,
  UserOutlined,
  ApiOutlined,
  ScheduleOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

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

  const columns = [
    {
      title: '서비스명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{
          color: status === 'healthy' ? '#52c41a' :
                status === 'degraded' ? '#faad14' : '#f5222d'
        }}>
          {status === 'healthy' ? '정상' :
           status === 'degraded' ? '저하됨' : '비정상'}
        </span>
      ),
    },
    {
      title: '가동 시간',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (uptime: number) => `${uptime}%`,
    },
  ];

  return (
    <div>
      <Title level={2}>대시보드</Title>

      {/* System Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="총 사용자"
              value={systemStats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="활성 서비스"
              value={systemStats.activeServices}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="예약된 작업"
              value={systemStats.scheduledJobs}
              prefix={<ScheduleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="총 알림"
              value={systemStats.notifications}
              prefix={<NotificationOutlined />}
              valueStyle={{ color: '#eb2f96' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Service Status Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="서비스 상태">
            <Table
              dataSource={serviceStatus}
              columns={columns}
              rowKey="name"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* System Performance */}
        <Col xs={24} lg={8}>
          <Card title="시스템 성능">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>CPU 사용률</div>
              <Progress percent={65} status="active" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>메모리 사용률</div>
              <Progress percent={78} status="active" />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>디스크 사용률</div>
              <Progress percent={45} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;