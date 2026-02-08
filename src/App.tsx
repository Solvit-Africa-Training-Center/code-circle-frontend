import './App.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ClubsPage from './pages/ClubsPage'
import ClubDetailPage from './pages/ClubDetailPage'
import ClubTestPage from './pages/ClubTestPage'
import ClubQuizPage from './pages/ClubQuizPage'
import ClubResultsPage from './pages/ClubResultsPage'
import LoginPage from './pages/LoginPage'
import LeaderDashboardPage from './pages/LeaderDashboardPage'
import LeaderMembersPage from './pages/LeaderMembersPage'
import LeaderProjectsPage from './pages/LeaderProjectsPage'
import LeaderClubPage from './pages/LeaderClubPage'
import LeaderCreateClubPage from './pages/LeaderCreateClubPage'
import LeaderClubDetailPage from './pages/LeaderClubDetailPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import StudentClubPage from './pages/StudentClubPage'
import StudentCollaborationPage from './pages/StudentCollaborationPage'
import StudentProfilePage from './pages/StudentProfilePage'
import StudentCoursesPage from './pages/StudentCoursesPage'
import StudentCourseDetailPage from './pages/StudentCourseDetailPage'
import RequireAuth from './components/auth/RequireAuth'
import ToastContainer from './components/ui/ToastContainer'


function App() {

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
        <Route path="/clubs/:id/test" element={<ClubTestPage />} />
        <Route path="/clubs/:id/test/quiz" element={<ClubQuizPage />} />
        <Route path="/clubs/:id/test/results" element={<ClubResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
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
    </>
  )
}

export default App
