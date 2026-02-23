import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { rolesApi } from '../api/index'
import './Auth.css'

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [roleName, setRoleName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchRoles = async () => {
    try {
      const res = await rolesApi.getAll()
      setRoles(res.data.data || [])
    } catch {
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoles() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await rolesApi.create(roleName)
      toast.success('Role created')
      setShowModal(false)
      setRoleName('')
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this role?')) return
    try {
      await rolesApi.delete(id)
      toast.success('Role deleted')
      fetchRoles()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Role Management</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Role</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          {roles.length === 0 ? (
            <div className="empty-state">No roles found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Role Name</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td><span className="badge badge-info">{r.name}</span></td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <button onClick={() => handleDelete(r.id)} className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Role</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Role Name (e.g. ROLE_SUPERVISOR)</label>
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="ROLE_NAME"
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleManagementPage
