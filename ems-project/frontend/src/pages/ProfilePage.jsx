import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { employeesApi } from '../api/employees'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' })
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  // Resign state
  const [showResignModal, setShowResignModal] = useState(false)
  const [lastWorkingDay, setLastWorkingDay] = useState('')
  const [resigning, setResigning] = useState(false)

  const fetchProfile = async () => {
    try {
      const res = await employeesApi.getMe()
      const data = res.data.data
      setProfile(data)
      setEditForm({ firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone || '' })
    } catch {
      // User might not have employee profile yet
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await employeesApi.updateMe(editForm)
      toast.success('Profile updated successfully')
      setEditMode(false)
      fetchProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setChangingPass(true)
    try {
      await authApi.changePassword(passForm)
      toast.success('Password changed successfully')
      setPassForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed')
    } finally {
      setChangingPass(false)
    }
  }

  const handleResign = async (e) => {
    e.preventDefault()
    setResigning(true)
    try {
      await employeesApi.resign({ lastWorkingDay })
      toast.success('Resignation submitted. You are now in notice period.')
      setShowResignModal(false)
      fetchProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resignation failed')
    } finally {
      setResigning(false)
    }
  }

  const getStatusBadge = () => {
    if (!profile) return null
    const status = profile.employmentStatus || 'ACTIVE'
    if (status === 'NOTICE_PERIOD') return <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>🔔 Notice Period</span>
    if (status === 'RESIGNED') return <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>Resigned</span>
    return <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>Active</span>
  }

  if (loading) return <div className="loading">Loading...</div>

  const canResign = profile && (profile.employmentStatus === 'ACTIVE' || !profile.employmentStatus)

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        {profile && getStatusBadge()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e' }}>Account Info</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div><strong>Username:</strong> {user?.username}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div>
              <strong>Roles:</strong>{' '}
              {user?.roles?.map(r => (
                <span key={r} className="badge badge-info" style={{ marginRight: '0.25rem' }}>
                  {r.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Change Password</h2>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passForm.currentPassword}
                onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passForm.newPassword}
                onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={changingPass}>
              {changingPass ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {profile && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e' }}>Employee Profile</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!editMode && <button onClick={() => setEditMode(true)} className="btn btn-secondary btn-sm">Edit</button>}
                {canResign && (
                  <button
                    onClick={() => setShowResignModal(true)}
                    className="btn btn-danger btn-sm"
                  >
                    Resign
                  </button>
                )}
              </div>
            </div>

            {profile.employmentStatus === 'NOTICE_PERIOD' && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                🔔 You are currently in your <strong>notice period</strong>.
                Your last working day is <strong>{profile.noticePeriodEndDate}</strong>.
                Resignation submitted on: {profile.resignationDate}
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div><strong>Full Name:</strong> {profile.firstName} {profile.lastName}</div>
                <div><strong>Email:</strong> {profile.email}</div>
                <div><strong>Phone:</strong> {profile.phone || '-'}</div>
                <div><strong>Department:</strong> {profile.departmentName || '-'}</div>
                <div><strong>Designation:</strong> {profile.designationTitle || '-'}</div>
                <div><strong>Date of Joining:</strong> {profile.dateOfJoining || '-'}</div>
                <div><strong>Reporting Manager:</strong> {profile.reportingManagerName || '-'}</div>
                <div><strong>Employment Status:</strong> {getStatusBadge()}</div>
              </div>
            )}
          </div>
        )}

        {!profile && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">No employee profile linked to your account yet.</div>
          </div>
        )}
      </div>

      {/* Resign Modal */}
      {showResignModal && (
        <div className="modal-overlay" onClick={() => setShowResignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Submit Resignation</h2>
              <button className="modal-close" onClick={() => setShowResignModal(false)}>×</button>
            </div>
            <form onSubmit={handleResign} className="modal-form">
              <div style={{ padding: '0 0 1rem', color: '#666', fontSize: '0.9rem' }}>
                Once submitted, your status will change to <strong>Notice Period</strong> and your manager/admin will be notified.
              </div>
              <div className="form-group">
                <label>Last Working Day *</label>
                <input
                  type="date"
                  value={lastWorkingDay}
                  onChange={(e) => setLastWorkingDay(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowResignModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={resigning || !lastWorkingDay}>
                  {resigning ? 'Submitting...' : 'Confirm Resignation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
