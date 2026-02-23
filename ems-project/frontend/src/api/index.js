import api from './axiosInstance'

export const departmentsApi = {
  getAll: () => api.get('/api/departments'),
  getById: (id) => api.get(`/api/departments/${id}`),
  create: (data) => api.post('/api/departments', data),
  update: (id, data) => api.put(`/api/departments/${id}`, data),
  delete: (id) => api.delete(`/api/departments/${id}`),
}

export const designationsApi = {
  getAll: () => api.get('/api/designations'),
  getById: (id) => api.get(`/api/designations/${id}`),
  create: (data) => api.post('/api/designations', data),
  update: (id, data) => api.put(`/api/designations/${id}`, data),
  delete: (id) => api.delete(`/api/designations/${id}`),
}

export const usersApi = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  assignRole: (id, data) => api.post(`/api/users/${id}/assign-role`, data),
  removeRole: (id, data) => api.delete(`/api/users/${id}/remove-role`, { data }),
  lock: (id) => api.patch(`/api/users/${id}/lock`),
  unlock: (id) => api.patch(`/api/users/${id}/unlock`),
  delete: (id) => api.delete(`/api/users/${id}`),
}

export const rolesApi = {
  getAll: () => api.get('/api/roles'),
  create: (name) => api.post(`/api/roles?name=${name}`),
  delete: (id) => api.delete(`/api/roles/${id}`),
}
