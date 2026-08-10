/**
 * Payload encryption for API request/response bodies.
 * When VITE_ENCRYPTION=true, encryption is used. Uses same ENCRYPTION_KEY as backend (VITE_ENCRYPTION_KEY).
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;
const TAG_LENGTH = 128;
const TAG_BYTES = 16;

export const ENCRYPTED_HEADER = 'x-payload-encrypted';

function getRawKey(): string {
  const key = import.meta.env.VITE_ENCRYPTION_KEY;
  return typeof key === 'string' ? key : '';
}

export function isEncryptionEnabled(): boolean {
  const flag = import.meta.env.VITE_ENCRYPTION;
  return flag === 'true' || flag === '1';
}

function hasValidKey(): boolean {
  return getRawKey().length >= 16;
}

export function shouldEncrypt(): boolean {
  return isEncryptionEnabled() && hasValidKey();
}

function hasEncryptedResponse(response: { data?: unknown }): boolean {
  const data = response?.data;
  return (
    typeof data === 'object' && data !== null && typeof (data as { e?: unknown }).e === 'string'
  );
}

export function shouldDecryptResponse(response: { data?: unknown }): boolean {
  return hasEncryptedResponse(response) && hasValidKey();
}

export function base64urlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function deriveKey(rawKey: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(rawKey));
  return crypto.subtle.importKey('raw', hash, { name: ALGORITHM }, false, ['encrypt', 'decrypt']);
}

function b64ToU8(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function u8ToB64(u8: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

export async function encrypt(plaintext: string): Promise<string> {
  const rawKey = getRawKey();
  if (!rawKey || rawKey.length < 16) throw new Error('VITE_ENCRYPTION_KEY required');
  const key = await deriveKey(rawKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    enc.encode(plaintext)
  );
  const ct = new Uint8Array(ciphertext);
  const data = ct.slice(0, ct.length - TAG_BYTES);
  const tag = ct.slice(ct.length - TAG_BYTES);
  return JSON.stringify({ iv: u8ToB64(iv), tag: u8ToB64(tag), data: u8ToB64(data) });
}

export async function decrypt(encrypted: string): Promise<string> {
  const rawKey = getRawKey();
  if (!rawKey || rawKey.length < 16) throw new Error('VITE_ENCRYPTION_KEY required');
  const envelope = JSON.parse(encrypted) as { iv: string; tag: string; data: string };
  if (!envelope.iv || !envelope.tag || !envelope.data) throw new Error('Invalid encrypted payload');
  const key = await deriveKey(rawKey);
  const iv = b64ToU8(envelope.iv);
  const tag = b64ToU8(envelope.tag);
  const data = b64ToU8(envelope.data);
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data);
  combined.set(tag, data.length);
  const dec = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as BufferSource, tagLength: TAG_LENGTH },
    key,
    combined.buffer.slice(combined.byteOffset, combined.byteOffset + combined.byteLength)
  );
  return new TextDecoder().decode(dec);
}
