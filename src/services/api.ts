/* ── GardeCoeur — Service API (Axios) ───────────────────────────────────── */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1',   // fallback local via proxy Vite
  headers: { 'Content-Type': 'application/json' },
})

// Injecter le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Rafraîchir le token si expiré (401)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const baseURL = import.meta.env.VITE_API_BASE_URL
          ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
          : '/api/v1'
        const { data } = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/* ── Auth ──────────────────────────────────────────────────────────────── */

export const authApi = {
  register: (data: { email: string; role: string; password: string; password2: string }) =>
    api.post('/auth/register/', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ access: string; refresh: string }>('/auth/login/', data),

  me: () => api.get('/auth/me/'),
}

/* ── Profils ───────────────────────────────────────────────────────────── */

export const profilesApi = {
  listRetired: (params?: Record<string, string | number>) =>
    api.get('/profiles/retired/', { params }),

  getRetired: (id: number) =>
    api.get(`/profiles/retired/${id}/`),

  getParent: (id: number) =>
    api.get(`/profiles/parents/${id}/`),

  getMe: () => api.get('/profiles/me/'),

  updateMe: (data: unknown) => api.put('/profiles/me/', data),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/profiles/me/avatar/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

/* ── Connexions ────────────────────────────────────────────────────────── */

export const connectionsApi = {
  list: () => api.get('/connections/'),
  create: (data: { parent: number; retired: number }) => api.post('/connections/', data),
  update: (id: number, status: string) => api.patch(`/connections/${id}/`, { status }),
}

/* ── Messagerie ────────────────────────────────────────────────────────── */

export const messagingApi = {
  conversations: () => api.get('/conversations/'),
  messages: (id: number) => api.get(`/conversations/${id}/messages/`),
}

/* ── Notifications ─────────────────────────────────────────────────────── */

export const notificationsApi = {
  list: () => api.get('/notifications/'),
  markRead: () => api.post('/notifications/mark-read/'),
}

export default api
