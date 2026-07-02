import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import CoursesPage from './pages/CoursesPage'
import GradesPage from './pages/GradesPage'
import EnrollmentsPage from './pages/EnrollmentsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'
import AttendancePage from './pages/AttendancePage'
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'
import NotesPage from './pages/NotesPage'
import PomodoroPage from './pages/PomodoroPage'
import AIPage from './pages/AIPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore(s => s.isAuthenticated)
  return auth ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const auth = useAuthStore(s => s.isAuthenticated)

  return (
    <Routes>
      <Route path="/login" element={auth ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="enrollments" element={<EnrollmentsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="pomodoro" element={<PomodoroPage />} />
        <Route path="ai" element={<AIPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
