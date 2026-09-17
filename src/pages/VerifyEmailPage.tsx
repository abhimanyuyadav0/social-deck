import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Share2, XCircle } from 'lucide-react';
import { verifyEmail } from '@/api/services/auth';

type Status = 'loading' | 'success' | 'error';

const verifyInFlight = new Map<string, Promise<void>>();

function verifyEmailOnce(token: string): Promise<void> {
  const existing = verifyInFlight.get(token);
  if (existing) return existing;

  const promise = verifyEmail(token)
    .then(() => undefined)
    .catch((err) => {
      verifyInFlight.delete(token);
      throw err;
    });

  verifyInFlight.set(token, promise);
  return promise;
}

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token')?.trim() || '';
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(
    token ? 'Verifying your email…' : 'Missing verification token.',
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        await verifyEmailOnce(token);
        if (cancelled) return;
        setStatus('success');
        setMessage('Your email is verified. Redirecting to sign in…');
        navigate('/login', { replace: true, state: { emailVerified: true } });
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          err instanceof Error ? err.message : 'Verification failed. The link may be invalid or expired.'
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sd-bg)] p-6">
      <div className="w-full max-w-md sd-card p-8 sm:p-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <span
            className="sd-icon-badge w-10 h-10 text-white"
            style={{ background: 'var(--sd-accent-grad)', boxShadow: '0 6px 16px -6px rgba(147,51,234,0.45)' }}
          >
            <Share2 className="w-4.5 h-4.5" />
          </span>
          <span className="sd-display font-bold text-lg text-[var(--sd-ink)]">Social Deck</span>
        </div>

        {status === 'loading' && (
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        )}
        {status === 'error' && <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />}

        <h1 className="sd-display text-xl font-bold text-[var(--sd-ink)] mb-2">
          {status === 'loading' && 'Verifying email'}
          {status === 'success' && 'Email verified'}
          {status === 'error' && 'Verification failed'}
        </h1>
        <p className="text-sm text-[var(--sd-muted)] leading-relaxed mb-6">{message}</p>

        {status !== 'loading' && (
          <Link to="/login" className="sd-btn sd-btn-primary w-full py-2.5 text-sm">
            {status === 'success' ? 'Sign in' : 'Back to sign in'}
          </Link>
        )}
      </div>
    </div>
  );
}
