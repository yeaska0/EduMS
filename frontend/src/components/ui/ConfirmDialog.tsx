import Modal from './Modal'

interface Props {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel} maxWidth="max-w-sm">
      <p className="text-white/60 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-ghost">Отмена</button>
        <button onClick={onConfirm} disabled={loading} className="btn btn-danger">
          {loading ? '...' : 'Удалить'}
        </button>
      </div>
    </Modal>
  )
}
