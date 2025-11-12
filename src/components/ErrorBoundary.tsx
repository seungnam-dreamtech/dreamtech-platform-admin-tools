import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Card, CardContent, Alert, AlertTitle, Button, Typography } from '@mui/material';
import { Refresh as RefreshIcon, Error as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 500, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight={600}>
                500
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>오류 발생</AlertTitle>
                앱을 초기화하는 중 오류가 발생했습니다.
              </Alert>
              {this.state.error && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3, fontFamily: 'monospace' }}>
                  {this.state.error.message}
                </Typography>
              )}
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                size="large"
              >
                새로고침
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
