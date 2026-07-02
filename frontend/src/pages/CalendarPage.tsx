import { useEffect, useState } from 'react'
import { Plus, Trash2, Clock, MapPin, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { scheduleApi, coursesApi } from '../api/endpoints'
import type { ScheduleEvent, Course } from '../types'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00

const TYPE_LABELS: Record<string, string> = {
  LECTURE: 'Лекция', SEMINAR: 'Семинар', LAB: 'Лаб. работа', EXAM: 'Экзамен', OTHER: 'Другое',
}

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f97316','#22c55e','#14b8a6','#3b82f6','#ef4444']

const EMPTY_FORM = { title: '', courseId: '', instructor: '', room: '', dayOfWeek: 0, startTime: '09:00', endTime: '10:30', color: '#6366f1', type: 'LECTURE' }

export default function CalendarPage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ScheduleEvent | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM & { dayOfWeek: number }>(EMPTY_FORM)

  const load = async () => {
    try {
      const [eRes, cRes] = await Promise.all([scheduleApi.list(), coursesApi.list(0, 100)])
      setEvents(eRes.data)
      setCourses(cRes.data.content)
    } catch { toast.error('Ошибка загрузки') }
  }

  useEffect(() => { load() }, [])

  const timeToMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const minutesToPx = (minutes: number) => ((minutes - 8 * 60) / 60) * 64 // 64px per hour
  const durationPx = (start: string, end: string) => ((timeToMinutes(end) - timeToMinutes(start)) / 60) * 64

  const openCreate = (day: number) => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, dayOfWeek: day })
    setShowModal(true)
  }

  const openEdit = (e: ScheduleEvent) => {
    setEditing(e)
    setForm({
      title: e.title, courseId: e.courseId ? String(e.courseId) : '',
      instructor: e.instructor || '', room: e.room || '',
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime.slice(0, 5),
      endTime: e.endTime.slice(0, 5),
      color: e.color || '#6366f1',
      type: e.type,
    })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return toast.error('Введите название')
    try {
      const payload = {
        title: form.title.trim(),
        courseId: form.courseId ? Number(form.courseId) : undefined,
        instructor: form.instructor || undefined,
        room: form.room || undefined,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        type: form.type as ScheduleEvent['type'],
      }
      if (editing) { await scheduleApi.update(editing.id, payload) } else { await scheduleApi.create(payload) }
      toast.success('Сохранено'); setShowModal(false); load()
    } catch { toast.error('Ошибка') }
  }

  const remove = async (id: number) => {
    try { await scheduleApi.delete(id); toast.success('Удалено'); load() }
    catch { toast.error('Ошибка') }
  }

  const eventsForDay = (day: number) => events.filter(e => e.dayOfWeek === day)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white text-slate-900">Расписание</h1>
          <p className="text-sm dark:text-white/40 text-slate-500 mt-0.5">Недельное расписание занятий</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card p-0 overflow-hidden">
        {/* Day headers */}
        <div className="grid dark:border-b dark:border-white/[0.06] border-b border-slate-200" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
          <div className="p-3" />
          {DAYS.map((day, i) => {
            const today = new Date().getDay()
            const dayIdx = today === 0 ? 6 : today - 1
            return (
              <div key={day} className={`p-3 text-center border-l dark:border-white/[0.06] border-slate-200 ${i === dayIdx ? 'dark:bg-indigo-500/10 bg-indigo-50' : ''}`}>
                <div className={`text-xs font-bold ${i === dayIdx ? 'text-indigo-400' : 'dark:text-white/40 text-slate-500'}`}>{day}</div>
                {i === dayIdx && <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-bold mx-auto mt-1 flex items-center justify-center">{new Date().getDate()}</div>}
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="relative overflow-auto max-h-[600px]">
          <div className="relative" style={{ height: `${13 * 64}px` }}>
            {/* Hour lines */}
            {HOURS.map(h => (
              <div key={h} className="absolute left-0 right-0 dark:border-white/[0.04] border-slate-100 border-b" style={{ top: `${(h - 8) * 64}px` }}>
                <span className="absolute left-1 top-1 text-[10px] dark:text-white/20 text-slate-400 w-10 text-right">{h}:00</span>
              </div>
            ))}

            {/* Day columns */}
            <div className="absolute inset-0 ml-12 grid grid-cols-7">
              {Array.from({ length: 7 }, (_, dayIdx) => (
                <div key={dayIdx}
                  className="relative border-l dark:border-white/[0.04] border-slate-100 cursor-pointer group"
                  onClick={() => openCreate(dayIdx)}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 dark:bg-white/[0.02] bg-slate-50 transition flex items-center justify-center">
                    <Plus size={14} className="dark:text-white/20 text-slate-300" />
                  </div>

                  {eventsForDay(dayIdx).map(ev => {
                    const top = minutesToPx(timeToMinutes(ev.startTime))
                    const height = Math.max(durationPx(ev.startTime, ev.endTime), 24)
                    return (
                      <div key={ev.id}
                        className="absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer group/ev overflow-hidden shadow-sm border"
                        style={{ top: `${top}px`, height: `${height}px`, background: ev.color + '20', borderColor: ev.color + '50' }}
                        onClick={e => { e.stopPropagation(); openEdit(ev) }}>
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold truncate" style={{ color: ev.color }}>{ev.title}</div>
                            {height > 40 && (
                              <>
                                <div className="text-[10px] dark:text-white/50 text-slate-500 flex items-center gap-0.5 mt-0.5">
                                  <Clock size={8} /> {ev.startTime.slice(0,5)}–{ev.endTime.slice(0,5)}
                                </div>
                                {ev.room && <div className="text-[10px] dark:text-white/40 text-slate-400 flex items-center gap-0.5"><MapPin size={8} />{ev.room}</div>}
                              </>
                            )}
                          </div>
                          <button className="opacity-0 group-hover/ev:opacity-100 transition flex-shrink-0"
                            onClick={e => { e.stopPropagation(); remove(ev.id) }}>
                            <Trash2 size={10} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="dark:bg-[#161827] bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold dark:text-white text-slate-900">
              {editing ? 'Редактировать событие' : 'Добавить занятие'}
            </h2>

            <input className="input w-full" placeholder="Название *" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">День</label>
                <select className="select w-full" value={form.dayOfWeek}
                  onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}>
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Тип</label>
                <select className="select w-full" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Начало</label>
                <input className="input w-full" type="time" value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Конец</label>
                <input className="input w-full" type="time" value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1 flex items-center gap-1"><MapPin size={10} /> Аудитория</label>
                <input className="input w-full" placeholder="305-B" value={form.room}
                  onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs dark:text-white/40 text-slate-500 mb-1 flex items-center gap-1"><BookOpen size={10} /> Курс</label>
                <select className="select w-full" value={form.courseId}
                  onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
                  <option value="">— Выбрать —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs dark:text-white/40 text-slate-500 mb-2">Цвет</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-6 h-6 rounded-full border-2 transition ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={save} className="btn-primary flex-1">Сохранить</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
