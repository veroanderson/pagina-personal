import 'server-only';

import crypto from 'node:crypto';
import { getSupabaseAdmin } from './supabase-server';

function getRateLimitKeySecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: SESSION_SECRET');
  }
  return secret;
}

function hashSubject(subject: string): string {
  return crypto.createHmac('sha256', getRateLimitKeySecret()).update(subject).digest('hex');
}

/**
 * Consumes one request from a persistent Supabase rate-limit bucket.
 * The subject is HMAC-hashed before it leaves the application, so raw IPs
 * are never stored in the database.
 */
export async function isRateLimited(
  scope: string,
  subject: string,
  windowMs: number,
  maxRequests: number,
): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseAdmin().rpc('consume_rate_limit', {
      p_scope: scope,
      p_subject_hash: hashSubject(subject),
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
      p_max_requests: maxRequests,
    });

    if (error) {
      throw error;
    }

    return data !== true;
  } catch (error) {
    // Fail closed: an unavailable limiter must not turn a protected endpoint
    // into an unlimited one.
    console.error('Rate-limit RPC failed:', error);
    return true;
  }
}

/** Resets a bucket after a successful login. */
export async function clearRateLimit(scope: string, subject: string): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc('reset_rate_limit', {
    p_scope: scope,
    p_subject_hash: hashSubject(subject),
  });

  if (error) {
    throw error;
  }
}
