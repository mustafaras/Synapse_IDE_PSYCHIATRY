import React, { useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiXCircle } from 'react-icons/fi';
import { type Toast as ToastType, useToastStore } from '../../hooks/useToast';
import styles from './Toast.module.css';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.id, toast.duration, removeToast]);

  const icons = {
    success: <FiCheckCircle size={18} />,
    error: <FiXCircle size={18} />,
    warning: <FiAlertCircle size={18} />,
    info: <FiInfo size={18} />,
  };

  const handleClose = () => {
    removeToast(toast.id);
  };

  return (
    <div className={styles.toast} data-type={toast.type} role="alert" aria-live="polite">
      <div className={styles.iconWrapper}>
        {icons[toast.type]}
      </div>
      <div className={styles.message}>{toast.message}</div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};
