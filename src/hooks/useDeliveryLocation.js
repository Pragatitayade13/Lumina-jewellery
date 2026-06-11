import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../config/firebase';
import {
  doc, setDoc, deleteDoc, collection,
  onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { getStoreQuery, StoreIsolationError } from '../utils/storeQuery';

/**
 * useDeliveryLocation
 *
 * Delivery partner side:
 *   - startTracking()  → starts watchPosition, writes coords to /locations/{userId}
 *   - stopTracking()   → clears watcher, marks location as idle in Firestore
 *   - myTrail          → array of {lat, lng} positions from current session (breadcrumb)
 *   - isTracking       → boolean
 *   - myPosition       → {lat, lng, accuracy} current position
 *
 * Admin / customer side (always active):
 *   - partnerLocations → real-time array of all active partner docs
 */
export function useDeliveryLocation(userId, partnerName, activeStoreId = null) {
  const [isTracking, setIsTracking] = useState(false);
  const [myPosition, setMyPosition] = useState(null);
  const [myTrail, setMyTrail] = useState([]);
  const [partnerLocations, setPartnerLocations] = useState([]);
  const watchIdRef = useRef(null);

  // ─── Subscribe to active partner locations, scoped to store if set ───────
  useEffect(() => {
    if (!db) return;
    
    let q;
    try {
      q = getStoreQuery(db, 'locations', activeStoreId);
    } catch (err) {
      if (err instanceof StoreIsolationError) {
        console.warn(err.message);
        setPartnerLocations([]);
        return;
      }
      throw err;
    }
    
    const unsub = onSnapshot(q, (snap) => {
      let locs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPartnerLocations(locs);
    });
    return () => unsub();
  }, [activeStoreId]);

  // ─── Auto-start tracking when user is logged in ────────────────────────────
  useEffect(() => {
    if (userId && partnerName) {
      startTracking();
    }
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ─── Start GPS broadcast ───────────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsTracking(true);
    setMyTrail([]); // reset breadcrumb for new session

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const point = { lat, lng };

        setMyPosition({ lat, lng, accuracy });
        setMyTrail(prev => {
          // avoid duplicates / micro-jitter — only add if moved > ~5m
          if (prev.length === 0) return [point];
          const last = prev[prev.length - 1];
          const d = Math.hypot(last.lat - lat, last.lng - lng);
          return d > 0.00005 ? [...prev, point] : prev;
        });

        if (db && userId) {
          if (!activeStoreId || activeStoreId === 'NONE') {
            console.warn("Cannot broadcast location without an active store context.");
            return;
          }
          await setDoc(doc(db, 'locations', userId), {
            lat,
            lng,
            accuracy,
            partnerName: partnerName || 'Delivery Partner',
            storeId: activeStoreId,
            status: 'active',
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [userId, partnerName]);

  // ─── Stop GPS broadcast ────────────────────────────────────────────────────
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);

    // Remove or mark idle in Firestore
    if (db && userId) {
      try {
        await deleteDoc(doc(db, 'locations', userId));
      } catch (_) {}
    }
  }, [userId]);

  return { isTracking, myPosition, myTrail, startTracking, stopTracking, partnerLocations };
}
