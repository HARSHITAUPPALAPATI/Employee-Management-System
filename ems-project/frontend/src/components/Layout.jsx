import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { announcementsApi, tasksApi } from '../api/employees'
import './Layout.css'

const Layout = () => {
  const { user, logout, isAdmin, isManager } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [pendingTasks, setPendingTasks] = useState(0)

  useEffect(() => {
    announcementsApi.getAll()
      .then(res => setAnnouncements(res.data.data || []))
      .catch(() => {})

    tasksApi.getMyTasks()
      .then(res => {
        const tasks = res.data.data || []
        setPendingTasks(tasks.filter(t => t.status !== 'COMPLETED').length)
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const badge = (count) => count > 0 ? (
    <span style={{
      marginLeft: 'auto',
      background: '#e94560',
      color: '#fff',
      borderRadius: '10px',
      padding: '1px 7px',
      fontSize: '0.72rem',
      fontWeight: 700
    }}>{count}</span>
  ) : null

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>EMS</h2>
          <p>Employee Management</p>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            📊 Dashboard
          </NavLink>
          {isManager() && (
            <NavLink to="/employees" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              👥 Employees
            </NavLink>
          )}
          <NavLink to="/departments" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            🏢 Departments
          </NavLink>
          <NavLink to="/designations" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            🏷️ Designations
          </NavLink>
          <NavLink to="/tasks" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            ✅ Tasks {badge(pendingTasks)}
          </NavLink>
          <NavLink to="/announcements" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            📢 Announcements {badge(announcements.length)}
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            👤 My Profile
          </NavLink>
          {isManager() && (
            <NavLink to="/users" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              🔑 Users
            </NavLink>
          )}
          {isAdmin() && (
            <NavLink to="/roles" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              🛡️ Role Management
            </NavLink>
          )}
          {isAdmin() && (
            <NavLink to="/audit-logs" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              🔍 Audit Logs
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{user?.roles?.[0]?.replace('ROLE_', '')}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
