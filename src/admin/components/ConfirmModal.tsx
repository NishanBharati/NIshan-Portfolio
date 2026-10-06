import { useEffect, useId, type ReactNode } from 'react';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onCancel();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.target === e.currentTarget && !busy && onCancel()}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2" id={titleId}>
                <i className="bi bi-exclamation-triangle-fill text-danger" aria-hidden />
                {title}
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} disabled={busy} />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-light" onClick={onCancel} disabled={busy} autoFocus>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
                {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
