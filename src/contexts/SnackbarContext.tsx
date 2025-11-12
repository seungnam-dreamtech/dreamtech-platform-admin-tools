/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

// Ant Design message API를 대체하는 Snackbar 컨텍스트

interface SnackbarMessage {
  message: string;
  severity: AlertColor;
  key: number;
}

interface SnackbarContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackPack, setSnackPack] = useState<readonly SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined);

  React.useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // 새 snackbar 표시
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // 현재 snackbar가 열려있으면 닫기
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  const showMessage = useCallback((message: string, severity: AlertColor) => {
    setSnackPack((prev) => [...prev, { message, severity, key: new Date().getTime() }]);
  }, []);

  const contextValue: SnackbarContextType = {
    success: (message: string) => showMessage(message, 'success'),
    error: (message: string) => showMessage(message, 'error'),
    warning: (message: string) => showMessage(message, 'warning'),
    info: (message: string) => showMessage(message, 'info'),
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={messageInfo?.severity} sx={{ width: '100%' }}>
          {messageInfo?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
