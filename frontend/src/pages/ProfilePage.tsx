import { useState, useRef } from 'react'
import { Camera, Save, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useT } from '../hooks/useT'

export default function ProfilePage() {
  const tFn = useT()
  const { username, role } = useAuthStore()

  const [avatar, setAvatar] = useState<string>(localStorage.getItem('avatar') ?? '')
  const [form, setForm] = useState({
    displayName: localStorage.getItem('displayName') ?? username ?? '',
    email: localStorage.getItem('profileEmail') ?? '',
    phone: localStorage.getItem('profilePhone') ?? '',
    bio: localStorage.getItem('profileBio') ?? '',
  })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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
    if (!form.displayName) { toast.error(tFn('required')); return }
    setSavingInfo(true)
    await new Promise(r => setTimeout(r, 400))
    localStorage.setItem('displayName', form.displayName)
    localStorage.setItem('profileEmail', form.email)
    localStorage.setItem('profilePhone', form.phone)
    localStorage.setItem('profileBio', form.bio)
    setSavingInfo(false)
    toast.success('Профиль сохранён')
  }

  const savePassword = async () => {
    if (!pwForm.current || !pwForm.next) { toast.error(tFn('required')); return }
    if (pwForm.next !== pwForm.confirm) { toast.error(tFn('passwordMismatch')); return }
    if (pwForm.next.length < 6) { toast.error('Минимум 6 символов'); return }
    setSavingPw(true)
    await new Promise(r => setTimeout(r, 500))
    setPwForm({ current: '', next: '', confirm: '' })
    setSavingPw(false)
    toast.success('Пароль изменён')
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar + name */}
      <div className="card">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#6c63ff]/20 flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-[#6c63ff] uppercase">{username?.[0]}</span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#6c63ff]
                         flex items-center justify-center shadow-lg hover:bg-[#5b53e8] transition"
            >
              <Camera size={13} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <div className="text-white font-semibold text-lg">{form.displayName || username}</div>
            <div className="text-white/40 text-sm capitalize">{role?.toLowerCase()}</div>
            <div className="text-white/30 text-xs mt-0.5">@{username}</div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-white/70 flex items-center gap-2 uppercase tracking-wide">
          <User size={14} /> {tFn('personalInfo')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">Отображаемое имя</label>
            <input className="input" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('email')}</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="name@example.com" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('phone')}</label>
            <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+7 XXX XXX XX XX" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">О себе</label>
            <textarea className="input resize-none" rows={2} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={saveInfo} disabled={savingInfo} className="btn-primary">
            <Save size={15} />
            {savingInfo ? '...' : tFn('saveChanges')}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-white/70 flex items-center gap-2 uppercase tracking-wide">
          <Lock size={14} /> {tFn('changePassword')}
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('currentPassword')}</label>
            <input className="input" type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('newPassword')}</label>
            <input className="input" type="password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('confirmPassword')}</label>
            <input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={savePassword} disabled={savingPw} className="btn-primary">
            <Lock size={15} />
            {savingPw ? '...' : tFn('changePassword')}
          </button>
        </div>
      </div>
    </div>
  )
}
