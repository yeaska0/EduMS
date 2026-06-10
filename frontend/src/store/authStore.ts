import { create } from 'zustand'

interface AuthState {
  token: string | null
  refreshToken: string | null
  username: string | null
  role: string | null
  isAuthenticated: boolean
  login: (token: string, refreshToken: string, username: string, role: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  username: localStorage.getItem('username'),
  role: localStorage.getItem('role'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (token, refreshToken, username, role) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('username', username)
    localStorage.setItem('role', role)
    set({ token, refreshToken, username, role, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    set({ token: null, refreshToken: null, username: null, role: null, isAuthenticated: false })
  },
}))
