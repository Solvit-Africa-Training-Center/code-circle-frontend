type AuthUser = {
  email?: string;
  role?: string;
  fullName?: string;
  mustChange?: boolean;
};

export const getAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('authUser');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const getLeaderDisplayName = () => {
  const user = getAuthUser();
  if (!user) return 'Leader';
  if (user.fullName) return user.fullName;
  if (user.email) return user.email;
  return 'Leader';
};
