import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { products as mockProducts } from '../admin/data/mockData';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const mockMatch = mockProducts.find(mp => mp.sku === data.sku || mp.name === data.name);
        let img = data.image;
        if (img && img.includes('/src/assets') && mockMatch) {
            img = mockMatch.image;
        }

        return {
          id: doc.id,
          ...data,
          image: img || (mockMatch ? mockMatch.image : null)
        };
      });
      setProducts(productsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching products:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), productData);
      return docRef.id;
    } catch (err) {
      console.error("Error adding product: ", err);
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.error("Error removing product: ", err);
      throw err;
    }
  };

  const updateProduct = async (id, updateData) => {
    try {
      await updateDoc(doc(db, 'products', id), updateData);
    } catch (err) {
      console.error("Error updating product: ", err);
      throw err;
    }
  };

  return { products, loading, error, addProduct, removeProduct, updateProduct };
}
