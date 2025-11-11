// 역할 관리 페이지 (Global Roles + Service Roles 통합)

import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { Public as PublicIcon, Api as ApiIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import GlobalRolesTab from '../../components/settings/GlobalRolesTab';
import ServiceRolesTab from '../../components/settings/ServiceRolesTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RoleManagement() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  // URL 경로에 따라 초기 탭 설정 (기본값: global)
  useEffect(() => {
    // /access/roles 경로에서는 기본적으로 글로벌 역할 탭을 표시
    // 사용자가 탭을 변경하지 않는 한 글로벌 역할이 기본값
    if (location.pathname.includes('/access/roles') || location.pathname.includes('/settings/roles')) {
      // 별도 처리 없이 기본값 0 (global) 유지
    }
  }, [location.pathname]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          역할 관리 (Role Management)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          플랫폼의 글로벌 역할과 서비스별 역할을 관리합니다
        </Typography>
      </Box>

      {/* Tabs for Global and Service Roles */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="role management tabs">
          <Tab
            icon={<PublicIcon />}
            iconPosition="start"
            label="글로벌 역할"
            id="role-tab-0"
            aria-controls="role-tabpanel-0"
          />
          <Tab
            icon={<ApiIcon />}
            iconPosition="start"
            label="서비스 역할"
            id="role-tab-1"
            aria-controls="role-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <GlobalRolesTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ServiceRolesTab />
      </TabPanel>
    </Box>
  );
}
