import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { clearNotifications, getNotifications } from '@/utils/notifications';

export default function LeaderNotificationsBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCount(getNotifications().length);
    };
    updateCount();
    window.addEventListener('leader-notifications', updateCount);
    return () => window.removeEventListener('leader-notifications', updateCount);
  }, []);

  return (
    <button
      className="relative rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
      onClick={() => {
        clearNotifications();
      }}
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
