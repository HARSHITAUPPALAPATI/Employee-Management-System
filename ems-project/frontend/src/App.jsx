import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import DepartmentsPage from './pages/DepartmentsPage'
import DesignationsPage from './pages/DesignationsPage'
import ProfilePage from './pages/ProfilePage'
import RoleManagementPage from './pages/RoleManagementPage'
import UsersPage from './pages/UsersPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import TasksPage from './pages/TasksPage'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="employees" element={
              <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                <EmployeesPage />
              </ProtectedRoute>
            } />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="designations" element={<DesignationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="users" element={
              <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="roles" element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <RoleManagementPage />
              </ProtectedRoute>
            } />
            <Route path="audit-logs" element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AuditLogsPage />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
