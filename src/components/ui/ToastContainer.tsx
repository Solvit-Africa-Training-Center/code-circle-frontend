import { useEffect, useState } from 'react';
import type { ToastType } from '@/utils/toast';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

const typeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-blue-600'
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: ToastType }>;
      const toast: ToastItem = {
        id: Date.now(),
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'success'
      };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3000);
    };

    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg px-4 py-3 text-sm text-white shadow-lg ${typeStyles[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
