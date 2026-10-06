import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../../lib/projects';
import { deleteProject, describeError, listProjects, saveProjectOrder, updateProject } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toasts';
import { Loader, PageHeader, formatRelative } from '../components/common';

export default function ProjectsPage() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    listProjects()
      .then((data) => {
        setProjects(data);
        setError(null);
      })
      .catch((err) => setError(describeError(err)));
  }, []);

  useEffect(load, [load]);

  const move = async (index: number, delta: -1 | 1) => {
    if (!projects) return;
    const target = index + delta;
    if (target < 0 || target >= projects.length) return;
    const reordered = [...projects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const previous = projects;
    setProjects(reordered); // optimistic
    setBusy(true);
    try {
      setProjects(await saveProjectOrder(reordered));
    } catch (err) {
      setProjects(previous);
      toast('danger', describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleVisibility = async (project: Project) => {
    setBusy(true);
    try {
      const updated = await updateProject(project.id, { is_published: !project.is_published });
      setProjects((all) => all?.map((p) => (p.id === project.id ? updated : p)) ?? null);
      toast('success', updated.is_published ? `"${project.name}" is now visible.` : `"${project.name}" is now hidden.`);
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteProject(toDelete);
      setProjects((all) => all?.filter((p) => p.id !== toDelete.id) ?? null);
      toast('success', `"${toDelete.name}" was deleted.`);
      setToDelete(null);
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Projects"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Projects' }]}
        actions={
          <Link to="/projects/new" className="btn btn-brand">
            <i className="bi bi-plus-lg me-1" aria-hidden />
            New project
          </Link>
        }
      />

      <div className="app-content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <h3 className="card-title mb-0">Portfolio projects</h3>
              <small className="ms-auto text-secondary d-none d-sm-inline">Shown on the home page in this order</small>
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
              {!projects && !error && <Loader label="Loading projects…" />}
              {projects?.length === 0 && (
                <div className="text-center py-5 px-3">
                  <i className="bi bi-kanban display-6 text-secondary" aria-hidden />
                  <p className="mt-3 mb-3 text-secondary">No projects yet.</p>
                  <Link to="/projects/new" className="btn btn-brand">
                    Add your first project
                  </Link>
                </div>
              )}
              {projects && projects.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4" style={{ width: 90 }}>
                          Order
                        </th>
                        <th>Project</th>
                        <th className="d-none d-lg-table-cell">Category</th>
                        <th>Visibility</th>
                        <th className="d-none d-md-table-cell">Updated</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, i) => (
                        <tr key={project.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-1">
                              <span className="text-secondary small me-1" style={{ width: 18 }}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div className="btn-group-vertical btn-group-sm">
                                <button
                                  type="button"
                                  className="btn btn-outline-light py-0"
                                  onClick={() => move(i, -1)}
                                  disabled={busy || i === 0}
                                  aria-label={`Move ${project.name} up`}
                                >
                                  <i className="bi bi-chevron-up" aria-hidden />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-light py-0"
                                  onClick={() => move(i, 1)}
                                  disabled={busy || i === projects.length - 1}
                                  aria-label={`Move ${project.name} down`}
                                >
                                  <i className="bi bi-chevron-down" aria-hidden />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              {project.images?.tall?.src ? (
                                <img src={project.images.tall.src} alt="" className="post-thumb" loading="lazy" />
                              ) : (
                                <span className="post-thumb" aria-hidden />
                              )}
                              <div style={{ minWidth: 0 }}>
                                <Link to={`/projects/${project.id}`} className="link-light text-decoration-none fw-normal d-block">
                                  {project.name}
                                </Link>
                                {project.live_url && (
                                  <small className="text-secondary text-truncate d-block" style={{ maxWidth: 260 }}>
                                    {project.live_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="d-none d-lg-table-cell small text-secondary">{project.category || '—'}</td>
                          <td>
                            {project.is_published ? (
                              <span className="badge rounded-pill text-bg-success">Visible</span>
                            ) : (
                              <span className="badge rounded-pill text-bg-secondary">Hidden</span>
                            )}
                          </td>
                          <td className="d-none d-md-table-cell small text-secondary text-nowrap">{formatRelative(project.updated_at)}</td>
                          <td className="text-end pe-4 text-nowrap">
                            <div className="btn-group btn-group-sm">
                              <Link to={`/projects/${project.id}`} className="btn btn-outline-light" title="Edit">
                                <i className="bi bi-pencil" aria-hidden />
                                <span className="visually-hidden">Edit {project.name}</span>
                              </Link>
                              {project.live_url && (
                                <a
                                  href={project.live_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-light"
                                  title="Open live site"
                                >
                                  <i className="bi bi-box-arrow-up-right" aria-hidden />
                                  <span className="visually-hidden">Open {project.name} live site</span>
                                </a>
                              )}
                              <button
                                type="button"
                                className="btn btn-outline-light"
                                onClick={() => toggleVisibility(project)}
                                disabled={busy}
                                title={project.is_published ? 'Hide from website' : 'Show on website'}
                              >
                                <i className={`bi ${project.is_published ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden />
                                <span className="visually-hidden">
                                  {project.is_published ? 'Hide' : 'Show'} {project.name}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => setToDelete(project)}
                                title="Delete"
                              >
                                <i className="bi bi-trash" aria-hidden />
                                <span className="visually-hidden">Delete {project.name}</span>
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
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete project?"
        confirmLabel="Delete project"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p className="mb-0">
          <strong>{toDelete?.name}</strong> will be removed from your portfolio, along with any images uploaded for it. This
          can't be undone.
        </p>
      </ConfirmModal>
    </>
  );
}
