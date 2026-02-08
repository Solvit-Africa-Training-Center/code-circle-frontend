type NotificationItem = {
  id: number;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = 'leaderNotifications';

export function addNotification(message: string) {
  const item: NotificationItem = {
    id: Date.now(),
    message,
    createdAt: new Date().toISOString()
  };
  const existing = getNotifications();
  const next = [item, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('leader-notifications'));
}

export function getNotifications(): NotificationItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearNotifications() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('leader-notifications'));
}
