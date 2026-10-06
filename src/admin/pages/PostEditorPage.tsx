import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { estimateReadingMinutes, slugify, type Post, type PostStatus } from '../../lib/posts';
import { createPost, deletePost, describeError, getPost, updatePost, uploadCoverImage, type PostInput } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toasts';
import { Loader, PageHeader, StatusBadge, formatDateTime, publicPostUrl } from '../components/common';

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  status: PostStatus;
  /** Local "YYYY-MM-DDTHH:mm" value for <input type="datetime-local">, '' when unset. */
  publishAt: string;
};

type Errors = Partial<Record<'title' | 'slug' | 'excerpt' | 'content', string>>;

const EMPTY_FORM: Form = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  tags: [],
  status: 'draft',
  publishAt: '',
};

const EXCERPT_MAX = 300;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function fromPost(post: Post): Form {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.cover_image_url ?? '',
    tags: post.tags,
    status: post.status,
    publishAt: toLocalInput(post.published_at),
  };
}

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.title.trim()) errors.title = 'Give your post a title.';
  else if (form.title.length > 200) errors.title = 'Keep the title under 200 characters.';
  if (!SLUG_PATTERN.test(form.slug)) errors.slug = 'Use lowercase letters, numbers and single hyphens only.';
  if (form.excerpt.length > EXCERPT_MAX) errors.excerpt = `Keep the excerpt under ${EXCERPT_MAX} characters.`;
  if (form.status === 'published' && !form.content.trim()) errors.content = 'Published posts need some content.';
  return errors;
}

