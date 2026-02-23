import api from './axiosInstance'

export const employeesApi = {
  getAll: () => api.get('/api/employees'),
  getById: (id) => api.get(`/api/employees/${id}`),
  getMe: () => api.get('/api/employees/me'),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  updateMe: (data) => api.patch('/api/employees/me', data),
  resign: (data) => api.post('/api/employees/me/resign', data),
  delete: (id) => api.delete(`/api/employees/${id}`),
}

export const announcementsApi = {
  getAll: () => api.get('/api/announcements'),
  create: (data) => api.post('/api/announcements', data),
  delete: (id) => api.delete(`/api/announcements/${id}`),
}

export const auditLogsApi = {
  getLogs: (page = 0, size = 50) => api.get(`/api/audit-logs?page=${page}&size=${size}`),
}

export const managerNotesApi = {
  getMyNotes: () => api.get('/api/manager-notes/my-notes'),
  getNotesForEmployee: (employeeId) => api.get(`/api/manager-notes/employee/${employeeId}`),
  addNote: (data) => api.post('/api/manager-notes', data),
  deleteNote: (noteId) => api.delete(`/api/manager-notes/${noteId}`),
}

export const tasksApi = {
  create: (data) => api.post('/api/tasks', data),
  getMyTasks: () => api.get('/api/tasks/my-tasks'),
  getAssignedByMe: () => api.get('/api/tasks/assigned-by-me'),
  updateStatus: (id, status) => api.patch(`/api/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/tasks/${id}`),
}
