// src/utils/envValidator.js

export function validateEnvironment() {
  const warnings = [];
  const errors = [];

  // Check required public VITE_ variables
  if (!import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key') {
    warnings.push('VITE_FIREBASE_API_KEY is missing or mocked. Authentication will be disabled or simulated.');
  }

  // Check for accidental leakage of private variables
  // Note: Vite prevents accessing import.meta.env.SMTP_USER, but we check if someone maliciously prefixed VITE_
  const suspiciousKeys = ['VITE_SMTP_PASS', 'VITE_RAZORPAY_SECRET', 'VITE_GOLD_API_KEY', 'VITE_SERVICE_ACCOUNT'];
  
  suspiciousKeys.forEach(key => {
    if (import.meta.env[key]) {
      errors.push(`CRITICAL SECURITY ALERT: ${key} is exposed to the client! Remove the VITE_ prefix immediately.`);
    }
  });

  if (warnings.length > 0) {
    console.warn('Environment Validation Warnings:\n', warnings.join('\n'));
  }

  if (errors.length > 0) {
    console.error('Environment Validation Errors:\n', errors.join('\n'));
    // In strict mode, we might throw an error here, but to avoid completely breaking the app during transition:
    // throw new Error("Environment validation failed due to exposed secrets.");
  }

  return { valid: errors.length === 0, warnings, errors };
}
