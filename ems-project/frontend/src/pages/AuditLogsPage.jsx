import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { auditLogsApi } from '../api/employees'
import './Auth.css'

const actionColors = {
  CREATE: '#28a745',
  UPDATE: '#007bff',
  DELETE: '#dc3545',
  RESIGN: '#fd7e14',
  DEFAULT: '#6c757d'
}

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auditLogsApi.getLogs(0, 100)
      .then(res => setLogs(res.data.data || []))
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Audit Logs</h1>
      </div>
      <div className="card">
        <div className="table-wrapper">
          {logs.length === 0 ? (
            <div className="empty-state">No audit logs found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Performed By</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span style={{
                        background: actionColors[log.action] || actionColors.DEFAULT,
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entityType}</td>
                    <td>{log.entityId || '-'}</td>
                    <td>{log.performedBy}</td>
                    <td style={{ maxWidth: '250px', fontSize: '0.85rem', color: '#555' }}>{log.details}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditLogsPage
