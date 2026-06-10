import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { gradesApi, studentsApi, coursesApi } from '../api/endpoints'
import type { Grade, GradeRequest, GradeType, Student, Course } from '../types'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import Badge, { statusVariant } from '../components/ui/Badge'
import { useT } from '../hooks/useT'

const TYPES: GradeType[] = ['MIDTERM', 'FINAL', 'ASSIGNMENT', 'QUIZ', 'PROJECT']

const EMPTY: GradeRequest = {
  studentId: 0, courseId: 0, score: 0, maxScore: 100,
  type: 'ASSIGNMENT', semester: '', date: '',
}

function scoreColor(score: number, max: number) {
  const pct = (score / max) * 100
  if (pct >= 85) return 'text-emerald-400'
  if (pct >= 70) return 'text-yellow-400'
  return 'text-red-400'
}

export default function GradesPage() {
  const tFn = useT()
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filterStudent, setFilterStudent] = useState('')
  const [filterCourse, setFilterCourse] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Grade | null>(null)
  const [form, setForm] = useState<GradeRequest>(EMPTY)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const { data } = await gradesApi.list(
        p, 10,
        filterStudent ? Number(filterStudent) : undefined,
        filterCourse ? Number(filterCourse) : undefined,
      )
      setGrades(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setPage(p)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }, [filterStudent, filterCourse])

  useEffect(() => { load(0) }, [filterStudent, filterCourse])
  useEffect(() => {
    studentsApi.list(0, 200).then(r => setStudents(r.data.content)).catch(() => {})
    coursesApi.list(0, 200).then(r => setCourses(r.data.content)).catch(() => {})
  }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (g: Grade) => {
    setEditing(g)
    setForm({
      studentId: g.studentId, courseId: g.courseId,
      score: g.score, maxScore: g.maxScore,
      type: g.type, semester: g.semester ?? '', date: g.date ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.studentId || !form.courseId) { toast.error(tFn('required')); return }
    setSaving(true)
    try {
      if (editing) {
        await gradesApi.update(editing.id, form)
        toast.success('Оценка обновлена')
      } else {
        await gradesApi.create(form)
        toast.success('Оценка добавлена')
      }
      setModalOpen(false)
      load(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await gradesApi.delete(deleteTarget.id)
      toast.success('Оценка удалена')
      setDeleteTarget(null)
      load(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка')
    } finally { setDeleting(false) }
  }

  const f = (k: keyof GradeRequest, v: string | number) =>
    setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select className="select flex-1 min-w-[160px]" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
          <option value="">Все студенты</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <select className="select flex-1 min-w-[160px]" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">Все курсы</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> {tFn('addGrade')}
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{tFn('student')}</th>
                <th>{tFn('course')}</th>
                <th>{tFn('type')}</th>
                <th>{tFn('score')}</th>
                <th>{tFn('semester')}</th>
                <th>{tFn('date')}</th>
                <th>{tFn('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/30">{tFn('loading')}</td></tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Award size={32} className="mx-auto mb-2 text-white/10" />
                    <div className="text-white/30 text-sm">{tFn('noData')}</div>
                  </td>
                </tr>
              ) : grades.map(g => (
                <tr key={g.id}>
                  <td className="text-white text-sm font-medium">{g.studentName}</td>
                  <td className="text-white/60 text-sm">{g.courseName}</td>
                  <td>
                    <Badge variant={statusVariant(g.type)}>{g.type}</Badge>
                  </td>
                  <td>
                    <span className={`font-semibold text-sm ${scoreColor(g.score, g.maxScore)}`}>
                      {g.score}/{g.maxScore}
                    </span>
                    <span className="text-white/30 text-xs ml-1">
                      ({Math.round((g.score / g.maxScore) * 100)}%)
                    </span>
                  </td>
                  <td className="text-white/50 text-sm">{g.semester ?? '—'}</td>
                  <td className="text-white/50 text-sm">{g.date ?? '—'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(g)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-4 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={10} onChange={p => load(p)} />
        </div>}
      </div>

      <Modal open={modalOpen} title={editing ? tFn('editGrade') : tFn('addGrade')} onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">{tFn('student')} *</label>
            <select className="select" value={form.studentId} onChange={e => f('studentId', Number(e.target.value))} disabled={!!editing}>
              <option value={0}>— Выбрать студента —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">{tFn('course')} *</label>
            <select className="select" value={form.courseId} onChange={e => f('courseId', Number(e.target.value))} disabled={!!editing}>
              <option value={0}>— Выбрать курс —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('score')}</label>
            <input className="input" type="number" min={0} max={form.maxScore} value={form.score} onChange={e => f('score', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('maxScore')}</label>
            <input className="input" type="number" min={1} value={form.maxScore} onChange={e => f('maxScore', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('type')}</label>
            <select className="select" value={form.type} onChange={e => f('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('semester')}</label>
            <input className="input" value={form.semester} onChange={e => f('semester', e.target.value)} placeholder="2024-1" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">{tFn('date')}</label>
            <input className="input" type="date" value={form.date} onChange={e => f('date', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={() => setModalOpen(false)} className="btn-ghost">{tFn('cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? '...' : tFn('save')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={tFn('deleteGrade')}
        message={tFn('deleteGradeConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
