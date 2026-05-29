import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';

export function useMessages(userId1, userId2) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !userId1 || !userId2) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const conversationId = [userId1, userId2].sort().join('_');
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    
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
  }, [userId1, userId2]);

  const sendMessage = async (senderId, senderName, text) => {
    if (!db || !userId1 || !userId2) throw new Error("Missing chat configuration");
    const conversationId = [userId1, userId2].sort().join('_');
    
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId,
        senderName,
        text,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage };
}
