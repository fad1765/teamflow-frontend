import useLanguage from "../components/useLanguage";
import "../styles/modal.css";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  danger = false,
}) {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="confirm-modal-close"
            onClick={onCancel}
            aria-label={t.modal.close}
          >
            ×
          </button>
        </div>

        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
          >
            {cancelText || t.common.cancel}
          </button>
          <button
            type="button"
            className={`confirm-modal-confirm ${
              danger ? "confirm-modal-confirm--danger" : ""
            }`}
            onClick={onConfirm}
          >
            {confirmText || t.modal.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
