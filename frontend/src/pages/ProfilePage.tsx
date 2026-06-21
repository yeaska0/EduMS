import { useState, useRef, useEffect } from 'react'
import { Camera, Save, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/endpoints'
import { useT } from '../hooks/useT'

export default function ProfilePage() {
  const tFn = useT()
  const { username, role } = useAuthStore()

  const [avatar, setAvatar] = useState<string>(localStorage.getItem('avatar') ?? '')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', bio: '' })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    usersApi.getProfile()
      .then(r => {
        const d = r.data
        setForm({
          firstName: d.firstName ?? '',
          lastName: d.lastName ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          bio: d.bio ?? '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Файл слишком большой (макс. 2 МБ)'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatar(result)
      localStorage.setItem('avatar', result)
      toast.success('Аватар обновлён')
    }
    reader.readAsDataURL(file)
  }

  const saveInfo = async () => {
    if (!form.firstName) { toast.error(tFn('required')); return }
    setSavingInfo(true)
    try {
      await usersApi.updateProfile(form)
      toast.success('Профиль сохранён')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка сохранения')
    } finally { setSavingInfo(false) }
  }

  const savePassword = async () => {
    if (!pwForm.current || !pwForm.next) { toast.error(tFn('required')); return }
    if (pwForm.next !== pwForm.confirm) { toast.error(tFn('passwordMismatch')); return }
    if (pwForm.next.length < 6) { toast.error('Минимум 6 символов'); return }
    setSavingPw(true)
    try {
      await usersApi.changePassword(pwForm.current, pwForm.next)
      setPwForm({ current: '', next: '', confirm: '' })
      toast.success('Пароль изменён')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Неверный текущий пароль')
    } finally { setSavingPw(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#6c63ff]/20 flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-[#6c63ff] uppercase">{username?.[0]}</span>
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#6c63ff] flex items-center justify-center shadow-lg hover:bg-[#5b53e8] transition">
              <Camera size={13} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <div className="text-white font-semibold text-lg dark:text-white text-slate-900">
              {form.firstName ? `${form.firstName} ${form.lastName}` : username}
            </div>
            <div className="text-white/40 text-sm capitalize dark:text-white/40 text-slate-500">{role?.toLowerCase()}</div>
            <div className="text-white/30 text-xs mt-0.5 dark:text-white/30 text-slate-400">@{username}</div>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-semibold dark:text-white/70 text-slate-600 flex items-center gap-2 uppercase tracking-wide">
          <User size={14} /> {tFn('personalInfo')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">{tFn('firstName')}</label>
            <input className="input" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">{tFn('lastName')}</label>
            <input className="input" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">{tFn('email')}</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="name@example.com" />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">{tFn('phone')}</label>
            <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+7 XXX XXX XX XX" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">О себе</label>
            <textarea className="input resize-none" rows={2} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={saveInfo} disabled={savingInfo} className="btn-primary">
            <Save size={15} /> {savingInfo ? '...' : tFn('saveChanges')}
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-semibold dark:text-white/70 text-slate-600 flex items-center gap-2 uppercase tracking-wide">
          <Lock size={14} /> {tFn('changePassword')}
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">{tFn('currentPassword')}</label>
            <input className="input" type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">{tFn('newPassword')}</label>
            <input className="input" type="password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">{tFn('confirmPassword')}</label>
            <input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={savePassword} disabled={savingPw} className="btn-primary">
            <Lock size={15} /> {savingPw ? '...' : tFn('changePassword')}
          </button>
        </div>
      </div>
    </div>
  )
}
