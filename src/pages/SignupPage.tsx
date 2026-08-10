import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'glintly-ui';
import { register } from '@/api/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { AuthShell, AuthField } from '@/components/AuthShell';

export default function SignupPage() {
  const { user, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!isLoading && user) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setDone(true);
      toast.success('Check your email to verify your account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={done ? 'Check your inbox' : 'Create your account'}
      subtitle={
        done
          ? 'Confirm your email to unlock Social Deck.'
          : 'Standalone from Community and HRMS — every user signs up here, including existing TTF accounts.'
      }
    >
      {done ? (
        <div className="text-center space-y-4 py-1">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--sd-muted)] leading-relaxed">
              We sent a verification link to{' '}
              <strong className="text-[var(--sd-ink)]">{email}</strong>. Open it, then come back to
              sign in.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition shadow-md shadow-purple-600/20"
          >
            Go to sign in
          </Link>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="text-xs text-purple-700 font-medium hover:underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5 text-xs text-rose-700">
              {error}
            </div>
          )}

          <AuthField
            label="Name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={setName}
            placeholder="How should we greet you?"
          />
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
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            hint="Min 6 characters"
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-[0.99] transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
          </button>

          <p className="text-center text-xs text-[var(--sd-muted)] pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
