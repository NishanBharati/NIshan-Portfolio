import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { INQUIRIES_CHANGED, countNewInquiries } from '../api';
import { useBodyClass } from '../components/common';

/** Must match AdminLTE's `sidebar-expand-lg` breakpoint. */
const DESKTOP_QUERY = '(min-width: 992px)';
const STORAGE_KEY = 'admin.sidebar.collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

const NAV = [
  { header: 'Content' },
  { to: '/', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/posts', label: 'All posts', icon: 'bi-journal-richtext', end: true },
  { to: '/posts/new', label: 'New post', icon: 'bi-plus-circle', end: true },
  { header: 'Portfolio' },
  { to: '/projects', label: 'Projects', icon: 'bi-kanban', end: true },
  { to: '/projects/new', label: 'New project', icon: 'bi-folder-plus', end: true },
] as const;

export default function AdminLayout() {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed); // desktop
  const [mobileOpen, setMobileOpen] = useState(false); // below lg
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);

  useBodyClass(
    ['layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary', 'app-loaded', collapsed && 'sidebar-collapse', mobileOpen && 'sidebar-open']
      .filter(Boolean)
      .join(' '),
  );

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Unread inquiry count for the sidebar badge: refreshed on navigation and whenever inquiries change.
  const [newInquiries, setNewInquiries] = useState(0);
  useEffect(() => {
    const refresh = () =>
      countNewInquiries()
        .then(setNewInquiries)
        .catch(() => setNewInquiries(0));
    refresh();
    window.addEventListener(INQUIRIES_CHANGED, refresh);
    return () => window.removeEventListener(INQUIRIES_CHANGED, refresh);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const toggleSidebar = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      setCollapsed((value) => {
        try {
          localStorage.setItem(STORAGE_KEY, value ? '0' : '1');
        } catch {
          /* storage unavailable: state still works for this session */
        }
        return !value;
      });
    } else {
      setMobileOpen((value) => !value);
    }
  };

  const email = session?.user.email ?? 'Admin';

  return (
    <div className="app-wrapper">
      <nav className="app-header navbar navbar-expand bg-body">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              <button type="button" className="nav-link btn btn-link" onClick={toggleSidebar} aria-label="Toggle sidebar">
                <i className="bi bi-list" aria-hidden />
              </button>
            </li>
            <li className="nav-item d-none d-md-block">
              <a href="/" target="_blank" rel="noopener noreferrer" className="nav-link">
                <i className="bi bi-box-arrow-up-right me-1" aria-hidden />
                View website
              </a>
            </li>
            <li className="nav-item d-none d-md-block">
              <a href="/blog" target="_blank" rel="noopener noreferrer" className="nav-link">
                <i className="bi bi-newspaper me-1" aria-hidden />
                View blog
              </a>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown" ref={menuRef}>
              <button
                type="button"
                className="nav-link btn btn-link d-flex align-items-center gap-2"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="brand-monogram" aria-hidden>
                  {email.charAt(0).toUpperCase()}
                </span>
                <span className="d-none d-md-inline">{email}</span>
                <i className="bi bi-chevron-down small" aria-hidden />
              </button>
              <ul className={`dropdown-menu dropdown-menu-end${menuOpen ? ' show' : ''}`} role="menu">
                <li className="dropdown-header text-uppercase-wide small">Signed in as</li>
                <li className="px-3 pb-2 small text-truncate" style={{ maxWidth: 260 }}>
                  {email}
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button type="button" className="dropdown-item text-danger" role="menuitem" onClick={() => signOut()}>
                    <i className="bi bi-box-arrow-right me-2" aria-hidden />
                    Sign out
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
        <div className="sidebar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-monogram">NB</span>
            <span className="brand-text">Nishan Admin</span>
          </Link>
        </div>
        <div className="sidebar-wrapper">
          <nav className="mt-2" aria-label="Admin">
            <ul className="nav sidebar-menu flex-column" role="menu">
              {NAV.map((item) =>
                'header' in item ? (
                  <li key={item.header} className="nav-header text-uppercase">
                    {item.header}
                  </li>
                ) : (
                  <li key={item.to} className="nav-item">
                    <NavLink to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                      <i className={`nav-icon bi ${item.icon}`} aria-hidden />
                      <p>{item.label}</p>
                    </NavLink>
                  </li>
                ),
              )}
              <li className="nav-header text-uppercase">Inbox</li>
              <li className="nav-item">
                <NavLink to="/inquiries" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <i className="nav-icon bi bi-envelope-paper" aria-hidden />
                  <p className="d-flex align-items-center w-100">
                    Inquiries
                    {newInquiries > 0 && (
                      <span className="badge rounded-pill text-bg-danger ms-auto" aria-label={`${newInquiries} new`}>
                        {newInquiries}
                      </span>
                    )}
                  </p>
                </NavLink>
              </li>
              <li className="nav-header text-uppercase">Website</li>
              <li className="nav-item">
                <a href="/blog" target="_blank" rel="noopener noreferrer" className="nav-link">
                  <i className="nav-icon bi bi-newspaper" aria-hidden />
                  <p>Public blog</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="/" target="_blank" rel="noopener noreferrer" className="nav-link">
                  <i className="nav-icon bi bi-globe2" aria-hidden />
                  <p>Portfolio</p>
                </a>
              </li>
              <li className="nav-item">
                <button type="button" className="nav-link btn btn-link text-start w-100" onClick={() => signOut()}>
                  <i className="nav-icon bi bi-box-arrow-right" aria-hidden />
                  <p>Sign out</p>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="float-end d-none d-sm-inline">Blog CMS · Supabase</div>
        &copy; {new Date().getFullYear()} Nishan Bharati · Navya EdTech
      </footer>

      {/* Tap-outside area that closes the sidebar on small screens (styled by AdminLTE). */}
      <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-hidden />
    </div>
  );
}
