import { useEffect, useState } from 'react'
import { Trash2, UserPlus, Shield, GraduationCap, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi, authApi } from '../api/endpoints'
import type { UserProfile } from '../types'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import { useAuthStore } from '../store/authStore'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const
type Role = typeof ROLES[number]

const EMPTY = { username: '', password: '', firstName: '', lastName: '', email: '', role: 'TEACHER' as Role }

function roleIcon(role: string) {
  if (role === 'ADMIN') return <Shield size={13} />
  if (role === 'TEACHER') return <BookOpen size={13} />
  return <GraduationCap size={13} />
}
function roleVariant(role: string) {
  if (role === 'ADMIN') return 'purple'
  if (role === 'TEACHER') return 'blue'
  return 'green'
}

export default function UsersPage() {
  const { username: me } = useAuthStore()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    usersApi.list()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.username || !form.password) { toast.error('Заполните обязательные поля'); return }
    setSaving(true)
    try {
      await authApi.register({
        username: form.username,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role as any,
      })
      toast.success('Пользователь создан')
      setModalOpen(false)
      setForm(EMPTY)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка создания')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await usersApi.delete(deleteTarget.id)
      toast.success('Пользователь удалён')
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка удаления')
    } finally { setDeleting(false) }
  }

  const f = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <UserPlus size={16} /> Добавить пользователя
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30">Загрузка...</td></tr>
              ) : users.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-white/30 text-xs">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#6c63ff]/20 flex items-center justify-center text-xs font-bold text-[#6c63ff] uppercase">
                        {(u.firstName?.[0] ?? u.username[0])}
                      </div>
                      <div>
                        <div className="dark:text-white text-slate-800 font-medium text-sm">
                          {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : u.username}
                        </div>
                        <div className="dark:text-white/30 text-slate-400 text-xs">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="dark:text-white/60 text-slate-500 text-sm">{u.email ?? '—'}</td>
                  <td>
                    <Badge variant={roleVariant(u.role) as any}>
                      <span className="flex items-center gap-1">{roleIcon(u.role)} {u.role}</span>
                    </Badge>
                  </td>
                  <td className="dark:text-white/40 text-slate-400 text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru') : '—'}
                  </td>
                  <td>
                    {u.username !== me && (
                      <button onClick={() => setDeleteTarget(u)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Добавить пользователя" onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Имя пользователя *</label>
            <input className="input" value={form.username} onChange={e => f('username', e.target.value)} placeholder="username" />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Пароль *</label>
            <input className="input" type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="••••••" />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Имя</label>
            <input className="input" value={form.firstName} onChange={e => f('firstName', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Фамилия</label>
            <input className="input" value={form.lastName} onChange={e => f('lastName', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => f('email', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Роль</label>
            <select className="select" value={form.role} onChange={e => f('role', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={() => setModalOpen(false)} className="btn-ghost">Отмена</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary">
            {saving ? '...' : 'Создать'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удалить пользователя"
        message={`Удалить @${deleteTarget?.username}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
