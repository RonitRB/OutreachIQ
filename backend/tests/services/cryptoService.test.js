/**
 * Unit tests for cryptoService — encrypt/decrypt round-trip,
 * missing key handling, and legacy token backward compatibility.
 */

const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

beforeEach(() => {
  process.env.TOKEN_ENCRYPTION_KEY = TEST_KEY;
});

afterEach(() => {
  delete process.env.TOKEN_ENCRYPTION_KEY;
});

const { encrypt, decrypt } = require('../../src/services/cryptoService');

describe('cryptoService', () => {
  describe('encrypt', () => {
    it('returns a string in iv:authTag:ciphertext format', () => {
      const encrypted = encrypt('hello-world');
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);
      // IV should be 32 hex chars (16 bytes)
      expect(parts[0]).toHaveLength(32);
      // Auth tag should be 32 hex chars (16 bytes)
      expect(parts[1]).toHaveLength(32);
      // Ciphertext should be non-empty
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('produces different ciphertexts for the same plaintext (random IV)', () => {
      const a = encrypt('same-input');
      const b = encrypt('same-input');
      expect(a).not.toBe(b);
    });

    it('throws when TOKEN_ENCRYPTION_KEY is not set', () => {
      delete process.env.TOKEN_ENCRYPTION_KEY;
      expect(() => encrypt('test')).toThrow('TOKEN_ENCRYPTION_KEY is not set');
    });
  });

  describe('decrypt', () => {
    it('correctly round-trips a plaintext through encrypt then decrypt', () => {
      const plaintext = 'my-secret-refresh-token-1234';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('handles empty string plaintext', () => {
      const encrypted = encrypt('');
      expect(decrypt(encrypted)).toBe('');
    });

    it('handles unicode plaintext', () => {
      const plaintext = '日本語テスト 🔐';
      const encrypted = encrypt(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it('returns legacy unencrypted tokens as-is (no colons)', () => {
      const legacyToken = 'ya29.some-old-unencrypted-token';
      expect(decrypt(legacyToken)).toBe(legacyToken);
    });

    it('throws when TOKEN_ENCRYPTION_KEY is not set', () => {
      delete process.env.TOKEN_ENCRYPTION_KEY;
      expect(() => decrypt('aa:bb:cc')).toThrow('TOKEN_ENCRYPTION_KEY is not set');
    });
  });
});
