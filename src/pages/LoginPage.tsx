import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthShell, AuthField } from '@/components/AuthShell';

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const verified = !!(location.state as { emailVerified?: boolean } | null)?.emailVerified;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isLoading && user) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your Social Deck account to compose, connect platforms, and run Auto."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {verified && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Email verified. You can sign in now.</span>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <AuthField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
        />
        <AuthField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full mt-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-[0.99] transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
        </button>

        <p className="text-center text-xs text-[var(--sd-muted)] pt-1">
          New to Social Deck?{' '}
          <Link to="/signup" className="text-purple-700 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
