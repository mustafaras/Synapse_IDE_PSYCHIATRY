


const SALT_KEY = 'ai.vault.salt';

function getSalt(): Uint8Array {
  if (typeof window === 'undefined') return new Uint8Array(16);
  const existing = localStorage.getItem(SALT_KEY);
  if (existing) {
    try {
      const raw = atob(existing);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i) & 0xff;
      return bytes;
    } catch {  }
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  try {
    let s = '';
    for (let i = 0; i < salt.length; i++) s += String.fromCharCode(salt[i]);
    localStorage.setItem(SALT_KEY, btoa(s));
  } catch {  }
  return salt;
}

async function importPbkdfKey(passphrase: string): Promise<CryptoKey> {
  const te = new TextEncoder();
  return crypto.subtle.importKey('raw', te.encode(passphrase), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
}

export async function deriveKey(passphrase: string): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !('crypto' in window) || !crypto.subtle) {
    throw new Error('WebCrypto unavailable');
  }
  const salt = getSalt();
  const baseKey = await importPbkdfKey(passphrase);

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toB64(u8: Uint8Array): string {
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}
function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i) & 0xff;
  return u8;
}

export async function encryptString(plain: string, passphrase: string): Promise<string> {
  const te = new TextEncoder();
  const key = await deriveKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = te.encode(plain);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));

  const blob = new Uint8Array(iv.length + cipher.length);
  blob.set(iv, 0);
  blob.set(cipher, iv.length);
  return toB64(blob);
}

export async function decryptString(blobB64: string, passphrase: string): Promise<string> {
  const td = new TextDecoder();
  const raw = fromB64(blobB64);
  if (raw.length < 13) throw new Error('Invalid blob');
  const iv = raw.slice(0, 12);
  const cipher = raw.slice(12);
  const key = await deriveKey(passphrase);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return td.decode(plain);
}

export function isProbablyEncrypted(value: string | undefined): boolean {

  if (!value) return false;
  if (value.length < 24) return false;
  if (value.match(/^[A-Za-z0-9+/=]+$/) && value.length % 4 === 0) return true;
  return false;
}
