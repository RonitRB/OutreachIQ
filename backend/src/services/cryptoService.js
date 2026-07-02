const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a hex string: iv:authTag:ciphertext
 */
const encrypt = (plaintext) => {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not set');
  }

  const keyBuffer = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt an encrypted string (iv:authTag:ciphertext) using AES-256-GCM.
 * Returns the original plaintext.
 */
const decrypt = (encryptedText) => {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not set');
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // Likely a legacy unencrypted token — return as-is for backward compatibility
    return encryptedText;
  }

  const [ivHex, authTagHex, ciphertext] = parts;

  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    // Decryption failed — might be a legacy unencrypted token
    return encryptedText;
  }
};

module.exports = { encrypt, decrypt };
