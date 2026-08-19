import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from 'glintly-ui';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeTtfSsoCode, consumePostLoginRedirect } from '@/utils/ttfSso';

/** Lands here after /api/sso/authorize; exchanges the code for a real session. */
export default function SsoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const ssoError = searchParams.get('error');

    if (ssoError) {
      setError(ssoError);
      return;
    }
    if (!code || !state) {
      setError('Missing sign-in code.');
      return;
    }

    exchangeTtfSsoCode(code, state)
      .then(async ({ token }) => {
        await loginWithToken(token);
        const redirect = consumePostLoginRedirect();
        navigate(redirect || '/', { replace: true });
      })
      .catch((err: Error) => {
        setError(err.message || 'Sign-in failed. Please try again.');
      });
  }, [searchParams, loginWithToken, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--sd-bg)] px-4 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="text-sm font-semibold underline text-purple-700"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sd-bg)]">
      <Spinner size="lg" variant="cube" />
    </div>
  );
}
