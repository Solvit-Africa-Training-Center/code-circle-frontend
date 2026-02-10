import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type RequireAuthProps = {
  children: ReactNode;
  allowRoles?: string[];
};

export default function RequireAuth({ children, allowRoles }: RequireAuthProps) {
  const location = useLocation();
  const authUser = (() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.role) return null;
      return parsed;
    } catch {
      return null;
    }
  })();

  const isAuthed = (() => {
    if (!authUser) return false;
    if (!allowRoles || allowRoles.length === 0) return true;
    return allowRoles.includes(authUser.role);
  })();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    authUser?.role === 'leader' &&
    authUser?.mustChange &&
    location.pathname !== '/leader/change-password'
  ) {
    return <Navigate to="/leader/change-password" replace />;
  }

  return <>{children}</>;
}
