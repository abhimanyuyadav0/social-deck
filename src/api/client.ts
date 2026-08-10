import { baseUrl } from '@/config';
import {
  shouldEncrypt,
  shouldDecryptResponse,
  encrypt,
  decrypt,
  base64urlEncode,
} from '@/api/encryption';

const TOKEN_KEY = 'socialdeck_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const storedToken = getStoredToken();
  const authValue = storedToken && shouldEncrypt() ? base64urlEncode(storedToken) : storedToken;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (authValue) (headers as Record<string, string>)['Authorization'] = `Bearer ${authValue}`;

  let body = options.body;
  if (shouldEncrypt()) {
    (headers as Record<string, string>)['x-payload-encrypted'] = 'true';
    if (body && typeof body === 'string') {
      body = JSON.stringify({ e: await encrypt(body) });
    }
  }

  const res = await fetch(url, { ...options, body, headers });
  let data = await res.json().catch(() => ({}));

  if (shouldDecryptResponse({ data }) && typeof (data as { e?: string }).e === 'string') {
    try {
      data = JSON.parse(await decrypt((data as { e: string }).e));
    } catch {
      throw new Error('Response decryption failed. Check VITE_ENCRYPTION_KEY.');
    }
  }

  if (!res.ok) {
    throw new Error((data as { message?: string }).message || res.statusText || 'Request failed');
  }
  return data as T;
}

export { TOKEN_KEY };
