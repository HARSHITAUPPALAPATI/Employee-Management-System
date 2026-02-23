import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { tasksApi, employeesApi } from '../api/employees'
import { useAuth } from '../context/AuthContext'

const priorityColor = {
  HIGH: { background: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
  MEDIUM: { background: '#fef9c3', color: '#ca8a04', border: '#fde047' },
  LOW: { background: '#dcfce7', color: '#16a34a', border: '#86efac' },
}

const statusColor = {
  PENDING: { background: '#f1f5f9', color: '#64748b' },
  IN_PROGRESS: { background: '#dbeafe', color: '#2563eb' },
  COMPLETED: { background: '#dcfce7', color: '#16a34a' },
}

const TasksPage = () => {
  const { user, isManager, isAdmin } = useAuth()
  const isManagerOrAdmin = isManager() || isAdmin()

  const [myTasks, setMyTasks] = useState([])
  const [assignedTasks, setAssignedTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-tasks')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', assignedToId: '', deadline: '', priority: 'MEDIUM'
  })

  const today = new Date().toISOString().split('T')[0]

  const fetchData = async () => {
    setLoading(true)
    try {
      const myRes = await tasksApi.getMyTasks()
      setMyTasks(myRes.data.data || [])
      if (isManagerOrAdmin) {
        const assignedRes = await tasksApi.getAssignedByMe()
        setAssignedTasks(assignedRes.data.data || [])
        const empRes = await employeesApi.getAll()
        setEmployees(empRes.data.data || [])
      }
    } catch (err) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await tasksApi.create(form)
      toast.success('Task assigned successfully!')
      setShowCreateModal(false)
      setForm({ title: '', description: '', assignedToId: '', deadline: '', priority: 'MEDIUM' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus)
      toast.success('Status updated!')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await tasksApi.delete(taskId)
      toast.success('Task deleted')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task')
    }
  }

  const TaskCard = ({ task, showAssignee = false, showActions = false }) => {
    const isOverdue = task.overdue
    const p = priorityColor[task.priority] || priorityColor.MEDIUM
    const s = statusColor[task.status] || statusColor.PENDING

    return (
      <div style={{
        border: `1px solid ${isOverdue ? '#fca5a5' : '#e2e8f0'}`,
        borderLeft: `4px solid ${isOverdue ? '#dc2626' : p.border}`,
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        background: isOverdue ? '#fff5f5' : '#fff',
        marginBottom: '0.75rem',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>{task.title}</span>
              {isOverdue && <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '6px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700 }}>OVERDUE</span>}
              <span style={{ ...p, borderRadius: '6px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700 }}>{task.priority}</span>
            </div>
            {task.description && (
              <p style={{ color: '#64748b', fontSize: '0.87rem', margin: '0.25rem 0 0.5rem' }}>{task.description}</p>
            )}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
              {showAssignee && <span>👤 Assigned to: <strong>{task.assignedToName}</strong></span>}
              {!showAssignee && <span>👤 Assigned by: <strong>{task.assignedByName}</strong></span>}
              <span>📅 Deadline: <strong style={{ color: isOverdue ? '#dc2626' : '#1a1a2e' }}>{task.deadline}</strong></span>
              {task.completedAt && <span>✅ Completed: {new Date(task.completedAt).toLocaleDateString()}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', minWidth: '140px' }}>
            <span style={{ ...s, borderRadius: '8px', padding: '3px 12px', fontSize: '0.8rem', fontWeight: 600 }}>
              {task.status.replace('_', ' ')}
            </span>
            {/* Status change dropdown */}
            {task.status !== 'COMPLETED' && (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                style={{ fontSize: '0.8rem', padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            )}
            {task.status === 'COMPLETED' && (
              <button onClick={() => handleStatusChange(task.id, 'PENDING')}
                style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#f8fafc' }}>
                Reopen
              </button>
            )}
            {showActions && (
              <button onClick={() => handleDelete(task.id)}
                style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer', background: '#fff5f5' }}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = myTasks.filter(t => t.status !== 'COMPLETED').length

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1>Tasks</h1>
          {pendingCount > 0 && (
            <span style={{ background: '#e94560', color: '#fff', borderRadius: '12px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
              {pendingCount} pending
            </span>
          )}
        </div>
        {isManagerOrAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Assign Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        {[
          { key: 'my-tasks', label: `My Tasks (${myTasks.length})` },
          ...(isManagerOrAdmin ? [{ key: 'assigned', label: `Assigned by Me (${assignedTasks.length})` }] : [])
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.6rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? '#4361ee' : '#64748b',
              borderBottom: activeTab === tab.key ? '2px solid #4361ee' : '2px solid transparent',
              marginBottom: '-2px', fontSize: '0.95rem'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <>
          {activeTab === 'my-tasks' && (
            <div>
              {myTasks.length === 0 ? (
                <div className="empty-state card">No tasks assigned to you yet.</div>
              ) : (
                <>
                  {/* Overdue */}
                  {myTasks.filter(t => t.overdue).length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ color: '#dc2626', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>⚠️ OVERDUE</h3>
                      {myTasks.filter(t => t.overdue).map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                  )}
                  {/* Active */}
                  {myTasks.filter(t => !t.overdue && t.status !== 'COMPLETED').length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ color: '#1a1a2e', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>📋 Active</h3>
                      {myTasks.filter(t => !t.overdue && t.status !== 'COMPLETED').map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                  )}
                  {/* Completed */}
                  {myTasks.filter(t => t.status === 'COMPLETED').length > 0 && (
                    <div>
                      <h3 style={{ color: '#16a34a', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>✅ Completed</h3>
                      {myTasks.filter(t => t.status === 'COMPLETED').map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'assigned' && isManagerOrAdmin && (
            <div>
              {assignedTasks.length === 0 ? (
                <div className="empty-state card">You haven't assigned any tasks yet.</div>
              ) : (
                assignedTasks.map(t => <TaskCard key={t.id} task={t} showAssignee showActions />)
              )}
            </div>
          )}
        </>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Assign New Task</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Fix login bug" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Task details..." rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assign To *</label>
                  <select value={form.assignedToId} onChange={e => setForm({ ...form, assignedToId: e.target.value })} required>
                    <option value="">Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.departmentName || 'No dept'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Deadline *</label>
                <input type="date" value={form.deadline} min={today}
                  onChange={e => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TasksPage
