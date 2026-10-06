import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Inquiry, InquiryStatus } from '../../lib/inquiries';
import { deleteInquiry, describeError, listInquiries, setInquiryStatus } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toasts';
import { Loader, PageHeader, formatDateTime, formatRelative } from '../components/common';

type Filter = InquiryStatus | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
];

const STATUS_BADGE: Record<InquiryStatus, string> = {
  new: 'text-bg-primary',
  read: 'text-bg-secondary',
  archived: 'text-bg-dark border border-secondary',
};

function replyHref(inquiry: Inquiry): string {
  const subject = `Re: your inquiry${inquiry.service ? ` about ${inquiry.service}` : ''}`;
  const quoted = inquiry.message
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const body = `Hi ${inquiry.name.split(' ')[0]},\n\nThanks for reaching out!\n\n\n\n—\nNishan Bharati\nCo-Founder, Navya EdTech\n\n${quoted}`;
  return `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function InquiriesPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const filter = (FILTERS.some((f) => f.value === params.get('status')) ? params.get('status') : 'new') as Filter;
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Inquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    listInquiries()
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((err) => setError(describeError(err)));
  }, []);

  useEffect(load, [load]);

  const counts = useMemo(() => {
    const all = items ?? [];
    return {
      all: all.length,
      new: all.filter((i) => i.status === 'new').length,
      read: all.filter((i) => i.status === 'read').length,
      archived: all.filter((i) => i.status === 'archived').length,
    };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items ?? []).filter(
      (i) =>
        (filter === 'all' || i.status === filter) &&
        (!q || [i.name, i.email, i.service ?? '', i.message].some((v) => v.toLowerCase().includes(q))),
    );
  }, [items, filter, search]);

  const changeStatus = async (inquiry: Inquiry, status: InquiryStatus, quiet = false) => {
    setBusyId(inquiry.id);
    try {
      await setInquiryStatus(inquiry.id, status);
      setItems((all) => all?.map((i) => (i.id === inquiry.id ? { ...i, status } : i)) ?? null);
      if (!quiet) {
        toast('success', status === 'archived' ? 'Inquiry archived.' : status === 'new' ? 'Marked as unread.' : 'Marked as read.');
      }
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setBusyId(null);
    }
  };

  const toggleOpen = (inquiry: Inquiry) => {
    const opening = openId !== inquiry.id;
    setOpenId(opening ? inquiry.id : null);
    if (opening && inquiry.status === 'new') changeStatus(inquiry, 'read', true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteInquiry(toDelete.id);
      setItems((all) => all?.filter((i) => i.id !== toDelete.id) ?? null);
      toast('success', 'Inquiry deleted.');
      setToDelete(null);
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Inquiries" crumbs={[{ label: 'Home', to: '/' }, { label: 'Inquiries' }]} />

      <div className="app-content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header d-flex flex-wrap align-items-center gap-3">
              <div className="btn-group flex-wrap" role="group" aria-label="Filter inquiries">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-outline-light'}`}
                    aria-pressed={filter === f.value}
                    onClick={() => setParams(f.value === 'new' ? {} : { status: f.value }, { replace: true })}
                  >
                    {f.label}
                    <span className="badge rounded-pill text-bg-dark ms-2">{counts[f.value]}</span>
                  </button>
                ))}
              </div>
              <div className="input-group input-group-sm ms-md-auto" style={{ maxWidth: 300 }}>
                <span className="input-group-text">
                  <i className="bi bi-search" aria-hidden />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search name, email or message"
                  aria-label="Search inquiries"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-body p-0">
              {error && (
                <div className="alert alert-danger m-3 d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-octagon-fill" aria-hidden />
                  <span className="me-auto">{error}</span>
                  <button type="button" className="btn btn-sm btn-outline-light" onClick={load}>
                    Retry
                  </button>
                </div>
              )}
              {!items && !error && <Loader label="Loading inquiries…" />}
              {items && visible.length === 0 && (
                <div className="text-center py-5 px-3 text-secondary">
                  <i className="bi bi-envelope-open display-6" aria-hidden />
                  <p className="mt-3 mb-0">
                    {items.length === 0 ? 'No inquiries yet. They will appear here when someone uses the contact form.' : 'Nothing here.'}
                  </p>
                </div>
              )}

              {visible.length > 0 && (
                <ul className="list-group list-group-flush">
                  {visible.map((inquiry) => {
                    const open = openId === inquiry.id;
                    return (
                      <li key={inquiry.id} className="list-group-item bg-transparent px-0 py-0">
                        <button
                          type="button"
                          className="btn w-100 text-start rounded-0 px-4 py-3 d-flex align-items-center gap-3"
                          aria-expanded={open}
                          onClick={() => toggleOpen(inquiry)}
                        >
                          <span className="brand-monogram" aria-hidden>
                            {inquiry.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                            <span className="d-flex align-items-center gap-2">
                              <span className={inquiry.status === 'new' ? 'fw-semibold' : 'fw-normal'}>{inquiry.name}</span>
                              {inquiry.service && (
                                <span className="badge rounded-pill border border-secondary text-secondary fw-normal d-none d-md-inline">
                                  {inquiry.service}
                                </span>
                              )}
                            </span>
                            <small className="text-secondary text-truncate">
                              {inquiry.email} · {inquiry.message.replace(/\s+/g, ' ')}
                            </small>
                          </span>
                          <span className="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                            <span className={`badge rounded-pill ${STATUS_BADGE[inquiry.status]}`}>{inquiry.status}</span>
                            <small className="text-secondary text-nowrap">{formatRelative(inquiry.created_at)}</small>
                          </span>
                          <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'} text-secondary`} aria-hidden />
                        </button>

                        {open && (
                          <div className="px-4 pb-4">
                            <div className="rounded-4 border p-3 p-md-4" style={{ borderColor: 'var(--bs-border-color)' }}>
                              <dl className="row small mb-3">
                                <dt className="col-sm-3 fw-normal text-secondary">Email</dt>
                                <dd className="col-sm-9">
                                  <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                                </dd>
                                {inquiry.phone && (
                                  <>
                                    <dt className="col-sm-3 fw-normal text-secondary">Phone</dt>
                                    <dd className="col-sm-9">
                                      <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, '')}`}>{inquiry.phone}</a>
                                    </dd>
                                  </>
                                )}
                                <dt className="col-sm-3 fw-normal text-secondary">Interested in</dt>
                                <dd className="col-sm-9">{inquiry.service ?? '—'}</dd>
                                <dt className="col-sm-3 fw-normal text-secondary">Received</dt>
                                <dd className="col-sm-9 mb-0">{formatDateTime(inquiry.created_at)}</dd>
                              </dl>
                              <p className="mb-4" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                {inquiry.message}
                              </p>
                              <div className="d-flex flex-wrap gap-2">
                                <a href={replyHref(inquiry)} className="btn btn-brand btn-sm">
                                  <i className="bi bi-reply me-1" aria-hidden />
                                  Reply by email
                                </a>
                                {inquiry.phone && (
                                  <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, '')}`} className="btn btn-sm btn-outline-light">
                                    <i className="bi bi-telephone me-1" aria-hidden />
                                    Call
                                  </a>
                                )}
                                {inquiry.status !== 'new' && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light"
                                    disabled={busyId === inquiry.id}
                                    onClick={() => changeStatus(inquiry, 'new')}
                                  >
                                    <i className="bi bi-envelope me-1" aria-hidden />
                                    Mark unread
                                  </button>
                                )}
                                {inquiry.status !== 'archived' ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light"
                                    disabled={busyId === inquiry.id}
                                    onClick={() => changeStatus(inquiry, 'archived')}
                                  >
                                    <i className="bi bi-archive me-1" aria-hidden />
                                    Archive
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light"
                                    disabled={busyId === inquiry.id}
                                    onClick={() => changeStatus(inquiry, 'read')}
                                  >
                                    <i className="bi bi-arrow-counterclockwise me-1" aria-hidden />
                                    Restore
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger ms-md-auto"
                                  onClick={() => setToDelete(inquiry)}
                                >
                                  <i className="bi bi-trash me-1" aria-hidden />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete inquiry?"
        confirmLabel="Delete inquiry"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p className="mb-0">
          The inquiry from <strong>{toDelete?.name}</strong> will be permanently deleted.
        </p>
      </ConfirmModal>
    </>
  );
}
