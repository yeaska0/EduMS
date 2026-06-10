import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import { useT } from '../hooks/useT'

export default function LoginPage() {
  const tFn = useT()
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error(tFn('required'))
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data.accessToken, data.refreshToken, data.username, data.role)
      navigate('/', { replace: true })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0e1d] p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6c63ff]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#6c63ff]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6c63ff] mb-4 shadow-lg shadow-[#6c63ff]/30">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{tFn('loginTitle')}</h1>
          <p className="text-white/40 text-sm mt-1">{tFn('loginSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                {tFn('username')}
              </label>
              <input
                className="input"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                {tFn('password')}
              </label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center py-3 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : tFn('login')}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <p className="text-center text-white/20 text-xs mt-4">
          admin / admin123 · teacher / teach123
        </p>
      </div>
    </div>
  )
}
