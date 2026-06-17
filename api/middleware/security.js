import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('Firebase Admin credentials missing from env variables.');
    }
  } catch (error) {
    console.error('Firebase Admin init error in middleware:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

const logSecurityEvent = async (type, ip, details) => {
  try {
    if (!db) {
      console.warn('Firebase Admin not initialized, skipping security logging.');
      return;
    }
    await db.collection('security_events').add({
      type,
      ip,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error('Failed to log security event:', e);
  }
};

// In-memory store for basic rate limiting
const rateLimits = new Map();

/**
 * Basic in-memory rate limiter
 * @param {Function} handler - The API handler function
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
export const withRateLimit = (handler, maxRequests = 10, windowMs = 60000) => {
  return async (req, res) => {
    // Determine IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Clean up old entries periodically to prevent memory leak
    if (Math.random() < 0.05) {
      for (const [key, data] of rateLimits.entries()) {
        if (now - data.startTime > windowMs) rateLimits.delete(key);
      }
    }

    let record = rateLimits.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 0, startTime: now };
    }

    record.count++;
    rateLimits.set(ip, record);

    if (record.count > maxRequests) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { path: req.url, count: record.count });
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    return handler(req, res);
  };
};

/**
 * Validates Origin/Referer to prevent CSRF on unauthenticated endpoints
 */
export const withCSRF = (handler) => {
  return async (req, res) => {
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      return handler(req, res);
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // If running locally, you might want to allow localhost.
    // In production, ensure the origin matches your deployed domain.
    const allowedOrigin = process.env.VITE_APP_URL || 'http://localhost:5173';

    const isLocal = (url) => url && (url.startsWith('http://localhost:') || url.startsWith('http://127.0.0.1:'));

    if (!origin && !referer) {
      // Browsers generally send at least one for cross-origin POSTs.
      // If both are missing, it might be a direct curl request (abuse).
      await logSecurityEvent('CSRF_MISSING_HEADERS', req.socket.remoteAddress, { path: req.url });
      return res.status(403).json({ error: 'Missing Origin/Referer header' });
    }

    if (origin && !isLocal(origin) && !origin.startsWith(allowedOrigin)) {
      console.warn(`CSRF blocked from origin: ${origin}`);
      await logSecurityEvent('CSRF_INVALID_ORIGIN', req.socket.remoteAddress, { origin, path: req.url });
      return res.status(403).json({ error: 'CSRF Validation Failed' });
    }

    if (referer && !isLocal(referer) && !referer.startsWith(allowedOrigin)) {
      console.warn(`CSRF blocked from referer: ${referer}`);
      await logSecurityEvent('CSRF_INVALID_REFERER', req.socket.remoteAddress, { referer, path: req.url });
      return res.status(403).json({ error: 'CSRF Validation Failed' });
    }

    return handler(req, res);
  };
};

/**
 * Validates Firebase ID Token and checks roles
 * @param {Function} handler - The API handler function
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['superadmin'])
 */
export const withAuth = (handler, allowedRoles = []) => {
  return async (req, res) => {
    // For local dev without auth testing, comment out inside this block
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await logSecurityEvent('AUTH_MISSING_TOKEN', req.socket.remoteAddress, { path: req.url });
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;

      // If roles are specified, validate against custom claims
      if (allowedRoles.length > 0) {
        // Fetch full user record or assume claims are in the token
        // E.g., decodedToken.role === 'admin'
        const userRole = decodedToken.role || 'customer';

        if (!allowedRoles.includes(userRole)) {
          console.warn(`Forbidden: User ${decodedToken.email} with role ${userRole} attempted to access restricted API.`);
          await logSecurityEvent('AUTH_INSUFFICIENT_ROLE', req.socket.remoteAddress, {
            email: decodedToken.email,
            role: userRole,
            path: req.url
          });
          return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error('Auth verification failed:', error);
      await logSecurityEvent('AUTH_INVALID_TOKEN', req.socket.remoteAddress, { path: req.url, error: error.message });
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
};
