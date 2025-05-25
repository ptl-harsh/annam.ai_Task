import React, { createContext, useContext, useState } from 'react';
import type { ToastProps, ToastActionElement } from '@/components/ui/toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export type ToastType = Omit<ToastProps, 'children'> & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const ToastContext = createContext<{
  toast: (props: Omit<ToastType, 'id'>) => void;
  dismiss: (toastId: string) => void;
}>({
  toast: () => {},
  dismiss: () => {},
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (props: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...props }]);
  };

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss: dismissToast }}>
      <ToastProvider>
        {children}
        {toasts.map(({ id, title, description, action, ...props }) => (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose onClick={() => dismissToast(id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};