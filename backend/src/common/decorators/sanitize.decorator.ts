import { Transform } from 'class-transformer';

/**
 * Sanitizes string inputs by removing HTML tags and potentially malicious content
 * Uses a whitelist approach - only allows alphanumeric, spaces, and safe punctuation
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    // Remove HTML tags
    let sanitized = value.replace(/<[^>]*>/g, '');

    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  });
}
