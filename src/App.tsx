import './App.css'
import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth'
import ToastContainer from './components/ui/ToastContainer'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const ClubsPage = lazy(() => import('./pages/ClubsPage'))
const ClubDetailPage = lazy(() => import('./pages/ClubDetailPage'))
const ClubTestPage = lazy(() => import('./pages/ClubTestPage'))
const ClubQuizPage = lazy(() => import('./pages/ClubQuizPage'))
const ClubResultsPage = lazy(() => import('./pages/ClubResultsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const LeaderDashboardPage = lazy(() => import('./pages/LeaderDashboardPage'))
const LeaderMembersPage = lazy(() => import('./pages/LeaderMembersPage'))
const LeaderProjectsPage = lazy(() => import('./pages/LeaderProjectsPage'))
const LeaderCoursesPage = lazy(() => import('./pages/LeaderCoursesPage'))
const LeaderAssignmentsPage = lazy(() => import('./pages/LeaderAssignmentsPage'))
const LeaderClubPage = lazy(() => import('./pages/LeaderClubPage'))
const LeaderCreateClubPage = lazy(() => import('./pages/LeaderCreateClubPage'))
const LeaderClubDetailPage = lazy(() => import('./pages/LeaderClubDetailPage'))
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'))
const StudentClubPage = lazy(() => import('./pages/StudentClubPage'))
const StudentCollaborationPage = lazy(() => import('./pages/StudentCollaborationPage'))
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage'))
const StudentCoursesPage = lazy(() => import('./pages/StudentCoursesPage'))
const StudentCourseDetailPage = lazy(() => import('./pages/StudentCourseDetailPage'))
const LeaderApplyCategoryPage = lazy(() => import('./pages/LeaderApplyCategoryPage'))
const LeaderApplyFormPage = lazy(() => import('./pages/LeaderApplyFormPage'))
const LeaderApplyProtocolPage = lazy(() => import('./pages/LeaderApplyProtocolPage'))
const LeaderApplyTestPage = lazy(() => import('./pages/LeaderApplyTestPage'))
const LeaderApplyResultPage = lazy(() => import('./pages/LeaderApplyResultPage'))
const LeaderChangePasswordPage = lazy(() => import('./pages/LeaderChangePasswordPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminClubsPage = lazy(() => import('./pages/AdminClubsPage'))
const AdminApplicationsPage = lazy(() => import('./pages/AdminApplicationsPage'))


function App() {

  return (
    <>
      <ToastContainer />
      <Suspense fallback={<div className="min-h-screen w-full bg-slate-950" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:id" element={<ClubDetailPage />} />
          <Route path="/clubs/:id/test" element={<ClubTestPage />} />
          <Route path="/clubs/:id/test/quiz" element={<ClubQuizPage />} />
          <Route path="/clubs/:id/test/results" element={<ClubResultsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/leader/apply" element={<LeaderApplyCategoryPage />} />
          <Route path="/leader/apply/form" element={<LeaderApplyFormPage />} />
          <Route path="/leader/apply/protocol" element={<LeaderApplyProtocolPage />} />
          <Route path="/leader/apply/test" element={<LeaderApplyTestPage />} />
          <Route path="/leader/apply/result" element={<LeaderApplyResultPage />} />
          <Route
            path="/leader/change-password"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderChangePasswordPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth allowRoles={['admin']}>
                <AdminDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <RequireAuth allowRoles={['admin']}>
                <AdminReportsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth allowRoles={['admin']}>
                <AdminUsersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/clubs"
            element={
              <RequireAuth allowRoles={['admin']}>
                <AdminClubsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <RequireAuth allowRoles={['admin']}>
                <AdminApplicationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/dashboard"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/members"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderMembersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/projects"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderProjectsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/courses"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderCoursesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/assignments"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderAssignmentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/clubs/new"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderCreateClubPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/club"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderClubPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leader/club/:id"
            element={
              <RequireAuth allowRoles={['leader']}>
                <LeaderClubDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <RequireAuth allowRoles={['student']}>
                <StudentDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/clubs"
            element={
              <RequireAuth allowRoles={['student']}>
                <StudentClubPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/clubs/:id/collaboration"
            element={
              <RequireAuth allowRoles={['student']}>
                <StudentCollaborationPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/profile"
            element={
              <RequireAuth allowRoles={['student']}>
                <StudentProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/courses"
            element={
              <RequireAuth allowRoles={['student']}>
                <StudentCoursesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/courses/:id"
            element={
              <RequireAuth allowRoles={['student']}>
                <StudentCourseDetailPage />
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
