import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type RequireAuthProps = {
  children: ReactNode;
  allowRoles?: string[];
};

export default function RequireAuth({ children, allowRoles }: RequireAuthProps) {
  const location = useLocation();
  const isAuthed = (() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.role) return false;
      if (!allowRoles || allowRoles.length === 0) return true;
      return allowRoles.includes(parsed.role);
    } catch {
      return false;
    }
  })();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
