import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, limit, getDocs, startAfter, where, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { products as mockProducts } from '../admin/data/mockData';
import { useAudit } from './useAudit';
import { useApprovals } from './useApprovals';
import { useApp } from '../context/AppContext';
import { getStoreQuery, StoreIsolationError } from '../utils/storeQuery';

export function useProducts(activeStoreId = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // bump to force re-fetch
  const { logAudit } = useAudit(activeStoreId);
  const { submitApprovalRequest } = useApprovals(activeStoreId);
  const { user } = useApp() || {};
  const userRole = user?.role || 'staff';

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (!db) {
      setLoading(false);
      return;
    }

    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      let productsQuery;
      let usingFallback = false;

      try {
        let constraints = [];
        if (isLoadMore && lastVisible) constraints.push(startAfter(lastVisible));
        constraints.push(limit(50));
        productsQuery = getStoreQuery(db, 'products', activeStoreId, constraints);
      } catch (isolationError) {
        console.debug(isolationError.message);
        setProducts([]);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      let snapshot = await getDocs(productsQuery);

      // === FALLBACK: If store-isolated query returned nothing, fetch products without storeId ===
      // This handles existing/seeded products that predate the store isolation implementation
      if (snapshot.empty && activeStoreId && activeStoreId !== 'GLOBAL' && activeStoreId !== 'NONE') {
        console.info('[useProducts] No store-isolated products found. Fetching unassigned products as fallback.');
        usingFallback = true;
        const fallbackQ = query(collection(db, 'products'), limit(50));
        snapshot = await getDocs(fallbackQ);
      }

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
        if (img && img.includes('/src/assets') && mockMatch) img = mockMatch.image;
        return {
          id: document.id,
          ...data,
          image: img || (mockMatch ? mockMatch.image : null),
          _needsStoreAssignment: usingFallback && !data.storeId,
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

      setHasMore(snapshot.docs.length === 50);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible, activeStoreId]);

  useEffect(() => {
    setLastVisible(null);
    setProducts([]);
    setHasMore(true);
    fetchProducts(false);
  }, [activeStoreId, refreshKey]); // Re-fetch when store changes or refresh is triggered

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProducts(true);
    }
  }, [loadingMore, hasMore, fetchProducts]);

  const addProduct = async (productData) => {
    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    try {
      const productPayload = { ...productData };
      if (!productPayload.storeId || productPayload.storeId === 'NONE') {
        productPayload.storeId = activeStoreId && activeStoreId !== 'NONE' ? activeStoreId : 'GLOBAL';
      }
      
      // Clean up internal UI flags before writing to Firestore
      delete productPayload.id;
      delete productPayload.isFirestoreApproval;
      delete productPayload.approvalId;

      const docRef = await addDoc(collection(db, 'products'), productPayload);
      await logAudit('PRODUCT_CREATED', 'Products', docRef.id, null, { name: productData.name });
      
      setProducts(prev => [{ id: docRef.id, ...productPayload }, ...prev]);
      
      return docRef.id;
    } catch (err) {
      console.error("Error adding product: ", err);
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      if (userRole === 'staff') {
        await submitApprovalRequest('DELETE_PRODUCT', { id }, id, 'Products');
        return { status: 'pending' };
      }
      await deleteDoc(doc(db, 'products', id));
      await logAudit('PRODUCT_DELETED', 'Products', id);
      
      setProducts(prev => prev.filter(p => p.id !== id));
      
      return { status: 'success' };
    } catch (err) {
      console.error("Error removing product: ", err);
      throw err;
    }
  };

  const updateProduct = async (id, updateData) => {
    try {
      if (userRole === 'staff' && updateData.price !== undefined) {
        const product = products.find(p => p.id === id);
        const mrp = updateData.mrp || product?.mrp || 0;
        if (mrp > 0 && updateData.price < mrp * 0.8) {
          await submitApprovalRequest('HIGH_DISCOUNT', updateData, id, 'Products');
          return { status: 'pending' };
        }
      }
      await updateDoc(doc(db, 'products', id), updateData);
      await logAudit('PRODUCT_UPDATED', 'Products', id, null, updateData);
      
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updateData } : p));
      
      return { status: 'success' };
    } catch (err) {
      console.error("Error updating product: ", err);
      throw err;
    }
  };

  // Bulk-assign storeId to existing products that were created without one
  const bulkAssignStore = async () => {
    if (!db || !activeStoreId || activeStoreId === 'GLOBAL' || activeStoreId === 'NONE') return;
    try {
      const unassigned = products.filter(p => p._needsStoreAssignment);
      if (unassigned.length === 0) {
        console.warn('[bulkAssignStore] No unassigned products found.');
        return;
      }

      // Firestore batch allows max 500 writes; process in chunks
      const CHUNK_SIZE = 400;
      for (let i = 0; i < unassigned.length; i += CHUNK_SIZE) {
        const chunk = unassigned.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(p => {
          batch.update(doc(db, 'products', p.id), { storeId: activeStoreId });
        });
        await batch.commit();
      }

      await logAudit('PRODUCTS_STORE_ASSIGNED', 'Products', activeStoreId, null, { count: unassigned.length });

      // Reset pagination + trigger fresh fetch via refreshKey
      setLastVisible(null);
      setProducts([]);
      setHasMore(true);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('[bulkAssignStore] Error:', err.code, err.message);
      throw err;
    }
  };

  return { products, loading, loadingMore, hasMore, loadMore, error, addProduct, removeProduct, updateProduct, bulkAssignStore };
}
