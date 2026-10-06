import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../lib/posts';
import { countNewInquiries, describeError, listPosts } from '../api';
import { Loader, PageHeader, StatusBadge, formatRelative, isScheduled } from '../components/common';

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [newInquiries, setNewInquiries] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPosts()
      .then(setPosts)
      .catch((err) => setError(describeError(err)));
    countNewInquiries()
      .then(setNewInquiries)
      .catch(() => setNewInquiries(0));
  }, []);

  const published = posts?.filter((p) => p.status === 'published' && !isScheduled(p)).length ?? 0;
  const drafts = posts?.filter((p) => p.status === 'draft').length ?? 0;

  const boxes = [
    { label: 'Total posts', value: posts?.length, icon: 'bi-journal-richtext', className: 'brand-box', to: '/posts', cta: 'View posts' },
    {
      label: 'Published',
      value: posts && published,
      icon: 'bi-broadcast',
      className: 'text-bg-success',
      to: '/posts?status=published',
      cta: 'View posts',
    },
    {
      label: 'Drafts',
      value: posts && drafts,
      icon: 'bi-pencil-square',
      className: 'text-bg-warning',
      to: '/posts?status=draft',
      cta: 'View posts',
    },
    {
      label: 'New inquiries',
      value: newInquiries ?? undefined,
      icon: 'bi-envelope-paper',
      className: 'text-bg-info',
      to: '/inquiries',
      cta: 'Open inbox',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Dashboard' }]}
        actions={
          <Link to="/posts/new" className="btn btn-brand">
            <i className="bi bi-plus-lg me-1" aria-hidden />
            New post
          </Link>
        }
      />

      <div className="app-content">
        <div className="container-fluid">
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-octagon-fill me-2" aria-hidden />
              {error}
            </div>
          )}

          <div className="row">
            {boxes.map((box) => (
              <div key={box.label} className="col-lg-3 col-6">
                <div className={`small-box ${box.className}`}>
                  <div className="inner">
                    <h3>{box.value ?? '–'}</h3>
                    <p className="text-uppercase-wide small mb-0">{box.label}</p>
                  </div>
                  <i className={`small-box-icon bi ${box.icon}`} aria-hidden />
                  <Link to={box.to} className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                    {box.cta} <i className="bi bi-arrow-right-short" aria-hidden />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card h-100">
                <div className="card-header d-flex align-items-center">
                  <h3 className="card-title mb-0">Recently updated</h3>
                  <Link to="/posts" className="btn btn-sm btn-outline-light ms-auto">
                    All posts
                  </Link>
                </div>
                <div className="card-body p-0">
                  {!posts && !error && <Loader />}
                  {posts?.length === 0 && (
                    <div className="text-center py-5 px-3">
                      <i className="bi bi-journal-plus display-6 text-secondary" aria-hidden />
                      <p className="mt-3 mb-3 text-secondary">You haven't written anything yet.</p>
                      <Link to="/posts/new" className="btn btn-brand">
                        Write your first post
                      </Link>
                    </div>
                  )}
                  {posts && posts.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead>
                          <tr>
                            <th className="ps-4">Title</th>
                            <th>Status</th>
                            <th className="text-end pe-4">Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.slice(0, 6).map((post) => (
                            <tr key={post.id}>
                              <td className="ps-4">
                                <Link to={`/posts/${post.id}`} className="link-light text-decoration-none fw-normal">
                                  {post.title}
                                </Link>
                              </td>
                              <td>
                                <StatusBadge post={post} />
                              </td>
                              <td className="text-end pe-4 text-secondary small text-nowrap">{formatRelative(post.updated_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4 d-flex flex-column gap-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title mb-0">Quick actions</h3>
                </div>
                <div className="card-body d-grid gap-2">
                  <Link to="/posts/new" className="btn btn-brand">
                    <i className="bi bi-pencil me-1" aria-hidden /> Write a new post
                  </Link>
                  <Link to="/posts?status=draft" className="btn btn-outline-light">
                    <i className="bi bi-pencil-square me-1" aria-hidden /> Continue a draft
                  </Link>
                  <Link to="/projects/new" className="btn btn-outline-light">
                    <i className="bi bi-folder-plus me-1" aria-hidden /> Add a project
                  </Link>
                  <Link to="/inquiries" className="btn btn-outline-light">
                    <i className="bi bi-envelope-paper me-1" aria-hidden /> Read inquiries
                  </Link>
                  <a href="/blog" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                    <i className="bi bi-box-arrow-up-right me-1" aria-hidden /> Open public blog
                  </a>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title mb-0">Writing tips</h3>
                </div>
                <div className="card-body small text-secondary">
                  <ul className="mb-0 ps-3 d-flex flex-column gap-2">
                    <li>Keep the excerpt under 160 characters: it doubles as the search description.</li>
                    <li>Use a 16:10 cover image of at least 1600px wide for crisp cards.</li>
                    <li>Set a future publish date to schedule a post.</li>
                    <li>
                      Press <kbd>Ctrl</kbd> + <kbd>S</kbd> in the editor to save.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
