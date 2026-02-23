import api from './axiosInstance'

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
  refreshToken: (data) => api.post('/api/auth/refresh-token', data),
}
