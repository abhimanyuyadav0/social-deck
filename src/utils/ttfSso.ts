// "Sign in with TTF" — starts the central OAuth2/PKCE login at master-backend.
// See master-backend/docs/sso-integration.md for the full flow.

export const TTF_SSO_CLIENT_ID = 'social-deck';
export const TTF_SSO_CALLBACK_PATH = '/auth/ttf/callback';

const PKCE_VERIFIER_KEY = 'ttf_sso_pkce_verifier';
const PKCE_STATE_KEY = 'ttf_sso_pkce_state';

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  arr.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Resolve the master-backend origin from the app's own API base URL (which already includes a trailing /api/). */
export function ssoAuthorizeUrl(): URL {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://api.timetofuture.com').replace(
    /\/api\/?$/,
    ''
  );
  return new URL('/api/sso/authorize', apiBase);
}

export function ssoTokenUrl(): string {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://api.timetofuture.com').replace(
    /\/api\/?$/,
    ''
  );
  return new URL('/api/sso/token', apiBase).toString();
}

function callbackRedirectUri(): string {
  return `${window.location.origin}${TTF_SSO_CALLBACK_PATH}`;
}

/** Redirects the browser into the central login (or straight back if already signed in elsewhere). */
export async function startTtfSignIn(afterLoginRedirect?: string): Promise<void> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  );
  const state = base64url(crypto.getRandomValues(new Uint8Array(16)));

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(PKCE_STATE_KEY, state);
  if (afterLoginRedirect) sessionStorage.setItem('ttf_sso_post_login_redirect', afterLoginRedirect);

  const url = ssoAuthorizeUrl();
  url.searchParams.set('client_id', TTF_SSO_CLIENT_ID);
  url.searchParams.set('redirect_uri', callbackRedirectUri());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  window.location.href = url.toString();
}

export interface SsoTokenResult {
  token: string;
  refreshToken: string;
  user: unknown;
}

/** Called from the /auth/ttf/callback page once `code`/`state` land back in the URL. */
export async function exchangeTtfSsoCode(code: string, state: string): Promise<SsoTokenResult> {
  const expectedState = sessionStorage.getItem(PKCE_STATE_KEY);
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);

  if (!verifier || !expectedState || state !== expectedState) {
    throw new Error('Sign-in could not be verified. Please try again.');
  }

  const res = await fetch(ssoTokenUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      client_id: TTF_SSO_CLIENT_ID,
      redirect_uri: callbackRedirectUri(),
    }),
  });
  const body = await res.json();
  if (!res.ok || !body?.success) {
    throw new Error(body?.message || 'Sign-in failed. Please try again.');
  }
  return body.data as SsoTokenResult;
}

export function consumePostLoginRedirect(): string | undefined {
  const path = sessionStorage.getItem('ttf_sso_post_login_redirect') || undefined;
  sessionStorage.removeItem('ttf_sso_post_login_redirect');
  return path;
}
