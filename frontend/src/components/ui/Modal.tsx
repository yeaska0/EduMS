import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({ open, title, onClose, children, maxWidth = 'max-w-lg' }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box w-full ${maxWidth}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
