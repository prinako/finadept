/**
 * End-to-End Encryption (E2EE) utilities using AES-GCM-256 and PBKDF2.
 * Compatible with standard Web Cryptography API (browser & Node.js 19+).
 */
import { EncryptedPayload } from '../types/finance';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;
const IV_LENGTH_BYTES = 12; // 96-bit IV recommended for AES-GCM
const SALT_LENGTH_BYTES = 16; // 128-bit salt

// Helper to convert Uint8Array to Base64
export function bufferToBase64(buf: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buf).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < buf.byteLength; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to Uint8Array
export function base64ToBuffer(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive AES-GCM key from passphrase and salt using PBKDF2
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hashes passphrase for local unlock verification without storing plaintext
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(`kryptos_salt_prefix_${passphrase}`));
  return bufferToBase64(new Uint8Array(hashBuffer));
}

/**
 * Encrypt arbitrary JavaScript data structure using AES-GCM-256
 */
export async function encryptPayload(data: unknown, passphrase: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const key = await deriveKey(passphrase, salt);

  const jsonStr = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonStr);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encodedData
  );

  return {
    version: 1,
    algorithm: 'AES-GCM-256',
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(new Uint8Array(encryptedBuffer)),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Decrypt an EncryptedPayload using AES-GCM-256 with passphrase
 */
export async function decryptPayload<T = unknown>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  if (payload.algorithm !== 'AES-GCM-256') {
    throw new Error(`Unsupported encryption algorithm: ${payload.algorithm}`);
  }

  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      ciphertext as BufferSource
    );

    const decodedStr = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decodedStr) as T;
  } catch {
    throw new Error('Decryption failed: Incorrect passphrase or corrupted payload.');
  }
}

/**
 * Generate a cryptographically secure 6-part human-readable sync code (e.g. "KRYP-8924-SYNC-3318")
 */
export function generateRandomSyncCode(): string {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  const part1 = (array[0] % 9000 + 1000).toString();
  const part2 = (array[1] % 9000 + 1000).toString();
  return `KRYP-${part1}-SYNC-${part2}`;
}
