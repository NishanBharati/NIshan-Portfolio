import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { useBodyClass } from '../components/common';

export default function LoginPage() {
  useBodyClass('login-page bg-body-secondary app-loaded');
  const { status, session, signIn, signOut } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (status === 'admin') return <Navigate to={from} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="login-box">
      <div className="login-logo mb-4 text-center">
        <span className="text-gradient">Admin</span>
        <div className="fs-6 fw-light text-uppercase-wide text-secondary mt-2">Nishan Bharati · Blog CMS</div>
      </div>

      <div className="card card-outline card-primary">
        <div className="card-body login-card-body p-4">
          <p className="login-box-msg px-0">Sign in to manage your articles</p>

          {status === 'unconfigured' && (
            <div className="alert alert-warning small" role="alert">
              <strong>Supabase isn't connected yet.</strong> Copy <code>.env.example</code> to <code>.env</code>, add your
              project URL and anon key, then restart <code>npm run dev</code>.
            </div>
          )}

          {status === 'forbidden' && (
            <div className="alert alert-warning small d-flex flex-column gap-2" role="alert">
              <span>
                <strong>{session?.user.email}</strong> is signed in but isn't an admin. Add this user to the{' '}
                <code>admin_users</code> table.
              </span>
              <button type="button" className="btn btn-sm btn-outline-light align-self-start" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger small d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-octagon-fill" aria-hidden />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate={false}>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-group mb-3">
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'unconfigured'}
              />
              <span className="input-group-text">
                <i className="bi bi-envelope" aria-hidden />
              </span>
            </div>

            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group mb-4">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'unconfigured'}
              />
              <button
                type="button"
                className="input-group-text"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden />
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-brand w-100 py-2"
              disabled={submitting || status === 'unconfigured' || status === 'loading'}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mb-0 mt-4 text-center small">
            <a href="/" className="link-secondary text-decoration-none">
              <i className="bi bi-arrow-left me-1" aria-hidden />
              Back to website
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
