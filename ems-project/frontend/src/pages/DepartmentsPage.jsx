import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { departmentsApi } from '../api/index'
import { employeesApi } from '../api/employees'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const DepartmentsPage = () => {
  const { isManager, isAdmin } = useAuth()
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', managerId: '' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    try {
      const deptRes = await departmentsApi.getAll()
      setDepartments(deptRes.data.data || [])
      if (isManager()) {
        const empRes = await employeesApi.getAll()
        setEmployees(empRes.data.data || [])
      }
    } catch {
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setForm({ name: '', description: '', managerId: '' })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || '', managerId: dept.managerId || '' })
    setEditingId(dept.id)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, managerId: form.managerId ? parseInt(form.managerId) : null }
      if (editingId) {
        await departmentsApi.update(editingId, payload)
        toast.success('Department updated')
      } else {
        await departmentsApi.create(payload)
        toast.success('Department created')
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return
    try {
      await departmentsApi.delete(id)
      toast.success('Department deleted')
      fetchAll()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Departments</h1>
        {isManager() && <button onClick={openCreate} className="btn btn-primary">+ Add Department</button>}
      </div>
      <div className="card">
        <div className="table-wrapper">
          {departments.length === 0 ? (
            <div className="empty-state">No departments found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Manager</th>
                  <th>Status</th>
                  {isManager() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>{dept.name}</td>
                    <td>{dept.description || '-'}</td>
                    <td>{dept.managerName || '-'}</td>
                    <td>
                      <span className={`badge ${dept.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isManager() && (
                      <td>
                        <div className="actions">
                          <button onClick={() => openEdit(dept)} className="btn btn-secondary btn-sm">Edit</button>
                          {isAdmin() && <button onClick={() => handleDelete(dept.id)} className="btn btn-danger btn-sm">Delete</button>}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Department' : 'Add Department'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>
              {employees.length > 0 && (
                <div className="form-group">
                  <label>Manager</label>
                  <select value={form.managerId} onChange={(e) => setForm({...form, managerId: e.target.value})}>
                    <option value="">None</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentsPage
