import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

export type AssignmentType = 'individual' | 'group';
export type AssignmentStatus = 'draft' | 'published' | 'closed';
export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'graded' | 'returned';

export type Assignment = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  type: AssignmentType;
  status: AssignmentStatus;
  maxPoints: number;
  dueDate?: string;
  courseId: string;
  moduleId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAssignmentPayload = {
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  type: AssignmentType;
  dueDate?: string;
  moduleId?: string;
};

export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload>;

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  userId: string;
  teamId?: string;
  content?: string;
  attachments?: string[];
  repositoryUrl?: string;
  status: SubmissionStatus;
  score?: number | null;
  feedback?: string | null;
  attemptNumber: number;
  isLate: boolean;
  submittedAt?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAssignmentSubmissionPayload = {
  assignmentId: string;
  content: string;
  attachments?: string[];
  repositoryUrl?: string;
  teamId?: string;
};

const unwrapList = (response: unknown): Assignment[] => {
  if (Array.isArray(response)) return response as Assignment[];
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as Assignment[];
  const nested = (data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as Assignment[];
  return [];
};

const unwrapAssignment = (response: unknown): Assignment => {
  const assignment = (response as { assignment?: Assignment })?.assignment;
  if (assignment) return assignment;
  return response as Assignment;
};

const unwrapSubmission = (response: unknown): AssignmentSubmission => {
  const data = response as { data?: unknown; submission?: AssignmentSubmission };
  if (data.submission) return data.submission;
  if (data.data) return data.data as AssignmentSubmission;
  return response as AssignmentSubmission;
};

const unwrapSubmissionList = (response: unknown): AssignmentSubmission[] => {
  if (Array.isArray(response)) return response as AssignmentSubmission[];
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as AssignmentSubmission[];
  const nested = (data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as AssignmentSubmission[];
  return [];
};

export const assignmentsApi = createApi({
  reducerPath: 'assignmentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Assignments'],
  endpoints: (builder) => ({
    getAssignmentsByCourse: builder.query<Assignment[], string>({
      query: (courseId) => `/assignments/course/${courseId}`,
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: (_result, _error, courseId) => [
        { type: 'Assignments', id: courseId },
      ],
    }),
    getAssignmentsByCourseIds: builder.query<Assignment[], string[]>({
      async queryFn(courseIds, _queryApi, _extraOptions, fetchWithBQ) {
        if (!courseIds.length) return { data: [] };

        const responses = await Promise.all(
          courseIds.map((courseId) => fetchWithBQ(`/assignments/course/${courseId}`)),
        );
        const merged = responses.flatMap((result) => {
          if (result.error || !result.data) return [];
          const payload = result.data as unknown;
          return unwrapList(payload);
        });

        return { data: merged };
      },
      providesTags: (_result, _error, courseIds) => [
        ...courseIds.map((courseId) => ({ type: 'Assignments' as const, id: courseId })),
        { type: 'Assignments', id: 'course-ids' },
      ],
    }),
    createAssignment: builder.mutation<Assignment, CreateAssignmentPayload>({
      query: (body) => ({
        url: '/assignments',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapAssignment(response),
      invalidatesTags: (_result, _error, body) => [
        { type: 'Assignments', id: body.courseId },
      ],
    }),
    updateAssignment: builder.mutation<
      Assignment,
      { assignmentId: string; courseId: string; body: UpdateAssignmentPayload }
    >({
      query: ({ assignmentId, body }) => ({
        url: `/assignments/${assignmentId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) => unwrapAssignment(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Assignments', id: args.courseId },
      ],
    }),
    publishAssignment: builder.mutation<
      Assignment,
      { assignmentId: string; courseId: string }
    >({
      query: ({ assignmentId }) => ({
        url: `/assignments/${assignmentId}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => unwrapAssignment(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Assignments', id: args.courseId },
      ],
    }),
    deleteAssignment: builder.mutation<
      { message?: string },
      { assignmentId: string; courseId: string }
    >({
      query: ({ assignmentId }) => ({
        url: `/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Assignments', id: args.courseId },
      ],
    }),
    getAssignmentSubmissions: builder.query<AssignmentSubmission[], string>({
      query: (assignmentId) => `/assignments/${assignmentId}/submissions`,
      transformResponse: (response: unknown) => unwrapSubmissionList(response),
      providesTags: (_result, _error, assignmentId) => [
        { type: 'Assignments', id: `submissions:${assignmentId}` },
      ],
    }),
    createAssignmentSubmission: builder.mutation<
      AssignmentSubmission,
      CreateAssignmentSubmissionPayload
    >({
      query: ({ assignmentId, ...body }) => ({
        url: `/assignments/${assignmentId}/submissions`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapSubmission(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Assignments', id: args.assignmentId },
        { type: 'Assignments', id: `submissions:${args.assignmentId}` },
      ],
    }),
    submitAssignmentSubmission: builder.mutation<
      AssignmentSubmission,
      { submissionId: string; assignmentId: string }
    >({
      query: ({ submissionId }) => ({
        url: `/assignments/submissions/${submissionId}/submit`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => unwrapSubmission(response),
      invalidatesTags: (_result, _error, args) => [
        { type: 'Assignments', id: args.assignmentId },
        { type: 'Assignments', id: `submissions:${args.assignmentId}` },
      ],
    }),
  }),
});

export const {
  useGetAssignmentsByCourseQuery,
  useGetAssignmentsByCourseIdsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  usePublishAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useCreateAssignmentSubmissionMutation,
  useSubmitAssignmentSubmissionMutation,
} = assignmentsApi;
