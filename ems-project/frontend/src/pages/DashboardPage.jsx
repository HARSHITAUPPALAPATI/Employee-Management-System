import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { employeesApi } from '../api/employees'
import { departmentsApi, designationsApi, usersApi } from '../api/index'
import './Auth.css'

const DashboardPage = () => {
  const { user, isManager } = useAuth()
  const [stats, setStats] = useState({ employees: 0, departments: 0, designations: 0, users: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          departmentsApi.getAll(),
          designationsApi.getAll(),
        ])
        const newStats = {
          departments: deptRes.data.data?.length || 0,
          designations: desigRes.data.data?.length || 0,
          employees: 0,
          users: 0,
        }
        if (isManager()) {
          const [empRes, userRes] = await Promise.all([
            employeesApi.getAll(),
            usersApi.getAll(),
          ])
          newStats.employees = empRes.data.data?.length || 0
          newStats.users = userRes.data.data?.length || 0
        }
        setStats(newStats)
      } catch {
        // silently fail
      }
    }
    fetchStats()
  }, [isManager])

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span style={{ color: '#888', fontSize: '0.9rem' }}>Welcome back, <strong>{user?.username}</strong></span>
      </div>

      <div className="stats-grid">
        {isManager() && (
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.employees}</h3>
              <p>Total Employees</p>
            </div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.departments}</h3>
            <p>Departments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h3>{stats.designations}</h3>
            <p>Designations</p>
          </div>
        </div>
        {isManager() && (
          <div className="stat-card">
            <div className="stat-icon">🔑</div>
            <div className="stat-info">
              <h3>{stats.users}</h3>
              <p>System Users</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#1a1a2e' }}>Your Roles</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {user?.roles?.map((role) => (
            <span key={role} className="badge badge-info">
              {role.replace('ROLE_', '')}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
