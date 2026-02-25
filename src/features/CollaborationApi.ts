import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

type RoomUser = {
  id: string;
  name: string;
  email: string;
};

export type CollaborationMessage = {
  id: string;
  content: string;
  createdAt: string;
  user: RoomUser;
};

export type CollaborationTaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type CollaborationTask = {
  id: string;
  title: string;
  status: CollaborationTaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CollaborationCodeSubmission = {
  id: string;
  language: string;
  note?: string | null;
  createdAt: string;
  user: RoomUser;
};

export type CollaborationMember = {
  userId: string;
  role: string;
  joinedAt: string;
  name: string;
  email: string;
};

export type CollaborationRoom = {
  messages: CollaborationMessage[];
  tasks: CollaborationTask[];
  codeSubmissions: CollaborationCodeSubmission[];
  members: CollaborationMember[];
};

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  return (nested ?? data) as T;
};

export const collaborationApi = createApi({
  reducerPath: 'collaborationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['CollaborationRoom'],
  endpoints: (builder) => ({
    getRoomByClub: builder.query<CollaborationRoom, string>({
      query: (clubId) => `/collaboration/clubs/${clubId}/room`,
      transformResponse: (response: unknown) => unwrapData<CollaborationRoom>(response),
      providesTags: (_result, _error, clubId) => [{ type: 'CollaborationRoom', id: clubId }],
    }),
    createMessage: builder.mutation<
      CollaborationMessage,
      { clubId: string; content: string }
    >({
      query: ({ clubId, content }) => ({
        url: `/collaboration/clubs/${clubId}/messages`,
        method: 'POST',
        body: { content },
      }),
      transformResponse: (response: unknown) => unwrapData<CollaborationMessage>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'CollaborationRoom', id: args.clubId },
      ],
    }),
    createTask: builder.mutation<
      CollaborationTask,
      { clubId: string; title: string; dueDate?: string; status?: CollaborationTaskStatus }
    >({
      query: ({ clubId, ...body }) => ({
        url: `/collaboration/clubs/${clubId}/tasks`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<CollaborationTask>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'CollaborationRoom', id: args.clubId },
      ],
    }),
    updateTask: builder.mutation<
      CollaborationTask,
      { clubId: string; taskId: string; status?: CollaborationTaskStatus; title?: string; dueDate?: string }
    >({
      query: ({ clubId: _clubId, taskId, ...body }) => ({
        url: `/collaboration/tasks/${taskId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<CollaborationTask>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'CollaborationRoom', id: args.clubId },
      ],
    }),
    createCodeSubmission: builder.mutation<
      CollaborationCodeSubmission,
      { clubId: string; language: string; code: string; note?: string }
    >({
      query: ({ clubId, ...body }) => ({
        url: `/collaboration/clubs/${clubId}/code-submissions`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<CollaborationCodeSubmission>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'CollaborationRoom', id: args.clubId },
      ],
    }),
  }),
});

export const {
  useGetRoomByClubQuery,
  useCreateMessageMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCreateCodeSubmissionMutation,
} = collaborationApi;
