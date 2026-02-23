import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { announcementsApi } from '../api/employees'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const AnnouncementsPage = () => {
  const { isAdmin } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', message: '' })
  const [saving, setSaving] = useState(false)

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementsApi.getAll()
      setAnnouncements(res.data.data || [])
    } catch {
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnnouncements() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await announcementsApi.create(form)
      toast.success('Announcement posted')
      setShowModal(false)
      setForm({ title: '', message: '' })
      fetchAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this announcement?')) return
    try {
      await announcementsApi.delete(id)
      toast.success('Announcement removed')
      fetchAnnouncements()
    } catch {
      toast.error('Failed to remove')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>📢 Announcements</h1>
        {isAdmin() && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">+ New Announcement</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.length === 0 ? (
          <div className="card"><div className="empty-state">No announcements yet.</div></div>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: '4px solid #e94560', position: 'relative' }}>
              {isAdmin() && (
                <button
                  onClick={() => handleDelete(a.id)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '1.2rem' }}
                  title="Remove announcement"
                >×</button>
              )}
              <h3 style={{ margin: '0 0 0.5rem', color: '#1a1a2e', fontSize: '1rem', fontWeight: 700, paddingRight: '2rem' }}>{a.title}</h3>
              <p style={{ margin: '0 0 0.75rem', color: '#444', fontSize: '0.9rem', lineHeight: '1.5' }}>{a.message}</p>
              <small style={{ color: '#999' }}>
                Posted by <strong>{a.createdBy}</strong> · {new Date(a.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>New Announcement</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Office closed on Friday"
                  required
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  rows={5}
                  placeholder="Write your announcement here..."
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnouncementsPage
