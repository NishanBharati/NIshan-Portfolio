import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { slugify } from '../../lib/posts';
import {
  EMPTY_IMAGE,
  hasAllImages,
  type Project,
  type ProjectImage,
  type ProjectImages,
  type ProjectImageSlot,
} from '../../lib/projects';
import {
  createProject,
  deleteProject,
  describeError,
  getProject,
  nextProjectSortOrder,
  updateProject,
  uploadProjectImage,
  type ProjectInput,
} from '../api';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toasts';
import { Loader, PageHeader, formatDateTime } from '../components/common';

type Form = {
  name: string;
  slug: string;
  category: string;
  description: string;
  live_url: string;
  images: ProjectImages;
  is_published: boolean;
  sort_order: number;
};

type Errors = Partial<Record<'name' | 'slug' | 'description' | 'live_url' | 'images', string>>;

const DESCRIPTION_MAX = 400;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const SLOTS: { key: ProjectImageSlot; label: string; hint: string }[] = [
  { key: 'tall', label: 'Large image', hint: 'Right column · usually the homepage hero' },
  { key: 'colTop', label: 'Top-left image', hint: 'Short and wide · a section screenshot' },
  { key: 'colBottom', label: 'Bottom-left image', hint: 'Medium height · another section' },
];

const POSITIONS: [string, string][] = [
  ['center', 'Center'],
  ['center top', 'Top'],
  ['center bottom', 'Bottom'],
  ['left center', 'Left'],
  ['right center', 'Right'],
  ['left top', 'Top left'],
  ['right top', 'Top right'],
];

const EMPTY_FORM: Form = {
  name: '',
  slug: '',
  category: '',
  description: '',
  live_url: '',
  images: { tall: { ...EMPTY_IMAGE }, colTop: { ...EMPTY_IMAGE }, colBottom: { ...EMPTY_IMAGE } },
  is_published: true,
  sort_order: 0,
};

function fromProject(p: Project): Form {
  const img = (slot: ProjectImageSlot): ProjectImage => ({ ...EMPTY_IMAGE, ...(p.images?.[slot] ?? {}) });
  return {
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description,
    live_url: p.live_url ?? '',
    images: { tall: img('tall'), colTop: img('colTop'), colBottom: img('colBottom') },
    is_published: p.is_published,
    sort_order: p.sort_order,
  };
}

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Give the project a name.';
  if (!SLUG_PATTERN.test(f.slug)) e.slug = 'Use lowercase letters, numbers and single hyphens only.';
  if (f.description.length > DESCRIPTION_MAX) e.description = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  if (f.live_url && !/^https?:\/\/\S+\.\S+/.test(f.live_url.trim())) e.live_url = 'Enter a full URL starting with https://';
  if (f.is_published && !hasAllImages(f.images)) e.images = 'Visible projects need all three images. Add them or hide the project.';
  return e;
}

