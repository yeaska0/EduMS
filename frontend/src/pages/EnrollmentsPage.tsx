import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { enrollmentsApi, studentsApi, coursesApi } from '../api/endpoints'
import type { Enrollment, Student, Course } from '../types'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import Badge, { statusVariant } from '../components/ui/Badge'
import { useT } from '../hooks/useT'

export default function EnrollmentsPage() {
  const tFn = useT()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filterStudent, setFilterStudent] = useState('')
  const [filterCourse, setFilterCourse] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selStudent, setSelStudent] = useState('')
  const [selCourse, setSelCourse] = useState('')
  const [saving, setSaving] = useState(false)

  const [dropTarget, setDropTarget] = useState<Enrollment | null>(null)
  const [dropping, setDropping] = useState(false)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const { data } = await enrollmentsApi.list(
        p, 10,
        filterStudent ? Number(filterStudent) : undefined,
        filterCourse ? Number(filterCourse) : undefined,
      )
      setEnrollments(data.content)
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

  const handleEnroll = async () => {
    if (!selStudent || !selCourse) { toast.error(tFn('required')); return }
    setSaving(true)
    try {
      await enrollmentsApi.enroll({ studentId: Number(selStudent), courseId: Number(selCourse) })
      toast.success('Студент зачислен')
      setModalOpen(false)
      setSelStudent(''); setSelCourse('')
      load(0)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка зачисления')
    } finally { setSaving(false) }
  }

  const handleDrop = async () => {
    if (!dropTarget) return
    setDropping(true)
    try {
      await enrollmentsApi.drop(dropTarget.id)
      toast.success('Студент отчислен')
      setDropTarget(null)
      load(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка')
    } finally { setDropping(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select className="select flex-1 min-w-[160px]" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
          <option value="">Все студенты</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <select className="select flex-1 min-w-[160px]" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">Все курсы</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex-shrink-0">
          <Plus size={16} /> {tFn('enrollStudent')}
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{tFn('student')}</th>
                <th>{tFn('course')}</th>
                <th>Дата зачисления</th>
                <th>{tFn('status')}</th>
                <th>{tFn('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/30">{tFn('loading')}</td></tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <ClipboardList size={32} className="mx-auto mb-2 text-white/10" />
                    <div className="text-white/30 text-sm">{tFn('noData')}</div>
                  </td>
                </tr>
              ) : enrollments.map(e => (
                <tr key={e.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#6c63ff]/20 flex items-center justify-center text-xs font-bold text-[#6c63ff] uppercase flex-shrink-0">
                        {e.studentName?.[0]}
                      </div>
                      <span className="text-white text-sm font-medium">{e.studentName}</span>
                    </div>
                  </td>
                  <td className="text-white/60 text-sm">{e.courseName}</td>
                  <td className="text-white/50 text-sm">{e.enrolledAt ? e.enrolledAt.split('T')[0] : '—'}</td>
                  <td>
                    <Badge variant={statusVariant(e.status)}>
                      {tFn(e.status.toLowerCase() as any)}
                    </Badge>
                  </td>
                  <td>
                    {e.status === 'ACTIVE' && (
                      <button onClick={() => setDropTarget(e)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 size={14} />
                      </button>
                    )}
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

      <Modal open={modalOpen} title={tFn('enrollStudent')} onClose={() => setModalOpen(false)} maxWidth="max-w-sm">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('student')} *</label>
            <select className="select" value={selStudent} onChange={e => setSelStudent(e.target.value)}>
              <option value="">— Выбрать студента —</option>
              {students.filter(s => s.status === 'ACTIVE').map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('course')} *</label>
            <select className="select" value={selCourse} onChange={e => setSelCourse(e.target.value)}>
              <option value="">— Выбрать курс —</option>
              {courses.filter(c => c.status !== 'FULL').map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.enrolled}/{c.capacity})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={() => setModalOpen(false)} className="btn-ghost">{tFn('cancel')}</button>
          <button onClick={handleEnroll} disabled={saving} className="btn-primary">
            {saving ? '...' : tFn('enrollStudent')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!dropTarget}
        title={tFn('dropEnrollment')}
        message={tFn('dropConfirm')}
        onConfirm={handleDrop}
        onCancel={() => setDropTarget(null)}
        loading={dropping}
      />
    </div>
  )
}
