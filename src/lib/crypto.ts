/**
 * Passphrase encryption for small secrets (the GitHub token): PBKDF2-SHA256
 * key derivation + AES-256-GCM. The envelope is self-contained (salt + iv +
 * ciphertext, base64) so decryption needs only the passphrase.
 */

const ITERATIONS = 310_000

export interface CipherEnvelope {
  v: 1
  salt: string
  iv: string
  ct: string
}

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function fromB64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptString(plaintext: string, passphrase: string): Promise<CipherEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext),
  )
  return { v: 1, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) }
}

/** Throws on a wrong passphrase (GCM authentication failure). */
export async function decryptString(envelope: CipherEnvelope, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase, fromB64(envelope.salt))
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(envelope.iv) as BufferSource },
    key,
    fromB64(envelope.ct) as BufferSource,
  )
  return new TextDecoder().decode(pt)
}

export function isCipherEnvelope(x: unknown): x is CipherEnvelope {
  return (
    !!x &&
    typeof x === 'object' &&
    (x as CipherEnvelope).v === 1 &&
    typeof (x as CipherEnvelope).salt === 'string' &&
    typeof (x as CipherEnvelope).iv === 'string' &&
    typeof (x as CipherEnvelope).ct === 'string'
  )
}
