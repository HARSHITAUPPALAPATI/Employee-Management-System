import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { employeesApi, managerNotesApi } from '../api/employees'
import { departmentsApi, designationsApi, usersApi } from '../api/index'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', dateOfJoining: '', salary: '',
  departmentId: '', designationId: '', reportingManagerId: '', userId: ''
}

const statusBadge = (emp) => {
  if (emp.employmentStatus === 'NOTICE_PERIOD') return <span className="badge badge-warning">Notice Period</span>
  if (emp.employmentStatus === 'RESIGNED') return <span className="badge badge-danger">Resigned</span>
  return <span className="badge badge-success">Active</span>
}

const EmployeesPage = () => {
  const { isAdmin, isManager } = useAuth()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  // Notes state
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notesEmployee, setNotesEmployee] = useState(null)
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const fetchAll = async () => {
    try {
      const [empRes, deptRes, desigRes, userRes] = await Promise.all([
        employeesApi.getAll(),
        departmentsApi.getAll(),
        designationsApi.getAll(),
        usersApi.getAll(),
      ])
      setEmployees(empRes.data.data || [])
      setDepartments(deptRes.data.data || [])
      setDesignations(desigRes.data.data || [])
      setUsers(userRes.data.data || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setForm(initialForm)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (emp) => {
    setForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      dateOfBirth: emp.dateOfBirth || '',
      dateOfJoining: emp.dateOfJoining || '',
      salary: emp.salary || '',
      departmentId: emp.departmentId || '',
      designationId: emp.designationId || '',
      reportingManagerId: emp.reportingManagerId || '',
      userId: emp.userId || '',
    })
    setEditingId(emp.id)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        salary: form.salary ? parseFloat(form.salary) : null,
        departmentId: form.departmentId ? parseInt(form.departmentId) : null,
        designationId: form.designationId ? parseInt(form.designationId) : null,
        reportingManagerId: form.reportingManagerId ? parseInt(form.reportingManagerId) : null,
        userId: form.userId ? parseInt(form.userId) : null,
        dateOfBirth: form.dateOfBirth || null,
      }
      if (editingId) {
        await employeesApi.update(editingId, payload)
        toast.success('Employee updated successfully')
      } else {
        await employeesApi.create(payload)
        toast.success('Employee created successfully')
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
    if (!window.confirm('Delete this employee?')) return
    try {
      await employeesApi.delete(id)
      toast.success('Employee deleted')
      fetchAll()
    } catch {
      toast.error('Delete failed')
    }
  }

  const openNotes = async (emp) => {
    setNotesEmployee(emp)
    setShowNotesModal(true)
    try {
      const res = await managerNotesApi.getNotesForEmployee(emp.id)
      setNotes(res.data.data || [])
    } catch {
      setNotes([])
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setSavingNote(true)
    try {
      await managerNotesApi.addNote({ employeeId: notesEmployee.id, note: newNote })
      toast.success('Note added')
      setNewNote('')
      const res = await managerNotesApi.getNotesForEmployee(notesEmployee.id)
      setNotes(res.data.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note')
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await managerNotesApi.deleteNote(noteId)
      toast.success('Note deleted')
      const res = await managerNotesApi.getNotesForEmployee(notesEmployee.id)
      setNotes(res.data.data || [])
    } catch {
      toast.error('Failed to delete note')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Employees</h1>
        <button onClick={openCreate} className="btn btn-primary">+ Add Employee</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          {employees.length === 0 ? (
            <div className="empty-state">No employees found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td>{emp.email}</td>
                    <td>{emp.departmentName || '-'}</td>
                    <td>{emp.designationTitle || '-'}</td>
                    <td>{emp.reportingManagerName || '-'}</td>
                    <td>
                      {statusBadge(emp)}
                      {emp.employmentStatus === 'NOTICE_PERIOD' && emp.noticePeriodEndDate && (
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                          Until: {emp.noticePeriodEndDate}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button onClick={() => openEdit(emp)} className="btn btn-secondary btn-sm">Edit</button>
                        <button onClick={() => openNotes(emp)} className="btn btn-secondary btn-sm">Notes</button>
                        {isAdmin() && (
                          <button onClick={() => handleDelete(emp.id)} className="btn btn-danger btn-sm">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input type="number" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Date of Joining *</label>
                  <input type="date" value={form.dateOfJoining} onChange={(e) => setForm({...form, dateOfJoining: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.departmentId} onChange={(e) => setForm({...form, departmentId: e.target.value})}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Designation</label>
                <select value={form.designationId} onChange={(e) => setForm({...form, designationId: e.target.value})}>
                  <option value="">Select Designation</option>
                  {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Reporting Manager</label>
                <select value={form.reportingManagerId} onChange={(e) => setForm({...form, reportingManagerId: e.target.value})}>
                  <option value="">None</option>
                  {employees.filter(e => e.id !== editingId).map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              {!editingId && (
                <div className="form-group">
                  <label>Link to User <span style={{color:'#888',fontSize:'0.8rem'}}>(optional)</span></label>
                  <select value={form.userId} onChange={(e) => setForm({...form, userId: e.target.value})}>
                    <option value="">None</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
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

      {/* Manager Notes Modal */}
      {showNotesModal && notesEmployee && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Notes — {notesEmployee.firstName} {notesEmployee.lastName}</h2>
              <button className="modal-close" onClick={() => setShowNotesModal(false)}>×</button>
            </div>
            <div style={{ padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <div className="empty-state">No notes yet.</div>
              ) : (
                notes.map(n => (
                  <div key={n.id} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem', position: 'relative' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{n.note}</p>
                    <small style={{ color: '#888' }}>By {n.managerName} · {new Date(n.createdAt).toLocaleDateString()}</small>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '1rem' }}
                    >×</button>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddNote} style={{ padding: '0 1rem 1rem' }}>
              <div className="form-group">
                <label>Add Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  placeholder="Write a note about this employee..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNotesModal(false)} className="btn btn-secondary">Close</button>
                <button type="submit" className="btn btn-primary" disabled={savingNote || !newNote.trim()}>
                  {savingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeesPage
