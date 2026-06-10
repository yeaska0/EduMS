import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { coursesApi } from '../api/endpoints'
import type { Course, CourseRequest, CourseStatus } from '../types'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import Badge, { statusVariant } from '../components/ui/Badge'
import { useT } from '../hooks/useT'

const STATUSES: CourseStatus[] = ['ACTIVE', 'INACTIVE', 'FULL']

const EMPTY: CourseRequest = {
  code: '', name: '', description: '', credits: 3,
  instructor: '', startDate: '', endDate: '', capacity: 30, status: 'ACTIVE',
}

export default function CoursesPage() {
  const tFn = useT()
  const [courses, setCourses] = useState<Course[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseRequest>(EMPTY)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async (p = 0, q = search) => {
    setLoading(true)
    try {
      const { data } = await coursesApi.list(p, 10, q || undefined)
      setCourses(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setPage(p)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load(0) }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (c: Course) => {
    setEditing(c)
    setForm({
      code: c.code, name: c.name, description: c.description ?? '',
      credits: c.credits, instructor: c.instructor ?? '',
      startDate: c.startDate ?? '', endDate: c.endDate ?? '',
      capacity: c.capacity, status: c.status,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.name) { toast.error(tFn('required')); return }
    setSaving(true)
    try {
      if (editing) {
        await coursesApi.update(editing.id, form)
        toast.success('Курс обновлён')
      } else {
        await coursesApi.create(form)
        toast.success('Курс добавлен')
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
      await coursesApi.delete(deleteTarget.id)
      toast.success('Курс удалён')
      setDeleteTarget(null)
      load(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка удаления')
    } finally { setDeleting(false) }
  }

  const f = (k: keyof CourseRequest, v: string | number) =>
    setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={e => { e.preventDefault(); load(0, search) }} className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input pl-9" placeholder={tFn('search')} value={search} onChange={e => setSearch(e.target.value)} />
        </form>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> {tFn('addCourse')}
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{tFn('code')}</th>
                <th>{tFn('name')}</th>
                <th>{tFn('instructor')}</th>
                <th>{tFn('credits')}</th>
                <th>{tFn('enrolled')} / {tFn('capacity')}</th>
                <th>{tFn('status')}</th>
                <th>{tFn('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/30">{tFn('loading')}</td></tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <BookOpen size={32} className="mx-auto mb-2 text-white/10" />
                    <div className="text-white/30 text-sm">{tFn('noData')}</div>
                  </td>
                </tr>
              ) : courses.map(c => (
                <tr key={c.id}>
                  <td>
                    <span className="font-mono text-[#6c63ff] text-xs bg-[#6c63ff]/10 px-2 py-0.5 rounded-md">
                      {c.code}
                    </span>
                  </td>
                  <td>
                    <div className="text-white font-medium text-sm">{c.name}</div>
                    {c.description && <div className="text-white/30 text-xs line-clamp-1">{c.description}</div>}
                  </td>
                  <td className="text-white/60 text-sm">{c.instructor ?? '—'}</td>
                  <td className="text-white/60 text-sm">{c.credits}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6c63ff] transition-all"
                          style={{ width: `${Math.min((c.enrolled / c.capacity) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-white/50 text-xs">{c.enrolled}/{c.capacity}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={statusVariant(c.status)}>
                      {tFn(c.status.toLowerCase() as any)}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition">
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

      <Modal open={modalOpen} title={editing ? tFn('editCourse') : tFn('addCourse')} onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('code')} *</label>
            <input className="input" value={form.code} onChange={e => f('code', e.target.value)} placeholder="CS101" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('credits')}</label>
            <input className="input" type="number" min={1} max={10} value={form.credits} onChange={e => f('credits', Number(e.target.value))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">{tFn('name')} *</label>
            <input className="input" value={form.name} onChange={e => f('name', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">Описание</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={e => f('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('instructor')}</label>
            <input className="input" value={form.instructor} onChange={e => f('instructor', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('capacity')}</label>
            <input className="input" type="number" min={1} value={form.capacity} onChange={e => f('capacity', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Дата начала</label>
            <input className="input" type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Дата конца</label>
            <input className="input" type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">{tFn('status')}</label>
            <select className="select" value={form.status} onChange={e => f('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
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
        title={tFn('deleteCourse')}
        message={tFn('deleteCourseConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
