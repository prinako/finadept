import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encryptPayload,
  decryptPayload,
  hashPassphrase,
  generateRandomSyncCode,
} from './crypto';

test('E2EE AES-GCM-256 encrypts and decrypts payload correctly', async () => {
  const secretData = {
    accounts: [{ id: 'acc-1', name: 'Banco Pan', totalDebt: 2497.11 }],
    secretToken: 'e2ee-secret-12345',
  };
  const passphrase = 'UltraSecurePassword!2026';

  const encrypted = await encryptPayload(secretData, passphrase);

  assert.equal(encrypted.algorithm, 'AES-GCM-256');
  assert.equal(typeof encrypted.ciphertext, 'string');
  assert.notEqual(encrypted.ciphertext, JSON.stringify(secretData));

  // Decrypt with correct passphrase
  const decrypted = await decryptPayload<typeof secretData>(encrypted, passphrase);
  assert.deepEqual(decrypted, secretData);
});

test('E2EE fails decryption when given wrong passphrase', async () => {
  const secretData = { balance: 5000 };
  const encrypted = await encryptPayload(secretData, 'correct-pass');

  await assert.rejects(
    async () => {
      await decryptPayload(encrypted, 'wrong-pass');
    },
    /Decryption failed/
  );
});

test('hashPassphrase returns deterministic sha-256 hash', async () => {
  const hash1 = await hashPassphrase('myPassphrase');
  const hash2 = await hashPassphrase('myPassphrase');
  const hash3 = await hashPassphrase('otherPassphrase');

  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
});

test('generateRandomSyncCode generates formatted sync tokens', () => {
  const code = generateRandomSyncCode();
  assert.match(code, /^KRYP-\d{4}-SYNC-\d{4}$/);
});
