import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Post } from '../../lib/posts';
import { deletePost, describeError, listPosts, setPostStatus } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toasts';
import { Loader, PageHeader, StatusBadge, formatDateTime, formatRelative, publicPostUrl } from '../components/common';

type Filter = 'all' | 'published' | 'draft';

export default function PostsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const filter = (['published', 'draft'].includes(params.get('status') ?? '') ? params.get('status') : 'all') as Filter;
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    listPosts()
      .then((data) => {
        setPosts(data);
        setError(null);
      })
      .catch((err) => setError(describeError(err)));
  }, []);

  useEffect(load, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (posts ?? []).filter(
      (p) =>
        (filter === 'all' || p.status === filter) &&
        (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }, [posts, filter, search]);

  const setFilter = (next: Filter) => setParams(next === 'all' ? {} : { status: next }, { replace: true });

  const toggleStatus = async (post: Post) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    setBusyId(post.id);
    try {
      const updated = await setPostStatus(post, next);
      setPosts((all) => all?.map((p) => (p.id === post.id ? updated : p)) ?? null);
      toast('success', next === 'published' ? `"${post.title}" is now live.` : `"${post.title}" moved to drafts.`);
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deletePost(toDelete);
      setPosts((all) => all?.filter((p) => p.id !== toDelete.id) ?? null);
      toast('success', `"${toDelete.title}" was deleted.`);
      setToDelete(null);
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setDeleting(false);
    }
  };

  const counts = {
    all: posts?.length ?? 0,
    published: posts?.filter((p) => p.status === 'published').length ?? 0,
    draft: posts?.filter((p) => p.status === 'draft').length ?? 0,
  };

  return (
    <>
      <PageHeader
        title="Posts"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Posts' }]}
        actions={
          <Link to="/posts/new" className="btn btn-brand">
            <i className="bi bi-plus-lg me-1" aria-hidden />
            New post
          </Link>
        }
      />

      <div className="app-content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header d-flex flex-wrap align-items-center gap-3">
              <div className="btn-group" role="group" aria-label="Filter by status">
                {(['all', 'published', 'draft'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-light'}`}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                  >
                    {f === 'all' ? 'All' : f === 'published' ? 'Published' : 'Drafts'}
                    <span className="badge rounded-pill text-bg-dark ms-2">{counts[f]}</span>
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
                  placeholder="Search title, slug or tag"
                  aria-label="Search posts"
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
              {!posts && !error && <Loader label="Loading posts…" />}
              {posts && visible.length === 0 && (
                <div className="text-center py-5 px-3 text-secondary">
                  <i className="bi bi-inbox display-6" aria-hidden />
                  <p className="mt-3 mb-0">{posts.length === 0 ? 'No posts yet.' : 'No posts match your filters.'}</p>
                </div>
              )}
              {visible.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4">Post</th>
                        <th>Status</th>
                        <th className="d-none d-lg-table-cell">Published</th>
                        <th className="d-none d-md-table-cell">Updated</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((post) => (
                        <tr key={post.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-3">
                              {post.cover_image_url ? (
                                <img src={post.cover_image_url} alt="" className="post-thumb" loading="lazy" />
                              ) : (
                                <span className="post-thumb" aria-hidden />
                              )}
                              <div style={{ minWidth: 0 }}>
                                <Link to={`/posts/${post.id}`} className="link-light text-decoration-none fw-normal d-block">
                                  {post.title}
                                </Link>
                                <small className="text-secondary">/blog/{post.slug}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <StatusBadge post={post} />
                          </td>
                          <td className="d-none d-lg-table-cell small text-secondary text-nowrap">
                            {formatDateTime(post.published_at)}
                          </td>
                          <td className="d-none d-md-table-cell small text-secondary text-nowrap">{formatRelative(post.updated_at)}</td>
                          <td className="text-end pe-4 text-nowrap">
                            <div className="btn-group btn-group-sm">
                              <Link to={`/posts/${post.id}`} className="btn btn-outline-light" title="Edit">
                                <i className="bi bi-pencil" aria-hidden />
                                <span className="visually-hidden">Edit {post.title}</span>
                              </Link>
                              {post.status === 'published' && (
                                <a
                                  href={publicPostUrl(post.slug)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-light"
                                  title="View live"
                                >
                                  <i className="bi bi-eye" aria-hidden />
                                  <span className="visually-hidden">View {post.title}</span>
                                </a>
                              )}
                              <button
                                type="button"
                                className="btn btn-outline-light"
                                onClick={() => toggleStatus(post)}
                                disabled={busyId === post.id}
                                title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                              >
                                {busyId === post.id ? (
                                  <span className="spinner-border spinner-border-sm" aria-hidden />
                                ) : (
                                  <i className={`bi ${post.status === 'published' ? 'bi-cloud-slash' : 'bi-cloud-upload'}`} aria-hidden />
                                )}
                                <span className="visually-hidden">
                                  {post.status === 'published' ? 'Unpublish' : 'Publish'} {post.title}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => setToDelete(post)}
                                title="Delete"
                              >
                                <i className="bi bi-trash" aria-hidden />
                                <span className="visually-hidden">Delete {post.title}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {posts && posts.length > 0 && (
              <div className="card-footer small text-secondary">
                Showing {visible.length} of {posts.length} posts
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete post?"
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p className="mb-0">
          <strong>{toDelete?.title}</strong> and its cover image will be permanently deleted. This can't be undone.
        </p>
      </ConfirmModal>
    </>
  );
}
