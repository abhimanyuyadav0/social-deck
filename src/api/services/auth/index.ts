import { api, TOKEN_KEY, getStoredToken } from '@/api/client';
import { shouldEncrypt, encrypt } from '@/api/encryption';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  MeResponse,
} from './types';

export type { User, SocialDeckUser } from './types';

const AUTH = {
  LOGIN: '/social-deck/auth/login',
  REGISTER: '/social-deck/auth/register',
  ME: '/social-deck/auth/me',
  VERIFY_EMAIL: '/social-deck/auth/verify-email',
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await api<LoginResponse>(AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data.success && data.data.token) {
    const toStore = shouldEncrypt() ? await encrypt(data.data.token) : data.data.token;
    localStorage.setItem(TOKEN_KEY, toStore);
  }
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return api<RegisterResponse>(AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  return api(`${AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`, { method: 'GET' });
}

export async function getMe(): Promise<MeResponse> {
  return api<MeResponse>(AUTH.ME);
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export { getStoredToken, AUTH };
