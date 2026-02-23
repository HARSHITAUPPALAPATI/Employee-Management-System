import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ems_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('ems_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    const data = response.data.data
    localStorage.setItem('ems_access_token', data.accessToken)
    localStorage.setItem('ems_refresh_token', data.refreshToken)
    const userData = {
      username: data.username,
      email: data.email,
      roles: data.roles,
    }
    localStorage.setItem('ems_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('ems_access_token')
      localStorage.removeItem('ems_refresh_token')
      localStorage.removeItem('ems_user')
      setUser(null)
    }
  }, [])

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) ?? false
  }, [user])

  const isAdmin = useCallback(() => hasRole('ROLE_ADMIN'), [hasRole])
  const isManager = useCallback(() => hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER'), [hasRole])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
