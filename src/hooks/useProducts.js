import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, limit, getDocs, startAfter, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { products as mockProducts } from '../admin/data/mockData';
import { logAudit } from '../services/logger';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      let productsQuery = query(collection(db, 'products'), limit(20));
      
      if (isLoadMore && lastVisible) {
        productsQuery = query(collection(db, 'products'), startAfter(lastVisible), limit(20));
      }

      const snapshot = await getDocs(productsQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      const productsData = snapshot.docs.map(document => {
        const data = document.data();
        const mockMatch = mockProducts.find(mp => mp.sku === data.sku || mp.name === data.name);
        let img = data.image;
        if (img && img.includes('/src/assets') && mockMatch) {
            img = mockMatch.image;
        }

        return {
          id: document.id,
          ...data,
          image: img || (mockMatch ? mockMatch.image : null)
        };
      });

      if (isLoadMore) {
        setProducts(prev => {
          const newProducts = productsData.filter(newP => !prev.find(p => p.id === newP.id));
          return [...prev, ...newProducts];
        });
      } else {
        setProducts(productsData);
      }
      
      setHasMore(snapshot.docs.length === 20);

    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    fetchProducts(false);
  }, []); // Only fetch on mount

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProducts(true);
    }
  }, [loadingMore, hasMore, fetchProducts]);

  const addProduct = async (productData) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), productData);
      const auth = getAuth();
      await logAudit('ADD_PRODUCT', docRef.id, { name: productData.name }, auth.currentUser);
      return docRef.id;
    } catch (err) {
      console.error("Error adding product: ", err);
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      const auth = getAuth();
      await logAudit('REMOVE_PRODUCT', id, {}, auth.currentUser);
    } catch (err) {
      console.error("Error removing product: ", err);
      throw err;
    }
  };

  const updateProduct = async (id, updateData) => {
    try {
      await updateDoc(doc(db, 'products', id), updateData);
      const auth = getAuth();
      await logAudit('UPDATE_PRODUCT', id, { keysUpdated: Object.keys(updateData) }, auth.currentUser);
    } catch (err) {
      console.error("Error updating product: ", err);
      throw err;
    }
  };

  return { products, loading, loadingMore, hasMore, loadMore, error, addProduct, removeProduct, updateProduct };
}
