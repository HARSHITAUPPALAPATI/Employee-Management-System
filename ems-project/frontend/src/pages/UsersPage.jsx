import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { usersApi, rolesApi } from '../api/index'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const UsersPage = () => {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')

  const fetchAll = async () => {
    try {
      const [userRes, roleRes] = await Promise.all([usersApi.getAll(), rolesApi.getAll()])
      setUsers(userRes.data.data || [])
      setRoles(roleRes.data.data || [])
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleLock = async (id, locked) => {
    try {
      if (locked) {
        await usersApi.unlock(id)
        toast.success('User unlocked')
      } else {
        await usersApi.lock(id)
        toast.success('User locked')
      }
      fetchAll()
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await usersApi.delete(id)
      toast.success('User deleted')
      fetchAll()
    } catch {
      toast.error('Delete failed')
    }
  }

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setSelectedRole('')
    setShowRoleModal(true)
  }

  const handleAssignRole = async () => {
    if (!selectedRole) return
    try {
      await usersApi.assignRole(selectedUser.id, { roleName: selectedRole })
      toast.success('Role assigned successfully')
      setShowRoleModal(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign role')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
      </div>
      <div className="card">
        <div className="table-wrapper">
          {users.length === 0 ? (
            <div className="empty-state">No users found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Locked</th>
                  {isAdmin() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {u.roles?.map(r => (
                          <span key={r} className="badge badge-info">{r.replace('ROLE_', '')}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.accountLocked ? 'badge-danger' : 'badge-success'}`}>
                        {u.accountLocked ? 'Locked' : 'Unlocked'}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td>
                        <div className="actions">
                          <button onClick={() => openRoleModal(u)} className="btn btn-secondary btn-sm">Assign Role</button>
                          <button
                            onClick={() => handleLock(u.id, u.accountLocked)}
                            className={`btn btn-sm ${u.accountLocked ? 'btn-warning' : 'btn-danger'}`}
                          >
                            {u.accountLocked ? 'Unlock' : 'Lock'}
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Role to {selectedUser?.username}</h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Select Role</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="">Choose a role</option>
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowRoleModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleAssignRole} className="btn btn-primary" disabled={!selectedRole}>Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage
