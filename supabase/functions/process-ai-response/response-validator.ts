/**
 * Response Validator Module
 * Validates and sanitizes AI responses before sending to users
 */

export interface ValidationConfig {
  prohibitedWords: string[];
  maxLength: number; // LINE limit: 5000 characters
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedContent?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Validate AI response
 */
export function validateResponse(
  content: string,
  config: ValidationConfig
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedContent = content;

  // Check if content is empty
  if (!content || content.trim().length === 0) {
    errors.push('Response is empty');
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  // Check length
  if (content.length > config.maxLength) {
    warnings.push(
      `Response exceeds maximum length (${content.length}/${config.maxLength})`
    );
    sanitizedContent = truncateResponse(content, config.maxLength);
  }

  // Check for prohibited words
  const foundProhibitedWords = findProhibitedWords(
    content,
    config.prohibitedWords
  );
  if (foundProhibitedWords.length > 0) {
    errors.push(
      `Response contains prohibited words: ${foundProhibitedWords.join(', ')}`
    );
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  // Check for potential PII leakage
  const piiWarnings = checkForPII(content);
  warnings.push(...piiWarnings);

  // Check for inappropriate content patterns
  const contentWarnings = checkContentPatterns(content);
  warnings.push(...contentWarnings);

  // Sanitize HTML/Script tags (basic XSS prevention)
  sanitizedContent = sanitizeHtmlTags(sanitizedContent);

  // Sanitize excessive whitespace
  sanitizedContent = sanitizeWhitespace(sanitizedContent);

  return {
    isValid: errors.length === 0,
    sanitizedContent,
    errors,
    warnings,
  };
}

/**
 * Find prohibited words in content
 */
function findProhibitedWords(
  content: string,
  prohibitedWords: string[]
): string[] {
  if (!prohibitedWords || prohibitedWords.length === 0) {
    return [];
  }

  const contentLower = content.toLowerCase();
  const found: string[] = [];

  for (const word of prohibitedWords) {
    if (contentLower.includes(word.toLowerCase())) {
      found.push(word);
    }
  }

  return found;
}

/**
 * Truncate response to maximum length
 * Try to truncate at sentence boundary
 */
function truncateResponse(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }

  // Try to find last sentence boundary before maxLength
  const truncated = content.substring(0, maxLength);
  const sentenceEndings = ['。', '！', '？', '.', '!', '?'];

  for (let i = truncated.length - 1; i >= 0; i--) {
    if (sentenceEndings.includes(truncated[i])) {
      return truncated.substring(0, i + 1);
    }
  }

  // If no sentence boundary found, just truncate with ellipsis
  return truncated.substring(0, maxLength - 3) + '...';
}

/**
 * Check for potential PII in content
 */
function checkForPII(content: string): string[] {
  const warnings: string[] = [];

  // Email pattern
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content)) {
    warnings.push('Response may contain email address');
  }

  // Phone number pattern (Japanese)
  if (/0\d{1,4}-?\d{1,4}-?\d{4}/.test(content)) {
    warnings.push('Response may contain phone number');
  }

  // Credit card pattern
  if (/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/.test(content)) {
    warnings.push('Response may contain credit card number');
  }

  // Social security/personal number pattern (Japanese)
  if (/\d{4}-?\d{6}/.test(content)) {
    warnings.push('Response may contain personal identification number');
  }

  return warnings;
}

/**
 * Check for inappropriate content patterns
 */
function checkContentPatterns(content: string): string[] {
  const warnings: string[] = [];

  // Check for URLs (might be phishing)
  if (/https?:\/\/[^\s]+/.test(content)) {
    warnings.push('Response contains URLs');
  }

  // Check for excessive capitalization (might be shouting)
  const uppercaseRatio =
    (content.match(/[A-Z]/g) || []).length / content.length;
  if (uppercaseRatio > 0.5 && content.length > 20) {
    warnings.push('Response contains excessive uppercase letters');
  }

  // Check for repeated characters (spam-like)
  if (/(.)\1{5,}/.test(content)) {
    warnings.push('Response contains excessive repeated characters');
  }

  return warnings;
}

/**
 * Sanitize HTML/Script tags
 */
function sanitizeHtmlTags(content: string): string {
  // Remove script tags and their content
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove other HTML tags but keep content
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

  return sanitized;
}

/**
 * Sanitize excessive whitespace
 */
function sanitizeWhitespace(content: string): string {
  // Replace multiple spaces with single space
  let sanitized = content.replace(/ {2,}/g, ' ');

  // Replace multiple line breaks with max 2
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Check if response is appropriate for customer
 */
export function isAppropriateResponse(content: string): boolean {
  const inappropriatePatterns = [
    // Discriminatory language
    /差別|侮辱|罵倒/i,
    // Violent content
    /暴力|殺人|傷害/i,
    // Sexual content
    /性的|わいせつ|アダルト/i,
    // Illegal activity
    /違法|犯罪|詐欺/i,
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(content)) {
      return false;
    }
  }

  return true;
}

/**
 * Format response for LINE messaging
 */
export function formatForLineMessage(content: string): string {
  // LINE specific formatting
  let formatted = content;

  // Ensure line breaks work on LINE
  formatted = formatted.replace(/\r\n/g, '\n');

  // Remove excessive formatting
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '$1'); // Remove markdown bold
  formatted = formatted.replace(/\*(.+?)\*/g, '$1'); // Remove markdown italic

  return formatted;
}
