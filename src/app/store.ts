import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/features/AuthApi';
import { categoriesApi } from '@/features/CategoriesApi';
import { leaderApplicationApi } from '@/features/LeaderApplicationApi';
import { clubsApi } from '@/features/ClubsApi';
import { coursesApi } from '@/features/CoursesApi';
import { assignmentsApi } from '@/features/AssignmentsApi';
import { projectsApi } from '@/features/ProjectsApi';
import { questionPoolApi } from '@/features/QuestionPoolApi';
import { clubTestsApi } from '@/features/ClubTestsApi';
import { usersApi } from '@/features/UsersApi';
import { collaborationApi } from '@/features/CollaborationApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [leaderApplicationApi.reducerPath]: leaderApplicationApi.reducer,
    [clubsApi.reducerPath]: clubsApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [assignmentsApi.reducerPath]: assignmentsApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [questionPoolApi.reducerPath]: questionPoolApi.reducer,
    [clubTestsApi.reducerPath]: clubTestsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [collaborationApi.reducerPath]: collaborationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoriesApi.middleware,
      leaderApplicationApi.middleware,
      clubsApi.middleware,
      coursesApi.middleware,
      assignmentsApi.middleware,
      projectsApi.middleware,
      questionPoolApi.middleware,
      clubTestsApi.middleware,
      usersApi.middleware,
      collaborationApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
