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

      // Helper: score how well a mock product matches a Firestore product by name/SKU/category
      const getBestMockImage = (data) => {
        const name = String(data.name || '').toLowerCase();
        const sku = String(data.sku || '').toLowerCase();
        const category = String(data.category || '').toLowerCase();
        const subcategory = String(data.subcategory || '').toLowerCase();

        let bestScore = -1;
        let bestMock = null;

        for (const mp of mockProducts) {
          let score = 0;
          const mName = String(mp.name || '').toLowerCase();
          const mSku = String(mp.sku || '').toLowerCase();
          const mCat = String(mp.category || '').toLowerCase();
          const mSub = String(mp.subcategory || '').toLowerCase();

          // Exact SKU match — highest priority
          if (sku && mSku && sku === mSku) score += 100;

          // Exact name match
          if (name && mName && name === mName) score += 80;

          // Partial name word overlap
          const nameWords = name.split(/\s+/).filter(w => w.length > 2);
          for (const word of nameWords) {
            if (mName.includes(word)) score += 10;
          }

          // SKU prefix match (e.g. "GE-" for Gold Earrings)
          if (sku && mSku) {
            const skuPrefix = sku.split('-')[0];
            if (mSku.startsWith(skuPrefix)) score += 15;
          }

          // Category match
          if (category && mCat && category === mCat) score += 5;

          // Subcategory match
          if (subcategory && mSub && subcategory === mSub) score += 8;

          // Key product type keywords
          const types = [
            { words: ['ring', 'band', 'solitaire'], mockKw: ['ring', 'band', 'solitaire'] },
            { words: ['necklace', 'chain', 'pendant', 'haar'], mockKw: ['necklace', 'chain', 'pendant'] },
            { words: ['earring', 'jhumka', 'stud', 'bali', 'drop'], mockKw: ['earring', 'jhumka', 'stud'] },
            { words: ['bangle', 'kada', 'bracelet', 'kangan'], mockKw: ['bangle', 'kada', 'bracelet'] },
            { words: ['maang', 'tikka', 'mathapatti'], mockKw: ['maang', 'tikka'] },
            { words: ['mangalsutra', 'tanmaniya'], mockKw: ['mangalsutra'] },
            { words: ['choker', 'polki', 'kundan'], mockKw: ['choker', 'polki', 'kundan'] },
            { words: ['temple', 'antique', 'oxidised'], mockKw: ['temple', 'antique', 'oxidised'] },
            { words: ['diamond'], mockKw: ['diamond'] },
            { words: ['platinum'], mockKw: ['platinum'] },
            { words: ['silver'], mockKw: ['silver'] },
            { words: ['cufflink', 'lapel'], mockKw: ['cufflink'] },
            { words: ['pendant', 'om', 'religious'], mockKw: ['pendant', 'om'] },
          ];

          for (const type of types) {
            const nameMatch = type.words.some(w => name.includes(w));
            const mockMatch = type.mockKw.some(w => mName.includes(w));
            if (nameMatch && mockMatch) score += 20;
          }

          if (score > bestScore) {
            bestScore = score;
            bestMock = mp;
          }
        }

        // Only return a match if there's at least some meaningful similarity (score > 0)
        // Otherwise return null (show placeholder gem icon instead of wrong image)
        return bestScore > 0 ? bestMock?.image : null;
      };

      const productsData = snapshot.docs.map(document => {
        const data = document.data();
        let img = data.image;

        // 1. If it's a valid external URL (Cloudinary, ImgBB, Firebase Storage, etc.) — trust it as-is
        const isValidUrl = img && typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image'));
        if (isValidUrl) {
          // Valid real URL — use it directly, no override
        } else if (img && typeof img === 'string' && img.includes('/src/assets')) {
          // It's a stale local dev path — find real imported image via mock match
          const exactMock = mockProducts.find(mp => mp.sku === data.sku || mp.name === data.name);
          img = exactMock ? exactMock.image : getBestMockImage(data);
        } else {
          // No image at all — find best match by name/category/SKU
          const exactMock = mockProducts.find(mp => mp.sku === data.sku || mp.name === data.name);
          img = exactMock ? exactMock.image : getBestMockImage(data);
        }

        return {
          id: document.id,
          ...data,
          image: img,
          _needsStoreAssignment: usingFallback && !data.storeId,
        };
      }).filter(p => !p.storeId || p.storeId === 'GLOBAL' || p.storeId === activeStoreId);

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
