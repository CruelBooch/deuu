import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** 轻量确认弹窗：跨平台统一外观，避免误操作 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel
}: Props): JSX.Element | null {
  if (!open) return null

  // 挂到 body 上，避免被带 transform 的祖先把 position: fixed 的基准改掉
  return createPortal(
    <div className="confirm-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="confirm-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}
        <div className="confirm-actions">
          <button className="confirm-btn" type="button" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`confirm-btn${danger ? ' danger' : ' primary'}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
