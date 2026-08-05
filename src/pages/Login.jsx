import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login as connectLogin } from '../api/macropageConnect/auth';
import { setSession as setConnectSession } from '../api/macropageConnect/session';
import './Login.css';

// The one login for the whole portal. It authenticates against the real
// Macropage Connect API (the only product with a real backend) and, on
// success, also opens the portal-wide session so Macropage and Mr Fuels
// Transact — still on mock data — are reachable without a second login.
export default function Login() {
  const { loginWithUser, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (ready && user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Enter both email and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const data = await connectLogin(trimmedEmail, password);
      setConnectSession({ accessToken: data.accessToken, user: data.user });
      loginWithUser({
        name: data.user?.name || trimmedEmail.split('@')[0].replace(/[._]/g, ' '),
        email: trimmedEmail,
        loggedInAt: new Date().toISOString(),
      });
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-brand">
        <div className="login-orb one" />
        <div className="login-orb two" />

        <div className="login-brand-mark">
          <span className="dot" />
          Control Center
        </div>

        <div className="login-brand-copy">
          <h1>One login. Every product you run.</h1>
          <p>
            Manage Macropage, Macropage Connect and Mr Fuels Transact from a
            single admin console &mdash; customers, support queries, plans
            and leads, all in one place.
          </p>

          <div className="login-gauges">
            <div className="gauge">
              <div className="gauge-ring" style={{ background: '#6366f1' }}>MP</div>
              <span className="gauge-label">Macropage</span>
            </div>
            <div className="gauge">
              <div className="gauge-ring" style={{ background: '#0d9488' }}>MC</div>
              <span className="gauge-label">Connect</span>
            </div>
            <div className="gauge">
              <div className="gauge-ring" style={{ background: '#f59e0b' }}>MF</div>
              <span className="gauge-label">Fuels Transact</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <span className="sub">Sign in to open the admin portal.</span>

          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in'}
          </button>

          <p className="login-hint">
            Sign in with your Macropage Connect account to open the admin portal.
          </p>
        </form>
      </div>
    </div>
  );
}
