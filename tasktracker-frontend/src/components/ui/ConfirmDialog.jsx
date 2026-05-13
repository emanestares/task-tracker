import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title = 'Are you sure?',
  description = 'This action cannot be undone.', loading = false,
  confirmLabel = 'Delete', variant = 'danger',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 pt-2 pb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#fef2f2' }}>
          <AlertTriangle size={24} color="#dc2626" />
        </div>
        <div>
          <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>
    </Modal>
  )
}
