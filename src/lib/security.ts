/**
 * Security Utilities for GoRec
 * ============================
 * XSS protection, input sanitization, and rate limiting
 */

// ============================================
// XSS SANITIZATION
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and encodes special characters
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * Sanitize filename to prevent path traversal and special characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'unnamed';

  return (
    filename
      // Remove path traversal attempts
      .replace(/\.\./g, '')
      .replace(/[/\\]/g, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Keep only safe characters
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      // Limit length
      .substring(0, 255)
  );
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Sanitize user input for display
 */
export function sanitizeUserInput(input: string, maxLength = 1000): string {
  if (!input || typeof input !== 'string') return '';

  return sanitizeHtml(input.trim().substring(0, maxLength));
}

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Client-side rate limiter
 * @param key - Unique identifier for the action (e.g., 'upload', 'share')
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Rate limit decorator for async functions
 */
export function withRateLimit<
  T extends (...args: unknown[]) => Promise<unknown>
>(fn: T, key: string, limit: number = 10, windowMs: number = 60000): T {
  return (async (...args: Parameters<T>) => {
    const { allowed, remaining, resetIn } = checkRateLimit(
      key,
      limit,
      windowMs
    );

    if (!allowed) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(
          resetIn / 1000
        )} seconds.`
      );
    }

    console.debug(`Rate limit: ${remaining} requests remaining`);
    return fn(...args);
  }) as T;
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate file type
 */
export function isAllowedFileType(
  file: File,
  allowedTypes: string[] = ['video/webm', 'video/mp4']
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (default max 500MB)
 */
export function isValidFileSize(
  file: File,
  maxSizeBytes: number = 524288000
): boolean {
  return file.size > 0 && file.size <= maxSizeBytes;
}

// ============================================
// CSRF PROTECTION
// ============================================

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token: string): void {
  sessionStorage.setItem('csrf_token', token);
}

/**
 * Get CSRF token from session storage
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem('csrf_token');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token;
}

// ============================================
// SECURITY LOGGING
// ============================================

type SecurityEventType =
  | 'rate_limit_exceeded'
  | 'invalid_input'
  | 'xss_attempt'
  | 'csrf_failure'
  | 'unauthorized_access';

/**
 * Log security events (for monitoring)
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  details: Record<string, unknown>
): void {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details,
  };

  // In production, send to monitoring service
  if (import.meta.env.PROD) {
    // Could send to a logging endpoint
    console.warn('[SECURITY]', event);
  } else {
    console.debug('[SECURITY]', event);
  }
}
