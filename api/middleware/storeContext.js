import admin from 'firebase-admin';

// Re-initialize or get db (assuming admin is initialized in security.js or index.js)
const getDb = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
    });
  }
  return admin.firestore();
};

/**
 * Validates the store context from headers.
 * Extracts `x-active-store-id` and ensures the user has access.
 */
export const withStoreContext = (handler) => {
  return async (req, res) => {
    try {
      const activeStoreId = req.headers['x-active-store-id'];
      
      // If no store ID is provided, we default to global context (for superadmins or legacy logic)
      if (!activeStoreId || activeStoreId === 'GLOBAL') {
        req.activeStoreId = null;
        return handler(req, res);
      }

      // Ensure user context exists (should be called after withAuth)
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized: User context required for store validation.' });
      }

      const uid = req.user.uid;
      const role = req.user.role || 'customer';

      // Superadmins bypass explicit store assignment checks
      if (['superadmin', 'super admin'].includes(role.toLowerCase())) {
        req.activeStoreId = activeStoreId;
        return handler(req, res);
      }

      const db = getDb();
      
      // Check if user is assigned to this store in user_stores
      const snapshot = await db.collection('user_stores')
        .where('userId', '==', uid)
        .where('storeId', '==', activeStoreId)
        .where('status', '==', 'active')
        .get();

      if (snapshot.empty) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this store.' });
      }

      // Inject the validated store ID
      req.activeStoreId = activeStoreId;
      return handler(req, res);

    } catch (err) {
      console.error('Error in store context middleware:', err);
      return res.status(500).json({ error: 'Internal Server Error processing store context.' });
    }
  };
};
