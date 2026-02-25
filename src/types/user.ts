export type AppRole = 'ADMIN' | 'CLUB_LEADER' | 'MEMBER';

export type AuthUser = {
  id?: string;
  email: string;
  role: AppRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponseEnvelope = {
  statusCode: number;
  success: boolean;
  message: string;
  data: LoginTokens;
  timestamp: string;
  path: string;
};
