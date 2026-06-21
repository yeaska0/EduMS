import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, FileX, Save, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceApi, coursesApi, enrollmentsApi } from '../api/endpoints'
import type { Course, AttendanceStatus, Attendance } from '../types'

const STATUSES: { value: AttendanceStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'PRESENT', label: 'Присутствовал', color: 'text-emerald-400', icon: <CheckCircle size={15} /> },
  { value: 'ABSENT',  label: 'Отсутствовал',  color: 'text-red-400',     icon: <XCircle size={15} /> },
  { value: 'LATE',    label: 'Опоздал',        color: 'text-yellow-400',  icon: <Clock size={15} /> },
  { value: 'EXCUSED', label: 'Уважительная',   color: 'text-blue-400',    icon: <FileX size={15} /> },
]

interface StudentRow {
  studentId: number
  studentName: string
  status: AttendanceStatus
  note: string
}

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [rows, setRows] = useState<StudentRow[]>([])
  const [existing, setExisting] = useState<Attendance[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    coursesApi.list(0, 100).then(r => setCourses(r.data.content)).catch(() => {})
  }, [])

  const loadAttendance = useCallback(async () => {
    if (!selectedCourse || !date) return
    setLoading(true)
    try {
      const [enrollRes, attRes] = await Promise.all([
        enrollmentsApi.list(0, 200, undefined, Number(selectedCourse)),
        attendanceApi.byCourseAndDate(Number(selectedCourse), date),
      ])
      setExisting(attRes.data)
      const attMap = new Map(attRes.data.map(a => [a.studentId, a]))
      const newRows: StudentRow[] = enrollRes.data.content.map(e => {
        const att = attMap.get(e.studentId)
        return {
          studentId: e.studentId,
          studentName: e.studentName,
          status: att?.status ?? 'PRESENT',
          note: att?.note ?? '',
        }
      })
      setRows(newRows)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }, [selectedCourse, date])

  useEffect(() => { loadAttendance() }, [loadAttendance])

  const setStatus = (studentId: number, status: AttendanceStatus) =>
    setRows(r => r.map(row => row.studentId === studentId ? { ...row, status } : row))

  const setNote = (studentId: number, note: string) =>
    setRows(r => r.map(row => row.studentId === studentId ? { ...row, note } : row))

  const handleSave = async () => {
    if (!selectedCourse || !date || rows.length === 0) return
    setSaving(true)
    try {
      await Promise.all(rows.map(row =>
        attendanceApi.mark({
          studentId: row.studentId,
          courseId: Number(selectedCourse),
          date,
          status: row.status,
          note: row.note || undefined,
        })
      ))
      toast.success(`Сохранено: ${rows.length} записей`)
    } catch { toast.error('Ошибка сохранения') }
    finally { setSaving(false) }
  }

  const presentCount = rows.filter(r => r.status === 'PRESENT').length
  const absentCount = rows.filter(r => r.status === 'ABSENT').length

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1">Курс</label>
            <select className="select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
              <option value="">— Выбрать курс —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs dark:text-white/40 text-slate-500 mb-1 flex items-center gap-1">
              <CalendarDays size={12} /> Дата
            </label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          {rows.length > 0 && (
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save size={15} /> {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex gap-4 mt-4 pt-4 border-t dark:border-white/[0.06] border-slate-200">
            <div className="text-sm dark:text-white/60 text-slate-600">
              Всего: <span className="font-semibold dark:text-white text-slate-900">{rows.length}</span>
            </div>
            <div className="text-sm text-emerald-400">
              Присутствуют: <span className="font-semibold">{presentCount}</span>
            </div>
            <div className="text-sm text-red-400">
              Отсутствуют: <span className="font-semibold">{absentCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {selectedCourse && (
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 dark:text-white/30 text-slate-400">Загрузка...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 dark:text-white/30 text-slate-400 text-sm">
              Нет студентов в этом курсе
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Студент</th>
                    <th>Статус</th>
                    <th>Примечание</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.studentId}>
                      <td className="dark:text-white/30 text-slate-400 text-xs">{i + 1}</td>
                      <td className="dark:text-white text-slate-800 font-medium text-sm">{row.studentName}</td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {STATUSES.map(s => (
                            <button
                              key={s.value}
                              onClick={() => setStatus(row.studentId, s.value)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition border
                                ${row.status === s.value
                                  ? `${s.color} bg-current/10 border-current/30`
                                  : 'dark:text-white/30 text-slate-400 dark:border-white/10 border-slate-200 dark:hover:border-white/20 hover:border-slate-300'
                                }`}
                            >
                              {s.icon} {s.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input
                          className="input py-1.5 text-xs max-w-[200px]"
                          placeholder="Примечание..."
                          value={row.note}
                          onChange={e => setNote(row.studentId, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
