import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Clock, AlertCircle, Zap, Calendar, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { tasksApi, coursesApi } from '../api/endpoints'
import type { Task, Course } from '../types'

const PRIORITY_CONFIG = {
  LOW:    { label: 'Низкий',    color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  MEDIUM: { label: 'Средний',   color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
  HIGH:   { label: 'Высокий',   color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  URGENT: { label: 'Срочно',    color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
}

const STATUS_ICONS = {
  TODO:        <Circle size={18} className="text-slate-500" />,
  IN_PROGRESS: <Clock size={18} className="text-blue-400" />,
  DONE:        <CheckCircle2 size={18} className="text-emerald-400" />,
}

const EMPTY_FORM = { title: '', description: '', dueDate: '', courseId: '', priority: 'MEDIUM' as Task['priority'], status: 'TODO' as Task['status'] }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL')

  const load = async () => {
    try {
      const [tRes, cRes] = await Promise.all([tasksApi.list(), coursesApi.list(0, 100)])
      setTasks(tRes.data)
      setCourses(cRes.data.content)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (t: Task) => {
    setEditing(t)
    setForm({
      title: t.title, description: t.description || '',
      dueDate: t.dueDate ? t.dueDate.slice(0, 16) : '',
      courseId: t.courseId ? String(t.courseId) : '',
      priority: t.priority, status: t.status,
    })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return toast.error('Введите название задачи')
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || undefined,
        dueDate: form.dueDate ? form.dueDate : undefined,
        courseId: form.courseId ? Number(form.courseId) : undefined,
        priority: form.priority,
        status: form.status,
      }
      if (editing) { await tasksApi.update(editing.id, payload) } else { await tasksApi.create(payload) }
      toast.success(editing ? 'Задача обновлена' : 'Задача создана')
      setShowModal(false); load()
    } catch { toast.error('Ошибка сохранения') }
  }

  const toggleDone = async (t: Task) => {
    try {
      await tasksApi.update(t.id, { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE', courseId: t.courseId || undefined })
      load()
    } catch { toast.error('Ошибка') }
  }

  const remove = async (id: number) => {
    try { await tasksApi.delete(id); toast.success('Удалено'); load() }
    catch { toast.error('Ошибка') }
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)
  const counts = { ALL: tasks.length, TODO: tasks.filter(t => t.status === 'TODO').length, IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length, DONE: tasks.filter(t => t.status === 'DONE').length }

  const isOverdue = (t: Task) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white text-slate-900">Задачи</h1>
          <p className="text-sm dark:text-white/40 text-slate-500 mt-0.5">
            {counts.TODO} осталось · {counts.DONE} выполнено
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Новая задача
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 dark:bg-white/[0.04] bg-slate-100 p-1 rounded-xl w-fit">
        {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === s
                ? 'dark:bg-white/10 bg-white dark:text-white text-slate-900 shadow-sm'
                : 'dark:text-white/40 text-slate-500 hover:dark:text-white/60'
            }`}>
            {s === 'ALL' ? 'Все' : s === 'TODO' ? 'К выполнению' : s === 'IN_PROGRESS' ? 'В работе' : 'Готово'}
            <span className="ml-1.5 dark:opacity-50 opacity-70">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="text-center py-16 dark:text-white/30 text-slate-400">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle2 size={40} className="mx-auto dark:text-white/10 text-slate-300 mb-3" />
          <p className="dark:text-white/30 text-slate-400 text-sm">Задач нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => {
            const pCfg = PRIORITY_CONFIG[t.priority]
            const overdue = isOverdue(t)
            return (
              <div key={t.id}
                className={`card flex items-start gap-3 group transition hover:border-indigo-500/30 cursor-pointer
                  ${t.status === 'DONE' ? 'opacity-60' : ''}
                  ${overdue ? 'border-red-500/30' : ''}`}
                onClick={() => openEdit(t)}>
                {/* Status toggle */}
                <button className="mt-0.5 flex-shrink-0" onClick={e => { e.stopPropagation(); toggleDone(t) }}>
                  {STATUS_ICONS[t.status]}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-sm font-semibold dark:text-white text-slate-800 ${t.status === 'DONE' ? 'line-through' : ''}`}>
                      {t.title}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${pCfg.color} ${pCfg.bg} ${pCfg.border}`}>
                      {pCfg.label}
                    </span>
                    {overdue && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-400/10 text-red-400 border border-red-400/20 flex items-center gap-0.5"><AlertCircle size={9} /> Просрочено</span>}
                  </div>
                  {t.description && <p className="text-xs dark:text-white/40 text-slate-500 mt-0.5 truncate">{t.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {t.dueDate && (
                      <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'dark:text-white/40 text-slate-400'}`}>
                        <Calendar size={11} />
                        {new Date(t.dueDate).toLocaleDateString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </span>
                    )}
                    {t.courseName && (
                      <span className="flex items-center gap-1 text-xs dark:text-white/30 text-slate-400">
                        <BookOpen size={11} /> {t.courseName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg dark:hover:bg-red-400/10 hover:bg-red-50 dark:text-red-400 text-red-500"
                  onClick={e => { e.stopPropagation(); remove(t.id) }}>
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="dark:bg-[#161827] bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold dark:text-white text-slate-900">
              {editing ? 'Редактировать задачу' : 'Новая задача'}
            </h2>

            <input className="input w-full" placeholder="Название задачи *" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />

            <textarea className="input w-full resize-none" rows={2} placeholder="Описание (необязательно)"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Дедлайн</label>
                <input className="input w-full" type="datetime-local" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Приоритет</label>
                <select className="select w-full" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}>
                  <option value="LOW">Низкий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="HIGH">Высокий</option>
                  <option value="URGENT">Срочно</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Статус</label>
                <select className="select w-full" value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Task['status'] }))}>
                  <option value="TODO">К выполнению</option>
                  <option value="IN_PROGRESS">В работе</option>
                  <option value="DONE">Готово</option>
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Курс</label>
                <select className="select w-full" value={form.courseId}
                  onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
                  <option value="">— Не привязан —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={save} className="btn-primary flex-1">
                <Zap size={14} /> {editing ? 'Сохранить' : 'Создать'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
