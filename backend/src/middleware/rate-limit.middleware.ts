import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isDev = env.NODE_ENV === 'development';

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL API LIMITER
// Applied to every route as a baseline.
// 200 requests per 15 minutes per IP — enough for normal app usage.
// In development, the limit is relaxed (1000 req / 15 min) to not block hot-reload.
// ─────────────────────────────────────────────────────────────────────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,           // 15 minutes
  max: isDev ? 1000 : 200,
  standardHeaders: true,               // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,                // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: (req) => {
    // Never rate-limit health check pings
    return req.path === '/health';
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH STRICT LIMITER
// Applied ONLY to login and signup routes.
// 10 attempts per 15 minutes per IP — prevents brute-force and credential stuffing.
// In development, raised to 50 so you can test without getting blocked.
// ─────────────────────────────────────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,           // 15 minutes
  max: isDev ? 50 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// FILE UPLOAD LIMITER
// Applied to bulk-import and file submission endpoints.
// 20 uploads per hour per IP — prevents upload spam.
// ─────────────────────────────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,           // 1 hour
  max: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. You may upload again in 1 hour.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
  },
});
