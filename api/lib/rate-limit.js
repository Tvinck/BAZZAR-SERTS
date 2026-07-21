/**
 * Simple in-memory rate limiter for Vercel serverless functions.
 *
 * NOTE: Each Vercel serverless instance has its own memory, so this
 * rate limiter is per-instance. It still provides meaningful protection
 * against rapid bursts from the same IP within a single instance's lifetime.
 *
 * Usage:
 *   import { rateLimit } from '../lib/rate-limit.js';
 *   const limiter = rateLimit({ windowMs: 60000, max: 5 });
 *
 *   export default async function handler(req, res) {
 *     const { allowed, remaining, retryAfter } = limiter.check(req);
 *     if (!allowed) {
 *       res.setHeader('Retry-After', Math.ceil(retryAfter / 1000));
 *       return res.status(429).json({ error: 'Too Many Requests' });
 *     }
 *     // ... handle request
 *   }
 */

const limiters = new Map();

/**
 * Create a rate limiter instance.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.max       - Max requests per IP per window (default: 10)
 * @returns {{ check: (req: any) => { allowed: boolean, remaining: number, retryAfter: number } }}
 */
export function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  // Use a unique store per limiter instance
  const id = Symbol('rate-limit');

  function getStore() {
    if (!limiters.has(id)) {
      limiters.set(id, new Map());
    }
    return limiters.get(id);
  }

  /**
   * Cleanup expired entries to prevent memory leaks.
   */
  function cleanup(store, now) {
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart >= windowMs) {
        store.delete(key);
      }
    }
  }

  /**
   * Extract client IP from request (Vercel / standard headers).
   */
  function getIP(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  return {
    /**
     * Check if the request is within the rate limit.
     * @param {Object} req - Node.js / Vercel request object
     * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
     */
    check(req) {
      const store = getStore();
      const now = Date.now();
      const ip = getIP(req);

      // Periodic cleanup (every 100 checks)
      if (store.size > 0 && store.size % 100 === 0) {
        cleanup(store, now);
      }

      let entry = store.get(ip);

      // If no entry or window has expired, start a new window
      if (!entry || now - entry.windowStart >= windowMs) {
        entry = { windowStart: now, count: 0 };
        store.set(ip, entry);
      }

      entry.count++;

      const allowed = entry.count <= max;
      const remaining = Math.max(0, max - entry.count);
      const retryAfter = allowed ? 0 : windowMs - (now - entry.windowStart);

      return { allowed, remaining, retryAfter };
    },
  };
}
