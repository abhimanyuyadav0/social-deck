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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[var(--sd-line)] shadow-sm p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </span>
          <span className="font-semibold text-gray-900">Social Deck</span>
        </div>

        {status === 'loading' && (
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        )}
        {status === 'error' && <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />}

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {status === 'loading' && 'Verifying email'}
          {status === 'success' && 'Email verified'}
          {status === 'error' && 'Verification failed'}
        </h1>
        <p className="text-sm text-[var(--sd-muted)] leading-relaxed mb-6">{message}</p>

        {status !== 'loading' && (
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm"
          >
            {status === 'success' ? 'Sign in' : 'Back to sign in'}
          </Link>
        )}
      </div>
    </div>
  );
}
