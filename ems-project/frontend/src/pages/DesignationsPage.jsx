import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { designationsApi } from '../api/index'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const DesignationsPage = () => {
  const { isManager, isAdmin } = useAuth()
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    try {
      const res = await designationsApi.getAll()
      setDesignations(res.data.data || [])
    } catch {
      toast.error('Failed to load designations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setForm({ title: '' }); setEditingId(null); setShowModal(true) }
  const openEdit = (d) => { setForm({ title: d.title }); setEditingId(d.id); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await designationsApi.update(editingId, form)
        toast.success('Designation updated')
      } else {
        await designationsApi.create(form)
        toast.success('Designation created')
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
    if (!window.confirm('Delete this designation?')) return
    try {
      await designationsApi.delete(id)
      toast.success('Designation deleted')
      fetchAll()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Designations</h1>
        {isManager() && <button onClick={openCreate} className="btn btn-primary">+ Add Designation</button>}
      </div>
      <div className="card">
        <div className="table-wrapper">
          {designations.length === 0 ? (
            <div className="empty-state">No designations found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Created At</th>
                  {isManager() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {designations.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td>{d.title}</td>
                    <td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
                    {isManager() && (
                      <td>
                        <div className="actions">
                          <button onClick={() => openEdit(d)} className="btn btn-secondary btn-sm">Edit</button>
                          {isAdmin() && <button onClick={() => handleDelete(d.id)} className="btn btn-danger btn-sm">Delete</button>}
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
              <h2>{editingId ? 'Edit Designation' : 'Add Designation'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ title: e.target.value })} required />
              </div>
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

export default DesignationsPage
