import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isDev = env.NODE_ENV === 'development';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,           
  max: isDev ? 1000 : 200,
  standardHeaders: true,               
  legacyHeaders: false,                
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: (req) => {
    
    return req.path === '/health';
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,           
  max: isDev ? 50 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,           
  max: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. You may upload again in 1 hour.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
  },
});
