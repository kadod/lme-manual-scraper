/**
 * API Key Generator
 * Secure generation and hashing of API keys
 */

import { customAlphabet } from 'nanoid'
import crypto from 'crypto'

// Custom alphabet for API keys (alphanumeric, no confusing characters)
const nanoid = customAlphabet('0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz', 32)

/**
 * Generate a new API key with prefix
 * Format: lm_<32-char-random-string>
 */
export function generateAPIKey(): string {
  const randomPart = nanoid()
  return `lm_${randomPart}`
}

/**
 * Hash API key using SHA-256
 * Store only the hash in the database for security
 */
export function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Get key prefix for display (first 8 characters after prefix)
 * Example: lm_abc12345******
 */
export function getKeyPrefix(key: string): string {
  if (!key.startsWith('lm_')) {
    throw new Error('Invalid API key format')
  }

  const keyPart = key.substring(3) // Remove 'lm_' prefix
  return `lm_${keyPart.substring(0, 8)}`
}

/**
 * Mask API key for display
 * Shows prefix and masks the rest
 */
export function maskAPIKey(key: string): string {
  if (!key.startsWith('lm_')) {
    throw new Error('Invalid API key format')
  }

  const prefix = getKeyPrefix(key)
  return `${prefix}${'*'.repeat(24)}`
}

/**
 * Validate API key format
 */
export function isValidAPIKeyFormat(key: string): boolean {
  // Check format: lm_ followed by 32 alphanumeric characters
  const apiKeyRegex = /^lm_[0-9A-Za-z]{32}$/
  return apiKeyRegex.test(key)
}

/**
 * Generate a secure random token for invitations or temporary access
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Verify API key against stored hash
 */
export function verifyAPIKey(key: string, storedHash: string): boolean {
  const keyHash = hashAPIKey(key)
  return keyHash === storedHash
}
