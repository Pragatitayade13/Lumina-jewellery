import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useAudit(activeStoreId = null) {
  const logAudit = async (action, module, entityId, oldValue = null, newValue = null, storeOverride = null) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user ? user.uid : 'SYSTEM';
      
      const storeId = storeOverride || activeStoreId || 'GLOBAL';

      await addDoc(collection(db, 'audit_logs'), {
        storeId,
        userId,
        action,
        module,
        entityId: entityId || 'N/A',
        oldValue,
        newValue,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  };

  return { logAudit };
}
