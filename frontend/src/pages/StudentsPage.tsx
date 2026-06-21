import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, GraduationCap, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsApi, coursesApi } from '../api/endpoints'
import type { Student, StudentRequest, StudentStatus, Course } from '../types'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import Badge, { statusVariant } from '../components/ui/Badge'
import { useT } from '../hooks/useT'

const STATUSES: StudentStatus[] = ['ACTIVE', 'INACTIVE', 'GRADUATED']

const EMPTY: StudentRequest = {
  firstName: '', lastName: '', email: '', phone: '',
  major: '', enrollmentDate: '', dateOfBirth: '', status: 'ACTIVE',
}

export default function StudentsPage() {
  const tFn = useT()
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<StudentRequest>(EMPTY)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async (p = 0, q = search) => {
    setLoading(true)
    try {
      const { data } = await studentsApi.list(p, 10, q || undefined)
      setStudents(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setPage(p)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load(0) }, [])
  useEffect(() => {
    coursesApi.list(0, 100).then(r => setCourses(r.data.content)).catch(() => {})
  }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (s: Student) => {
    setEditing(s)
    setForm({
      firstName: s.firstName, lastName: s.lastName, email: s.email,
      phone: s.phone ?? '', major: s.major ?? '',
      enrollmentDate: s.enrollmentDate ?? '', dateOfBirth: s.dateOfBirth ?? '',
      status: s.status,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error(tFn('required')); return
    }
    setSaving(true)
    try {
      if (editing) {
        await studentsApi.update(editing.id, form)
        toast.success('Студент обновлён')
      } else {
        await studentsApi.create(form)
        toast.success('Студент добавлен')
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
      await studentsApi.delete(deleteTarget.id)
      toast.success('Студент удалён')
      setDeleteTarget(null)
      load(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка удаления')
    } finally { setDeleting(false) }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(0, search)
  }

  const exportCSV = async () => {
    try {
      const { data } = await studentsApi.list(0, 10000)
      const rows = [
        ['ID', 'Имя', 'Фамилия', 'Email', 'Телефон', 'Специальность', 'GPA', 'Статус'],
        ...data.content.map(s => [s.id, s.firstName, s.lastName, s.email, s.phone ?? '', s.major ?? '', s.gpa, s.status])
      ]
      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Ошибка экспорта') }
  }

  const f = (k: keyof StudentRequest, v: string) =>
    setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input pl-9"
            placeholder={tFn('search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
        <button onClick={exportCSV} className="btn-ghost flex-shrink-0">
          <Download size={16} /> CSV
        </button>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> {tFn('addStudent')}
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{tFn('firstName')} {tFn('lastName')}</th>
                <th>{tFn('email')}</th>
                <th>{tFn('major')}</th>
                <th>{tFn('gpa')}</th>
                <th>{tFn('status')}</th>
                <th>{tFn('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/30">{tFn('loading')}</td></tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <GraduationCap size={32} className="mx-auto mb-2 text-white/10" />
                    <div className="text-white/30 text-sm">{tFn('noData')}</div>
                  </td>
                </tr>
              ) : students.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-white/30 text-xs">{page * 10 + i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#6c63ff]/20 flex items-center justify-center text-xs font-bold text-[#6c63ff] flex-shrink-0 uppercase">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{s.firstName} {s.lastName}</div>
                        {s.phone && <div className="text-white/30 text-xs">{s.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="text-white/60 text-sm">{s.email}</td>
                  <td className="text-white/60 text-sm">{s.major ?? '—'}</td>
                  <td>
                    <span className={`font-semibold text-sm ${s.gpa >= 3.5 ? 'text-emerald-400' : s.gpa >= 2.5 ? 'text-yellow-400' : 'text-white/60'}`}>
                      {s.gpa?.toFixed(2) ?? '0.00'}
                    </span>
                  </td>
                  <td>
                    <Badge variant={statusVariant(s.status)}>
                      {tFn(s.status.toLowerCase() as any)}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition">
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

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} title={editing ? tFn('editStudent') : tFn('addStudent')} onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('firstName')} *</label>
            <input className="input" value={form.firstName} onChange={e => f('firstName', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('lastName')} *</label>
            <input className="input" value={form.lastName} onChange={e => f('lastName', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-white/40 mb-1">{tFn('email')} *</label>
            <input className="input" type="email" value={form.email} onChange={e => f('email', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('phone')}</label>
            <input className="input" value={form.phone} onChange={e => f('phone', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('major')}</label>
            <input className="input" value={form.major} onChange={e => f('major', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('dateOfBirth')}</label>
            <input className="input" type="date" value={form.dateOfBirth} onChange={e => f('dateOfBirth', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{tFn('enrollmentDate')}</label>
            <input className="input" type="date" value={form.enrollmentDate} onChange={e => f('enrollmentDate', e.target.value)} />
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
        title={tFn('deleteStudent')}
        message={tFn('deleteStudentConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