export default function PostEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [saved, setSaved] = useState<Form>(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [tagDraft, setTagDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Load an existing post, or reset when switching to "new".
  useEffect(() => {
    if (isNew) {
      setPost(null);
      setForm(EMPTY_FORM);
      setSaved(EMPTY_FORM);
      setSlugTouched(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPost(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setLoadError('This post no longer exists.');
        } else {
          setPost(data);
          setForm(fromPost(data));
          setSaved(fromPost(data));
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

  const onTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
    setErrors((e) => ({ ...e, title: undefined, slug: undefined }));
  };

  const save = useCallback(
    async (status: PostStatus = form.status) => {
      const next = { ...form, status };
      const found = validate(next);
      setErrors(found);
      if (Object.values(found).some(Boolean)) {
        toast('danger', 'Please fix the highlighted fields.');
        return;
      }

      const publishedAt = next.publishAt
        ? new Date(next.publishAt).toISOString()
        : status === 'published'
          ? new Date().toISOString()
          : null;

      const input: PostInput = {
        title: next.title.trim(),
        slug: next.slug,
        excerpt: next.excerpt.trim(),
        content: next.content,
        cover_image_url: next.cover_image_url.trim() || null,
        tags: next.tags,
        status,
        published_at: publishedAt,
        reading_minutes: estimateReadingMinutes(next.content),
      };

      setSaving(true);
      try {
        const result = isNew ? await createPost(input) : await updatePost(id, input);
        const fresh = fromPost(result);
        setPost(result);
        setForm(fresh);
        setSaved(fresh);
        toast(
          'success',
          status === 'published'
            ? post?.status === 'published'
              ? 'Changes are live.'
              : 'Post published.'
            : post?.status === 'published'
              ? 'Post moved to drafts.'
              : 'Draft saved.',
        );
        if (isNew) navigate(`/posts/${result.id}`, { replace: true });
      } catch (err) {
        const message = describeError(err);
        if ((err as { code?: string }).code === '23505') setErrors((e) => ({ ...e, slug: message }));
        toast('danger', message);
      } finally {
        setSaving(false);
      }
    },
    [form, id, isNew, navigate, post?.status, toast],
  );

  // Ctrl/Cmd + S saves without changing the status.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, saving]);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!tag || form.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    update('tags', [...form.tags, tag]);
  };

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagDraft);
      setTagDraft('');
    } else if (e.key === 'Backspace' && !tagDraft && form.tags.length) {
      update('tags', form.tags.slice(0, -1));
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      update('cover_image_url', await uploadCoverImage(file));
      toast('success', 'Cover image uploaded.');
    } catch (err) {
      toast('danger', describeError(err));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onDelete = async () => {
    if (!post) return;
    setDeleting(true);
    try {
      await deletePost(post);
      setSaved(form); // nothing left to warn about
      toast('success', `"${post.title}" was deleted.`);
      navigate('/posts', { replace: true });
    } catch (err) {
      toast('danger', describeError(err));
      setDeleting(false);
    }
  };

  const words = form.content.trim().split(/\s+/).filter(Boolean).length;
  const title = isNew ? 'New post' : 'Edit post';
  const crumbs = [{ label: 'Home', to: '/' }, { label: 'Posts', to: '/posts' }, { label: title }];
  const isPublished = post?.status === 'published';

  if (loading) {
    return (
      <>
        <PageHeader title={title} crumbs={crumbs} />
        <div className="app-content">
          <Loader label="Loading post…" />
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <PageHeader title={title} crumbs={crumbs} />
        <div className="app-content">
          <div className="container-fluid">
            <div className="alert alert-danger d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-octagon-fill" aria-hidden />
              <span className="me-auto">{loadError}</span>
              <Link to="/posts" className="btn btn-sm btn-outline-light">
                Back to posts
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

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
            {isPublished && (
              <a href={publicPostUrl(post.slug)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                <i className="bi bi-eye me-1" aria-hidden />
                View live
              </a>
            )}
          </>
        }
      />

      <div className="app-content">
        <div className="container-fluid">
          <form
            className="row g-4"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            noValidate
          >
            {/* ---------- Main column ---------- */}
            <div className="col-xl-8">
              <div className="card card-primary card-outline">
                <div className="card-body d-flex flex-column gap-3">
                  <div>
                    <label htmlFor="title" className="form-label">
                      Title
                    </label>
                    <input
                      id="title"
                      className={`form-control form-control-lg${errors.title ? ' is-invalid' : ''}`}
                      placeholder="An attention-grabbing headline"
                      value={form.title}
                      onChange={(e) => onTitleChange(e.target.value)}
                      maxLength={200}
                      autoFocus={isNew}
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>

                  <div>
                    <label htmlFor="slug" className="form-label">
                      URL slug
                    </label>
                    <div className="input-group has-validation">
                      <span className="input-group-text text-secondary">/blog/</span>
                      <input
                        id="slug"
                        className={`form-control${errors.slug ? ' is-invalid' : ''}`}
                        placeholder="my-first-post"
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
                        title="Generate from title"
                        onClick={() => {
                          setSlugTouched(false);
                          update('slug', slugify(form.title));
                        }}
                      >
                        <i className="bi bi-arrow-repeat" aria-hidden />
                        <span className="visually-hidden">Generate slug from title</span>
                      </button>
                      {errors.slug && <div className="invalid-feedback">{errors.slug}</div>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="excerpt" className="form-label d-flex">
                      Excerpt
                      <span className={`ms-auto ${form.excerpt.length > EXCERPT_MAX ? 'text-danger' : ''}`}>
                        {form.excerpt.length}/{EXCERPT_MAX}
                      </span>
                    </label>
                    <textarea
                      id="excerpt"
                      className={`form-control${errors.excerpt ? ' is-invalid' : ''}`}
                      rows={3}
                      placeholder="A one or two sentence summary shown on cards and in search results."
                      value={form.excerpt}
                      onChange={(e) => update('excerpt', e.target.value)}
                    />
                    {errors.excerpt && <div className="invalid-feedback">{errors.excerpt}</div>}
                  </div>
                </div>
              </div>

              <div className="card mt-4">
                <div className="card-header d-flex align-items-center flex-wrap gap-2">
                  <ul className="nav nav-pills nav-sm" role="tablist">
                    {(['write', 'preview'] as const).map((t) => (
                      <li className="nav-item" key={t} role="presentation">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={tab === t}
                          className={`nav-link py-1 px-3 rounded-pill${tab === t ? ' active' : ''}`}
                          onClick={() => setTab(t)}
                        >
                          <i className={`bi ${t === 'write' ? 'bi-markdown' : 'bi-eye'} me-1`} aria-hidden />
                          {t === 'write' ? 'Write' : 'Preview'}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <small className="ms-auto text-secondary">
                    {words} words · {estimateReadingMinutes(form.content)} min read
                  </small>
                </div>
                <div className="card-body">
                  {tab === 'write' ? (
                    <>
                      <textarea
                        aria-label="Content (Markdown)"
                        className={`form-control editor-textarea${errors.content ? ' is-invalid' : ''}`}
                        placeholder={'## Introduction\n\nStart writing in Markdown…'}
                        value={form.content}
                        onChange={(e) => update('content', e.target.value)}
                      />
                      {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                      <p className="form-text mb-0 mt-2">
                        Markdown supported: <code>## Heading</code>, <code>**bold**</code>, <code>- list</code>,{' '}
                        <code>[link](https://…)</code>, <code>![image](https://…)</code>, <code>```code```</code>, tables.
                      </p>
                    </>
                  ) : (
                    <div className="markdown-preview">
                      {form.content.trim() ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                      ) : (
                        <p className="text-secondary">Nothing to preview yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ---------- Sidebar column ---------- */}
            <div className="col-xl-4 d-flex flex-column gap-4">
              <div className="card">
                <div className="card-header d-flex align-items-center">
                  <h3 className="card-title mb-0">Publish</h3>
                  <span className="ms-auto">{post && <StatusBadge post={post} />}</span>
                </div>
                <div className="card-body d-flex flex-column gap-3">
                  <div>
                    <label htmlFor="publishAt" className="form-label">
                      Publish date
                    </label>
                    <input
                      id="publishAt"
                      type="datetime-local"
                      className="form-control"
                      value={form.publishAt}
                      onChange={(e) => update('publishAt', e.target.value)}
                    />
                    <div className="form-text">Leave empty to publish immediately. A future date schedules the post.</div>
                  </div>

                  {post && (
                    <dl className="row small mb-0 text-secondary">
                      <dt className="col-5 fw-normal">Created</dt>
                      <dd className="col-7 mb-1">{formatDateTime(post.created_at)}</dd>
                      <dt className="col-5 fw-normal">Last saved</dt>
                      <dd className="col-7 mb-0">{formatDateTime(post.updated_at)}</dd>
                    </dl>
                  )}
                </div>
                <div className="card-footer d-flex flex-wrap gap-2">
                  {isPublished ? (
                    <>
                      <button type="button" className="btn btn-brand flex-grow-1" disabled={saving} onClick={() => save('published')}>
                        {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
                        Update
                      </button>
                      <button type="button" className="btn btn-outline-light" disabled={saving} onClick={() => save('draft')}>
                        Unpublish
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-outline-light" disabled={saving} onClick={() => save('draft')}>
                        Save draft
                      </button>
                      <button type="button" className="btn btn-brand flex-grow-1" disabled={saving} onClick={() => save('published')}>
                        {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
                        {form.publishAt && new Date(form.publishAt) > new Date() ? 'Schedule' : 'Publish'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title mb-0">Cover image</h3>
                </div>
                <div className="card-body d-flex flex-column gap-3">
                  {form.cover_image_url ? (
                    <div className="position-relative">
                      <img src={form.cover_image_url} alt="Cover preview" className="cover-preview" />
                      <div className="d-flex gap-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={() => fileInput.current?.click()}
                          disabled={uploading}
                        >
                          <i className="bi bi-arrow-repeat me-1" aria-hidden />
                          Replace
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => update('cover_image_url', '')}>
                          <i className="bi bi-x-lg me-1" aria-hidden />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`cover-dropzone${dragging ? ' is-dragging' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInput.current?.click()}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border" aria-hidden />
                          <span className="small">Uploading…</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-arrow-up fs-2" aria-hidden />
                          <span className="small">Drop an image or click to upload</span>
                          <span className="small opacity-75">JPG, PNG, WebP · max 5 MB</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="d-none"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <div>
                    <label htmlFor="coverUrl" className="form-label">
                      Or image URL
                    </label>
                    <input
                      id="coverUrl"
                      type="url"
                      className="form-control form-control-sm"
                      placeholder="https://…"
                      value={form.cover_image_url}
                      onChange={(e) => update('cover_image_url', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title mb-0">Tags</h3>
                </div>
                <div className="card-body">
                  {form.tags.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {form.tags.map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                          <button
                            type="button"
                            aria-label={`Remove tag ${tag}`}
                            onClick={() => update('tags', form.tags.filter((t) => t !== tag))}
                          >
                            <i className="bi bi-x" aria-hidden />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    aria-label="Add a tag"
                    className="form-control form-control-sm"
                    placeholder="Type a tag and press Enter"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={onTagKeyDown}
                    onBlur={() => {
                      addTag(tagDraft);
                      setTagDraft('');
                    }}
                  />
                </div>
              </div>

              {post && (
                <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmDelete(true)}>
                  <i className="bi bi-trash me-1" aria-hidden />
                  Delete post
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete post?"
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      >
        <p className="mb-0">
          <strong>{post?.title}</strong> and its cover image will be permanently deleted. This can't be undone.
        </p>
      </ConfirmModal>
    </>
  );
}
