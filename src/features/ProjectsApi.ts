import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

export type ProjectType = 'group' | 'individual';
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';
export type TeamStatus = 'forming' | 'active' | 'submitted' | 'graded' | 'disbanded';
export type TeamMemberRole = 'leader' | 'member';

export type Project = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  type: ProjectType;
  status: ProjectStatus;
  maxPoints: number;
  startDate?: string;
  endDate?: string;
  courseId: string;
  moduleId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = {
  courseId: string;
  title: string;
  description: string;
  requirements: string;
  type: ProjectType;
  minTeamSize?: number;
  maxTeamSize?: number;
  startDate?: string;
  endDate?: string;
  moduleId?: string;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export type ProjectTeam = {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: TeamStatus;
  members: Array<{ userId: string; role: TeamMemberRole; joinedAt: string }>;
  submissionContent?: string;
  submissionAttachments?: string[] | null;
  submittedAt?: string;
  score?: number | null;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamPayload = {
  projectId: string;
  name: string;
  description?: string;
};

export type SubmitTeamProjectPayload = {
  teamId: string;
  projectId: string;
  submissionContent: string;
  submissionAttachments?: string[];
  repositoryUrl?: string;
  demoUrl?: string;
};

const unwrapList = (response: unknown): Project[] => {
  if (Array.isArray(response)) return response as Project[];
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as Project[];
  const nested = (data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as Project[];
  return [];
};

const unwrapProject = (response: unknown): Project => {
  const raw = response as Record<string, unknown>;
  if ('message' in raw) {
    const { message: _message, ...rest } = raw;
    return rest as Project;
  }
  return response as Project;
};

const unwrapTeam = (response: unknown): ProjectTeam => {
  const raw = response as Record<string, unknown>;
  if ('message' in raw) {
    const { message: _message, ...rest } = raw;
    return rest as ProjectTeam;
  }
  return response as ProjectTeam;
};

const unwrapTeamList = (response: unknown): ProjectTeam[] => {
  if (Array.isArray(response)) return response as ProjectTeam[];
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as ProjectTeam[];
  return [];
};

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Projects'],
  endpoints: (builder) => ({
    getProjectsByCourse: builder.query<Project[], string>({
      query: (courseId) => `/projects/course/${courseId}`,
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: (_result, _error, courseId) => [
        { type: 'Projects', id: courseId },
      ],
    }),
    getProjectsByCourseIds: builder.query<Project[], string[]>({
      async queryFn(courseIds, _queryApi, _extraOptions, fetchWithBQ) {
        if (!courseIds.length) return { data: [] };

        const responses = await Promise.all(
          courseIds.map((courseId) => fetchWithBQ(`/projects/course/${courseId}`)),
        );
        const merged = responses.flatMap((result) => {
          if (result.error || !result.data) return [];
          const payload = result.data as unknown;
          return unwrapList(payload);
        });

        return { data: merged };
      },
      providesTags: (_result, _error, courseIds) => [
        ...courseIds.map((courseId) => ({ type: 'Projects' as const, id: courseId })),
        { type: 'Projects', id: 'course-ids' },
      ],
    }),
    createProject: builder.mutation<Project, CreateProjectPayload>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapProject(response),
      invalidatesTags: (_result, _error, body) => [
        { type: 'Projects', id: body.courseId },
      ],
    }),
    updateProject: builder.mutation<
      Project,
      { projectId: string; courseId: string; body: UpdateProjectPayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) => unwrapProject(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Projects', id: args.courseId },
      ],
    }),
    publishProject: builder.mutation<
      Project,
      { projectId: string; courseId: string }
    >({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => unwrapProject(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Projects', id: args.courseId },
      ],
    }),
    deleteProject: builder.mutation<
      { message?: string },
      { projectId: string; courseId: string }
    >({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Projects', id: args.courseId },
      ],
    }),
    getProjectTeams: builder.query<ProjectTeam[], string>({
      query: (projectId) => `/projects/${projectId}/teams`,
      transformResponse: (response: unknown) => unwrapTeamList(response),
      providesTags: (_result, _error, projectId) => [
        { type: 'Projects', id: `teams:${projectId}` },
      ],
    }),
    getMyProjectTeams: builder.query<ProjectTeam[], void>({
      query: () => '/projects/teams/user/my-teams',
      transformResponse: (response: unknown) => unwrapTeamList(response),
      providesTags: [{ type: 'Projects', id: 'my-teams' }],
    }),
    createProjectTeam: builder.mutation<ProjectTeam, CreateTeamPayload>({
      query: (body) => ({
        url: '/projects/teams',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapTeam(response),
      invalidatesTags: (_result, _error, body) => [
        { type: 'Projects', id: `teams:${body.projectId}` },
        { type: 'Projects', id: 'my-teams' },
      ],
    }),
    submitProjectTeam: builder.mutation<ProjectTeam, SubmitTeamProjectPayload>({
      query: ({ teamId, submissionContent, submissionAttachments, repositoryUrl, demoUrl }) => ({
        url: `/projects/teams/${teamId}/submit`,
        method: 'POST',
        body: { submissionContent, submissionAttachments, repositoryUrl, demoUrl },
      }),
      transformResponse: (response: unknown) => unwrapTeam(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Projects', id: `teams:${args.projectId}` },
        { type: 'Projects', id: 'my-teams' },
      ],
    }),
  }),
});

export const {
  useGetProjectsByCourseQuery,
  useGetProjectsByCourseIdsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  usePublishProjectMutation,
  useDeleteProjectMutation,
  useGetProjectTeamsQuery,
  useGetMyProjectTeamsQuery,
  useCreateProjectTeamMutation,
  useSubmitProjectTeamMutation,
} = projectsApi;
