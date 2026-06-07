import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const logError = async (error, context = {}) => {
  try {
    if (!db) return;
    await addDoc(collection(db, 'error_logs'), {
      message: error.message || String(error),
      stack: error.stack || null,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to log error to Firestore", e);
  }
};

export const logAudit = async (action, resourceId, details = {}, user = null) => {
  try {
    if (!db) return;
    await addDoc(collection(db, 'audit_logs'), {
      action,
      resourceId,
      details,
      userId: user?.uid || 'system',
      userEmail: user?.email || 'system',
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to log audit event", e);
  }
};

export const logPerformance = async (metricName, value, context = {}) => {
  try {
    if (!db) return;
    await addDoc(collection(db, 'system_metrics'), {
      metricName,
      value,
      context,
      url: window.location.href,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to log performance metric", e);
  }
};
