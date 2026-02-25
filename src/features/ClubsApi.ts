import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Club, CreateClubPayload, UpdateClubPayload } from '@/types/club';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  return (nested ?? data) as T;
};

export type ClubStats = {
  clubId: string;
  membersCount: number;
  projectsCount: number;
};

export type ClubMember = {
  userId: string;
  membershipId: string;
  fullName: string;
  email: string;
  status: 'pending' | 'active' | 'rejected';
  joinedAt: string;
};

export const clubsApi = createApi({
  reducerPath: 'clubsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Clubs'],
  endpoints: (builder) => ({
    getActiveClubs: builder.query<Club[], void>({
      query: () => '/clubs/active',
      transformResponse: (response: unknown) => unwrapData<Club[]>(response),
      providesTags: ['Clubs'],
    }),
    getClubById: builder.query<Club, string>({
      query: (id) => `/clubs/${id}`,
      transformResponse: (response: unknown) => unwrapData<Club>(response),
      providesTags: (_result, _error, id) => [{ type: 'Clubs', id }],
    }),
    getClubStats: builder.query<ClubStats, string>({
      query: (id) => `/clubs/${id}/stats`,
      transformResponse: (response: unknown) => unwrapData<ClubStats>(response),
      providesTags: (_result, _error, id) => [{ type: 'Clubs', id: `${id}-stats` }],
    }),
    getClubMembers: builder.query<ClubMember[], string>({
      query: (id) => `/clubs/${id}/members`,
      transformResponse: (response: unknown) => unwrapData<ClubMember[]>(response),
      providesTags: (_result, _error, id) => [{ type: 'Clubs', id: `${id}-members` }],
    }),
    getCreatorClubs: builder.query<Club[], string>({
      query: (creatorId) => `/clubs/creator/${creatorId}`,
      transformResponse: (response: unknown) => unwrapData<Club[]>(response),
      providesTags: ['Clubs'],
    }),
    createClub: builder.mutation<Club, CreateClubPayload>({
      query: (body) => ({
        url: '/clubs',
        method: 'POST',
        body: {
          name: body.name,
          categoryId: body.categoryId,
          description: body.description,
          imageUrl: body.imageUrl,
        },
      }),
      transformResponse: (response: unknown) => unwrapData<Club>(response),
      invalidatesTags: ['Clubs'],
    }),
    updateClub: builder.mutation<Club, { id: string; body: UpdateClubPayload }>({
      query: ({ id, body }) => ({
        url: `/clubs/${id}`,
        method: 'PATCH',
        body: {
          name: body.name,
          categoryId: body.categoryId,
          description: body.description,
          imageUrl: body.imageUrl,
        },
      }),
      transformResponse: (response: unknown) => unwrapData<Club>(response),
      invalidatesTags: (_result, _error, { id }) => ['Clubs', { type: 'Clubs', id }],
    }),
    deleteClub: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/clubs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clubs'],
    }),
  }),
});

export const {
  useGetActiveClubsQuery,
  useGetClubByIdQuery,
  useGetClubStatsQuery,
  useGetClubMembersQuery,
  useGetCreatorClubsQuery,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
} = clubsApi;
