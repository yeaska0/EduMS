import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

// ─── Request interceptor: attach token ───────────────────────────────────────
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ─── Response interceptor: refresh on 401 ───────────────────────────────────
let refreshing = false
let queue: ((token: string) => void)[] = []

api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      if (refreshing) {
        return new Promise(resolve => {
          queue.push(token => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }
      refreshing = true
      try {
        const rToken = localStorage.getItem('refreshToken')
        if (!rToken) throw new Error('No refresh token')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken: rToken })
        localStorage.setItem('accessToken', data.token)
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
        queue.forEach(cb => cb(data.token))
        queue = []
        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
