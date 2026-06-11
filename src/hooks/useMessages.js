import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { getStoreQuery, StoreIsolationError } from '../utils/storeQuery';

export function useMessages(userId1, userId2, activeStoreId = null) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !userId1 || !userId2) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Scope conversations to a store by including storeId in the conversationId
    const storePrefix = activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'global';
    const conversationId = storePrefix + '_' + [userId1, userId2].sort().join('_');
    
    let q;
    try {
      q = getStoreQuery(db, 'messages', activeStoreId, [
        where('conversationId', '==', conversationId)
      ]);
    } catch (err) {
      if (err instanceof StoreIsolationError) {
        console.warn(err.message);
        setMessages([]);
        setLoading(false);
        return;
      }
      throw err;
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.docs.forEach(doc => {
        try {
          const data = doc.data();
          let timeStr = '';
          let timestamp = 0;
          
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              const date = data.createdAt.toDate();
              timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              timestamp = date.getTime();
            } else if (typeof data.createdAt === 'string') {
              const date = new Date(data.createdAt);
              timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              timestamp = date.getTime();
            }
          } else {
            timestamp = Date.now();
          }
          
          messagesData.push({
            id: doc.id,
            senderId: data.senderId,
            senderName: data.senderName || 'Unknown',
            text: data.text || '',
            time: timeStr,
            _timestamp: timestamp
          });
        } catch (e) {
          console.error("Error processing message:", doc.id, e);
        }
      });
      
      messagesData.sort((a, b) => a._timestamp - b._timestamp);
      setMessages(messagesData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId1, userId2, activeStoreId]);

  const sendMessage = async (senderId, senderName, text) => {
    if (!db || !userId1 || !userId2) throw new Error("Missing chat configuration");
    if (!activeStoreId || activeStoreId === 'NONE') {
      throw new Error("Cannot send message without an active store context.");
    }
    
    const storePrefix = activeStoreId !== 'GLOBAL' ? activeStoreId : 'global';
    const conversationId = storePrefix + '_' + [userId1, userId2].sort().join('_');
    
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId,
        senderName,
        text,
        storeId: activeStoreId,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage };
}
