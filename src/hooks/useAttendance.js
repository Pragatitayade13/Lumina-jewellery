import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * useAttendance — manages clock-in / clock-out for the currently logged-in staff user.
 *
 * Returns:
 *  - isClockedIn   : boolean  — whether the user is currently clocked in today
 *  - checkInTime   : string   — formatted check-in time (e.g. "09:05 AM") or null
 *  - checkOutTime  : string   — formatted check-out time or null
 *  - loading       : boolean  — fetching initial state
 *  - clockIn()     : async fn — writes lastCheckIn + status:'online' to Firestore
 *  - clockOut()    : async fn — writes lastCheckOut + status:'offline' to Firestore
 */
export function useAttendance(userId) {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (ts) => {
    if (!ts) return null;
    const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (ts) => {
    if (!ts) return false;
    const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  // Fetch current attendance state on mount
  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const checkIn = data.lastCheckIn || null;
          const checkOut = data.lastCheckOut || null;

          // Only count check-in as active if it's from today
          if (checkIn && isToday(checkIn)) {
            setCheckInTime(formatTime(checkIn));
            setIsClockedIn(data.status === 'online');

            // Only show today's check-out
            if (checkOut && isToday(checkOut)) {
              setCheckOutTime(formatTime(checkOut));
            }
          }
        }
      } catch (err) {
        console.error('useAttendance: Error fetching status', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  const clockIn = async () => {
    if (!userId || !db) throw new Error('Not authenticated or Firebase unavailable');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastCheckIn: serverTimestamp(),
      lastCheckOut: null,   // reset checkout for new session
      status: 'online',
    });
    // Optimistically update local state with current time
    setCheckInTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setCheckOutTime(null);
    setIsClockedIn(true);
  };

  const clockOut = async () => {
    if (!userId || !db) throw new Error('Not authenticated or Firebase unavailable');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastCheckOut: serverTimestamp(),
      status: 'offline',
    });
    setCheckOutTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setIsClockedIn(false);
  };

  return { isClockedIn, checkInTime, checkOutTime, loading, clockIn, clockOut };
}
