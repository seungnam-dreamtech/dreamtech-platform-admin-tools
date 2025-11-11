import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { THEME } from './constants';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppContent from './AppContent';
import { muiTheme } from './theme/muiTheme';
import { SnackbarProvider } from './contexts/SnackbarContext';

// Main App component with routing and global providers
// 라우팅과 전역 프로바이더가 있는 메인 App 컴포넌트
const App: React.FC = () => {

  return (
    <ErrorBoundary>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <SnackbarProvider>
          <ConfigProvider
            locale={koKR}
            theme={{
              token: {
                colorPrimary: THEME.PRIMARY_COLOR,
              },
            }}
          >
            <AntdApp>
              <AuthProvider>
                <Router>
                  <AppContent />
                </Router>
              </AuthProvider>
            </AntdApp>
          </ConfigProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
