import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStoreQuery } from '../utils/storeQuery';
import { useApp } from '../context/AppContext';

export function useApprovals(activeStoreId = null) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const appContext = useApp();
  const user = appContext?.user;
  const userRole = user?.role || 'customer';

  useEffect(() => {
    setApprovals([]);
    setLoading(true);
    if (!db) {
      setLoading(false);
      return;
    }

    if (!activeStoreId || activeStoreId === 'NONE') {
      setApprovals([]);
      setLoading(false);
      return;
    }

    const isStaff = ['staff', 'manager', 'admin', 'superadmin', 'super admin'].includes(userRole);
    if (!isStaff) {
      setApprovals([]);
      setLoading(false);
      return;
    }

    try {
      const constraints = [orderBy('timestamp', 'desc')];
      const q = getStoreQuery(db, 'approvals', activeStoreId, constraints);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApprovals(data);
        setLoading(false);
      }, (err) => {
        console.error("Failed to fetch approvals:", err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Approvals listener error:", err);
      setLoading(false);
    }
  }, [activeStoreId, userRole]);

  const submitApprovalRequest = async (type, payload, entityId = null, module = 'System') => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const storeId = activeStoreId || 'GLOBAL';

      const request = {
        type, 
        payload,
        entityId,
        module,
        status: 'pending',
        requestedBy: user?.uid || 'system',
        requestedRole: 'staff',
        storeId,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'approvals'), request);
      return docRef.id;
    } catch (err) {
      console.error("Failed to submit approval request:", err);
      throw err;
    }
  };

  const processApproval = async (id, status, comments = '') => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      await updateDoc(doc(db, 'approvals', id), {
        status, 
        reviewedBy: user?.uid || 'system',
        comments,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to process approval:", err);
      throw err;
    }
  };

  return { approvals, loading, submitApprovalRequest, processApproval };
}