export default function ProjectEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [saved, setSaved] = useState<Form>(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [activeSlot, setActiveSlot] = useState<ProjectImageSlot>('tall');
  const [uploadingSlot, setUploadingSlot] = useState<ProjectImageSlot | null>(null);
  const [dragSlot, setDragSlot] = useState<ProjectImageSlot | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (isNew) {
      setProject(null);
      setForm(EMPTY_FORM);
      setSaved(EMPTY_FORM);
      setSlugTouched(false);
      setLoading(false);
      // Place new projects after the existing ones.
      nextProjectSortOrder()
        .then((order) => {
          if (cancelled) return;
          setForm((f) => ({ ...f, sort_order: order }));
          setSaved((f) => ({ ...f, sort_order: order }));
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    getProject(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setLoadError('This project no longer exists.');
        } else {
          setProject(data);
          setForm(fromProject(data));
          setSaved(fromProject(data));
          setSlugTouched(true);
        }
      })
      .catch((err) => !cancelled && setLoadError(describeError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const updateImage = (slot: ProjectImageSlot, patch: Partial<ProjectImage>) => {
    setForm((f) => ({ ...f, images: { ...f.images, [slot]: { ...f.images[slot], ...patch } } }));
    setErrors((e) => ({ ...e, images: undefined }));
  };

  const onNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
    setErrors((e) => ({ ...e, name: undefined, slug: undefined }));
  };

  const save = useCallback(async () => {
    const found = validate(form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      toast('danger', 'Please fix the highlighted fields.');
      return;
    }

    const clean = (img: ProjectImage): ProjectImage => ({
      src: img.src.trim(),
      alt: img.alt.trim(),
      position: img.position || 'center',
    });
    const input: ProjectInput = {
      name: form.name.trim(),
      slug: form.slug,
      category: form.category.trim(),
      description: form.description.trim(),
      live_url: form.live_url.trim() || null,
      images: { tall: clean(form.images.tall), colTop: clean(form.images.colTop), colBottom: clean(form.images.colBottom) },
      is_published: form.is_published,
      sort_order: form.sort_order,
    };

    setSaving(true);
    try {
      const result = isNew ? await createProject(input) : await updateProject(id, input);
      const fresh = fromProject(result);
      setProject(result);
      setForm(fresh);
      setSaved(fresh);
      toast('success', isNew ? 'Project added to your portfolio.' : 'Project saved.');
      if (isNew) navigate(`/projects/${result.id}`, { replace: true });
    } catch (err) {
      const message = describeError(err);
      if ((err as { code?: string }).code === '23505') setErrors((e) => ({ ...e, slug: message }));
      toast('danger', message);
    } finally {
      setSaving(false);
    }
  }, [form, id, isNew, navigate, toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, saving]);

  const uploadTo = async (slot: ProjectImageSlot, file: File | undefined) => {
    if (!file) return;
    setActiveSlot(slot);
    setUploadingSlot(slot);
    try {
      const src = await uploadProjectImage(file);
      const current = form.images[slot];
      updateImage(slot, { src, alt: current.alt || `${form.name || 'Project'} screenshot` });
      toast('success', 'Image uploaded.');
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setUploadingSlot(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const onSlotDrop = (slot: ProjectImageSlot) => (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragSlot(null);
    uploadTo(slot, e.dataTransfer.files[0]);
  };

  const onDelete = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      await deleteProject(project);
      setSaved(form);
      toast('success', `"${project.name}" was deleted.`);
      navigate('/projects', { replace: true });
    } catch (err) {
      toast('danger', describeError(err));
      setDeleting(false);
    }
  };

  const title = isNew ? 'New project' : 'Edit project';
  const crumbs = [{ label: 'Home', to: '/' }, { label: 'Projects', to: '/projects' }, { label: title }];

  if (loading || loadError) {
    return (
      <>
        <PageHeader title={title} crumbs={crumbs} />
        <div className="app-content">
          <div className="container-fluid">
            {loading ? (
              <Loader label="Loading project…" />
            ) : (
              <div className="alert alert-danger d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-octagon-fill" aria-hidden />
                <span className="me-auto">{loadError}</span>
                <Link to="/projects" className="btn btn-sm btn-outline-light">
                  Back to projects
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  const active = form.images[activeSlot];
  const activeMeta = SLOTS.find((s) => s.key === activeSlot)!;

  const slotButton = (slot: ProjectImageSlot, height: number | string) => {
    const image = form.images[slot];
    const meta = SLOTS.find((s) => s.key === slot)!;
    return (
      <button
        type="button"
        className={`project-slot${activeSlot === slot ? ' is-active' : ''}${dragSlot === slot ? ' is-dragging' : ''}${
          image.src ? '' : ' is-empty'
        }`}
        style={{ height }}
        onClick={() => setActiveSlot(slot)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragSlot(slot);
        }}
        onDragLeave={() => setDragSlot(null)}
        onDrop={onSlotDrop(slot)}
        aria-pressed={activeSlot === slot}
        aria-label={`${meta.label}${image.src ? '' : ' (empty)'}`}
      >
        {uploadingSlot === slot ? (
          <span className="spinner-border spinner-border-sm" aria-hidden />
        ) : image.src ? (
          <img src={image.src} alt="" style={{ objectPosition: image.position || 'center' }} />
        ) : (
          <>
            <i className="bi bi-image fs-4" aria-hidden />
            <span className="small">{meta.label}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <PageHeader
        title={title}
        crumbs={crumbs}
        actions={
          <>
            {dirty && (
              <span className="badge rounded-pill text-bg-warning align-self-center">
                <i className="bi bi-dot" aria-hidden />
                Unsaved changes
              </span>
            )}
            {project?.is_published && (
              <a href="/#projects" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                <i className="bi bi-eye me-1" aria-hidden />
                View on site
              </a>
            )}
          </>
        }
      />

      <div className="app-content">
        <div className="container-fluid">
          <form
            className="row g-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="col-xl-8 d-flex flex-column gap-4">
              {/* ---------- Details ---------- */}
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title mb-0">Details</h3>
                </div>
                <div className="card-body row g-3">
                  <div className="col-md-7">
                    <label htmlFor="name" className="form-label">
                      Project name
                    </label>
                    <input
                      id="name"
                      className={`form-control form-control-lg${errors.name ? ' is-invalid' : ''}`}
                      placeholder="e.g. Kabita Studio & Store"
                      maxLength={120}
                      value={form.name}
                      onChange={(e) => onNameChange(e.target.value)}
                      autoFocus={isNew}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="col-md-5">
                    <label htmlFor="category" className="form-label">
                      Category label
                    </label>
                    <input
                      id="category"
                      className="form-control form-control-lg"
                      placeholder="e.g. Photography & E-Commerce"
                      maxLength={80}
                      value={form.category}
                      onChange={(e) => update('category', e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="slug" className="form-label">
                      Slug
                    </label>
                    <div className="input-group has-validation">
                      <input
                        id="slug"
                        className={`form-control${errors.slug ? ' is-invalid' : ''}`}
                        placeholder="kabita-studio"
                        value={form.slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                        }}
                        onBlur={() => update('slug', slugify(form.slug))}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-light"
                        title="Generate from name"
                        onClick={() => {
                          setSlugTouched(false);
                          update('slug', slugify(form.name));
                        }}
                      >
                        <i className="bi bi-arrow-repeat" aria-hidden />
                        <span className="visually-hidden">Generate slug from name</span>
                      </button>
                      {errors.slug && <div className="invalid-feedback">{errors.slug}</div>}
                    </div>
                    <div className="form-text">A unique internal ID for the project.</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="liveUrl" className="form-label">
                      Live website URL
                    </label>
                    <div className="input-group has-validation">
                      <span className="input-group-text">
                        <i className="bi bi-link-45deg" aria-hidden />
                      </span>
                      <input
                        id="liveUrl"
                        type="url"
                        className={`form-control${errors.live_url ? ' is-invalid' : ''}`}
                        placeholder="https://example.com/"
                        value={form.live_url}
                        onChange={(e) => update('live_url', e.target.value)}
                      />
                      {errors.live_url && <div className="invalid-feedback">{errors.live_url}</div>}
                    </div>
                    <div className="form-text">Powers the "Live Project" button. Leave empty to hide it.</div>
                  </div>

                  <div className="col-12">
                    <label htmlFor="description" className="form-label d-flex">
                      Short description
                      <span className={`ms-auto ${form.description.length > DESCRIPTION_MAX ? 'text-danger' : ''}`}>
                        {form.description.length}/{DESCRIPTION_MAX}
                      </span>
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className={`form-control${errors.description ? ' is-invalid' : ''}`}
                      placeholder="One or two sentences about what you built and for whom."
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                    />
                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                    <div className="form-text">The card shows the first two lines.</div>
                  </div>
                </div>
              </div>

              {/* ---------- Images ---------- */}
              <div className="card">
                <div className="card-header d-flex align-items-center">
                  <h3 className="card-title mb-0">Card images</h3>
                  <small className="ms-auto text-secondary d-none d-md-inline">Click a slot to edit · drop an image onto it to upload</small>
                </div>
                <div className="card-body">
                  {errors.images && (
                    <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                      <i className="bi bi-exclamation-octagon-fill" aria-hidden />
                      {errors.images}
                    </div>
                  )}

                  <div className="row g-4">
                    <div className="col-lg-7">
                      {/* Same 40 / 60 layout as the card on the website, so the crop preview is honest. */}
                      <div className="project-slot-grid">
                        <div className="d-flex flex-column gap-2" style={{ width: '40%' }}>
                          {slotButton('colTop', 96)}
                          {slotButton('colBottom', 140)}
                        </div>
                        <div style={{ width: '60%' }}>{slotButton('tall', '100%')}</div>
                      </div>
                    </div>

                    <div className="col-lg-5 d-flex flex-column gap-3">
                      <div>
                        <div className="fw-normal">{activeMeta.label}</div>
                        <small className="text-secondary">{activeMeta.hint}</small>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-brand"
                          onClick={() => fileInput.current?.click()}
                          disabled={uploadingSlot !== null}
                        >
                          <i className="bi bi-cloud-arrow-up me-1" aria-hidden />
                          {active.src ? 'Replace' : 'Upload'}
                        </button>
                        {active.src && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => updateImage(activeSlot, { src: '' })}
                          >
                            <i className="bi bi-x-lg me-1" aria-hidden />
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="d-none"
                        onChange={(e) => uploadTo(activeSlot, e.target.files?.[0])}
                      />

                      <div>
                        <label htmlFor="imgSrc" className="form-label">
                          Image URL
                        </label>
                        <input
                          id="imgSrc"
                          className="form-control form-control-sm"
                          placeholder="https://… or /projects/…"
                          value={active.src}
                          onChange={(e) => updateImage(activeSlot, { src: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="imgAlt" className="form-label">
                          Alt text
                        </label>
                        <input
                          id="imgAlt"
                          className="form-control form-control-sm"
                          placeholder="Describe the screenshot for screen readers"
                          maxLength={160}
                          value={active.alt}
                          onChange={(e) => updateImage(activeSlot, { alt: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="imgPos" className="form-label">
                          Focus area
                        </label>
                        <select
                          id="imgPos"
                          className="form-select form-select-sm"
                          value={active.position || 'center'}
                          onChange={(e) => updateImage(activeSlot, { position: e.target.value })}
                        >
                          {POSITIONS.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <div className="form-text">Which part of the image stays visible when it's cropped to fit.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------- Sidebar ---------- */}
            <div className="col-xl-4 d-flex flex-column gap-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title mb-0">Visibility</h3>
                </div>
                <div className="card-body d-flex flex-column gap-3">
                  <div className="form-check form-switch">
                    <input
                      id="isPublished"
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={form.is_published}
                      onChange={(e) => update('is_published', e.target.checked)}
                    />
                    <label htmlFor="isPublished" className="form-check-label">
                      Show on the website
                    </label>
                  </div>
                  <small className="text-secondary">
                    Change the order from the{' '}
                    <Link to="/projects" className="link-light">
                      Projects list
                    </Link>{' '}
                    using the arrows.
                  </small>
                  {project && (
                    <dl className="row small mb-0 text-secondary">
                      <dt className="col-5 fw-normal">Created</dt>
                      <dd className="col-7 mb-1">{formatDateTime(project.created_at)}</dd>
                      <dt className="col-5 fw-normal">Last saved</dt>
                      <dd className="col-7 mb-0">{formatDateTime(project.updated_at)}</dd>
                    </dl>
                  )}
                </div>
                <div className="card-footer">
                  <button type="submit" className="btn btn-brand w-100" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
                    {isNew ? 'Add project' : 'Save changes'}
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title mb-0">Image tips</h3>
                </div>
                <div className="card-body small text-secondary">
                  <ul className="mb-0 ps-3 d-flex flex-column gap-2">
                    <li>Use full-width desktop screenshots, about 1600px wide.</li>
                    <li>WebP or JPG keeps pages fast; max 5 MB per image.</li>
                    <li>Use "Focus area" to keep headlines visible in the tall slot.</li>
                  </ul>
                </div>
              </div>

              {project && (
                <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmDelete(true)}>
                  <i className="bi bi-trash me-1" aria-hidden />
                  Delete project
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete project?"
        confirmLabel="Delete project"
        busy={deleting}
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      >
        <p className="mb-0">
          <strong>{project?.name}</strong> will be removed from your portfolio, along with any images uploaded for it. This
          can't be undone.
        </p>
      </ConfirmModal>
    </>
  );
}
