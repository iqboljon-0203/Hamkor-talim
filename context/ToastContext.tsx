import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';
import { COLORS, FONTS } from '@/constants/Theme';
import { StyleSheet } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');

  const showToast = (msg: string, toastType: ToastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
  };

  const onDismiss = () => setVisible(false);

  // Determine background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success[600];
      case 'error':
        return COLORS.error[600];
      case 'info':
      default:
        return COLORS.primary[600];
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
        action={{
          label: 'OK',
          onPress: onDismiss,
          labelStyle: styles.actionLabel,
        }}
      >
        <React.Fragment>{message}</React.Fragment>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 40,
    borderRadius: 8,
  },
  actionLabel: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
});
