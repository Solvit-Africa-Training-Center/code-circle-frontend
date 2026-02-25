import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  return (nested ?? data) as T;
};

export type UserMembership = {
  membershipId: string;
  role: string;
  status: 'active' | 'pending' | 'rejected';
  joinedAt: string;
  updatedAt: string;
  clubId?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export type UserListRole = {
  name?: string;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  globalStatus?: string;
  createdAt?: string;
  userRoles?: Array<{
    role?: UserListRole;
  }>;
};

type GetUsersParams = {
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
};

type ActivateUserPayload = {
  userId: string;
  isActive: boolean;
};

type GetUsersResponse = {
  data?: UserListItem[];
};

const unwrapUsersList = (response: unknown): UserListItem[] => {
  const unwrapped = unwrapData<unknown>(response);
  if (Array.isArray(unwrapped)) return unwrapped as UserListItem[];
  const maybeWrapped = unwrapped as GetUsersResponse | undefined;
  if (Array.isArray(maybeWrapped?.data)) return maybeWrapped.data;
  return [];
};

const unwrapUser = (response: unknown): UserProfile | null => {
  const fromData = unwrapData<UserProfile | undefined>(response);
  if (fromData && typeof fromData.id === 'string') return fromData;

  const raw = response as Partial<UserProfile>;
  if (raw && typeof raw.id === 'string') {
    return {
      id: raw.id,
      name: String(raw.name ?? ''),
      email: String(raw.email ?? ''),
    };
  }
  return null;
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<UserListItem[], GetUsersParams>({
      query: (params) => {
        const safeParams: GetUsersParams = params ?? {};
        const page = safeParams.page ?? 1;
        const limit = safeParams.limit ?? 1000;
        const order = safeParams.order ?? 'DESC';
        return `/users?page=${page}&limit=${limit}&order=${order}`;
      },
      transformResponse: (response: unknown) => unwrapUsersList(response),
    }),
    getUserMemberships: builder.query<UserMembership[], string>({
      query: (userId) => `/users/${userId}/memberships`,
      transformResponse: (response: unknown) =>
        unwrapData<UserMembership[]>(response) ?? [],
    }),
    getUsersByIds: builder.query<Record<string, UserProfile>, string[]>({
      async queryFn(userIds, _queryApi, _extraOptions, fetchWithBQ) {
        const ids = Array.from(new Set(userIds.filter(Boolean)));
        if (!ids.length) return { data: {} };

        const responses = await Promise.all(ids.map((id) => fetchWithBQ(`/users/${id}`)));
        const result: Record<string, UserProfile> = {};

        ids.forEach((id, index) => {
          const response = responses[index];
          if (response.error || !response.data) return;
          const parsed = unwrapUser(response.data);
          if (parsed) result[id] = parsed;
        });

        return { data: result };
      },
    }),
    activateUser: builder.mutation<
      { success?: boolean; message?: string },
      ActivateUserPayload
    >({
      query: (body) => ({
        url: '/users/activate-user',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserMembershipsQuery,
  useGetUsersByIdsQuery,
  useActivateUserMutation,
} = usersApi;
