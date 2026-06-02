import { db } from '../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, writeBatch, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'socialPosts';

export const fetchSocialPosts = async () => {
  if (!db) throw new Error("Firebase not initialized");
  
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching social posts:", error);
    throw error;
  }
};

export const seedSocialPosts = async (posts) => {
  if (!db) throw new Error("Firebase not initialized");
  
  try {
    const batch = writeBatch(db);
    posts.forEach(post => {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      batch.set(newDocRef, {
        ...post,
        createdAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
    console.log("Successfully seeded social posts");
  } catch (error) {
    console.error("Error seeding social posts:", error);
    throw error;
  }
};
