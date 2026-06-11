import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, doc, updateDoc, serverTimestamp, setDoc, addDoc, increment, writeBatch } from 'firebase/firestore';
import { inventory as mockInventory, products as mockProducts } from '../admin/data/mockData';
import { getStoreQuery, StoreIsolationError } from '../utils/storeQuery';
import { onSnapshot } from 'firebase/firestore';
import { useAudit } from './useAudit';
import { useApprovals } from './useApprovals';
import { useApp } from '../context/AppContext';

export function useInventory(activeStoreId = null) {
  const [inventory, setInventory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stockTransfers, setStockTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logAudit } = useAudit(activeStoreId);
  const { submitApprovalRequest } = useApprovals(activeStoreId);
  const { user } = useApp();
  const userRole = user?.role || 'staff';

  const getFallbackData = () => {
    if (!mockInventory || !mockProducts) return [];
    return mockInventory.map(item => {
      const prod = mockProducts.find(p => p.sku === item.sku);
      return { ...item, price: prod?.price || 50000, mrp: prod?.mrp || 60000 };
    });
  };

  useEffect(() => {
    setLoading(true);

    if (!db) {
      setInventory(getFallbackData());
      setLoading(false);
      return;
    }

    let q;
    let poQuery;
    let transferQuery;

    try {
      q = getStoreQuery(db, 'inventory', activeStoreId);
      poQuery = getStoreQuery(db, 'purchase_orders', activeStoreId);
      transferQuery = getStoreQuery(db, 'stock_transfers', activeStoreId);
    } catch (err) {
      if (err instanceof StoreIsolationError) {
        console.warn(err.message);
        setInventory([]);
        setPurchaseOrders([]);
        setStockTransfers([]);
        setLoading(false);
        return;
      }
      throw err;
    }
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Ensure mock items exist in Firebase (seed missing items)
      if (mockInventory) {
        try {
          const currentStoreId = activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'DEFAULT';
          const existingSkus = new Set(snapshot.docs.map(doc => doc.id));
          
          // Show different products for different stores based on storeId hash,
          // except DEFAULT/GLOBAL which get all items.
          const targetMockItems = mockInventory.filter(item => {
            if (currentStoreId === 'DEFAULT' || currentStoreId === 'GLOBAL') return true;
            const hash = (currentStoreId + item.sku).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            return hash % 2 === 0; // ~50% of items per store
          });

          const missingItems = targetMockItems.filter(item => !existingSkus.has(`${currentStoreId}_${item.sku}`));
          
          if (missingItems.length > 0) {
            console.log("Seeding missing items for store:", currentStoreId, missingItems.length);
            const batch = writeBatch(db);
            missingItems.forEach(item => {
              const compositeId = `${currentStoreId}_${item.sku}`;
              const docRef = doc(db, 'inventory', compositeId);
              batch.set(docRef, {
                ...item,
                price: item.price || Math.floor(Math.random() * 50000) + 10000,
                storeId: currentStoreId,
                updatedAt: serverTimestamp()
              });
            });
            await batch.commit();
            // Let the subsequent snapshot handle the update to avoid partial states
            return;
          }
        } catch (e) {
          console.error("Error seeding missing inventory:", e);
        }
      }

      const inventoryData = snapshot.docs.map(doc => {
        const data = doc.data();
        let status = 'ok';
        if (data.stock === 0) status = 'out';
        else if (data.stock <= Math.floor(data.minStock / 2)) status = 'critical';
        else if (data.stock <= data.minStock) status = 'low';

        // Helper to format last updated time
        const formatTime = (date) => {
          if (!date) return 'Just now';
          const diffMs = new Date() - date;
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffHrs / 24);
          if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          if (diffHrs > 0) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
          const diffMins = Math.floor(diffMs / 60000);
          return `${diffMins || 1} min ago`;
        };

        // Inject image from mockInventory if missing in DB, or replace local dev artifacts
        let image = data.image || '';
        let subcategory = data.subcategory || '';
        const mockItem = mockInventory?.find(m => m.sku === (data.sku || doc.id));
        
        // Fix for Vercel: Local DB might contain /src/assets paths. Override with bundled imports.
        if (image && image.includes('/src/assets') && mockItem) {
          image = mockItem.image;
        }

        if (!image || !subcategory) {
          if (mockItem) {
            if (!image) image = mockItem.image || '';
            if (!subcategory) subcategory = mockItem.subcategory || '';
          }
        }

        return {
          id: doc.id,
          sku: data.sku || doc.id.split('_').pop(),
          name: data.name || 'Unknown Item',
          category: data.category || 'Uncategorized',
          stock: data.stock || 0,
          minStock: data.minStock || 5,
          warehouse: data.warehouse || 'Unassigned',
          price: data.price || 0,
          mrp: data.mrp || data.price || 0,
          weight: data.weight || '',
          purity: data.purity || '',
          image: image,
          subcategory: subcategory,
          badge: data.badge || null,
          lastUpdated: formatTime(data.updatedAt?.toDate()),
          status: status,
          storeId: data.storeId || 'DEFAULT'
        };
      });
      setInventory(inventoryData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching inventory (likely permissions):", err);
      // Fallback to mock inventory so the store isn't empty!
      setInventory(getFallbackData());
      setLoading(false);
      setError(err);
    });

    const unsubscribePO = onSnapshot(poQuery, (snapshot) => {
      const poData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toLocaleDateString('en-GB') || 'Just now'
      }));
      setPurchaseOrders(poData);
    }, (err) => console.error("Error fetching POs:", err));

    const unsubscribeTransfers = onSnapshot(transferQuery, (snapshot) => {
      const transferData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString('en-GB') || 'Just now'
      }));
      setStockTransfers(transferData);
    }, (err) => console.error("Error fetching Transfers:", err));

    return () => {
      unsubscribe();
      unsubscribePO();
      unsubscribeTransfers();
    };
  }, [activeStoreId]);

  const updateStock = async (id, updateData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      if (userRole === 'staff') {
        await submitApprovalRequest('INVENTORY_ADJUSTMENT', updateData, id, 'Inventory');
        return { status: 'pending' };
      }
      
      const docRef = doc(db, 'inventory', id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      await logAudit('INVENTORY_ADJUSTED', 'Inventory', id, null, updateData);
    } catch (err) {
      console.error("Error updating stock:", err);
      throw err;
    }
  };

  const addPurchaseOrder = async (poData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      if (!activeStoreId || activeStoreId === 'NONE') {
        throw new Error("Cannot add purchase order without active store context");
      }
      const docRef = await addDoc(collection(db, 'purchase_orders'), {
        ...poData,
        status: 'pending',
        storeId: activeStoreId,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error("Error creating purchase order:", err);
      throw err;
    }
  };

  const receivePurchaseOrder = async (poId, sku, quantity) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      await updateDoc(doc(db, 'purchase_orders', poId), {
        status: 'received',
        updatedAt: serverTimestamp()
      });
      const currentStoreId = activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'DEFAULT';
      const compositeId = `${currentStoreId}_${sku}`;
      await updateDoc(doc(db, 'inventory', compositeId), {
        stock: increment(quantity),
        updatedAt: serverTimestamp()
      });
      await logAudit('INVENTORY_ADJUSTED', 'Inventory', compositeId, null, { stockIncrement: quantity, reason: 'PO Received' });
    } catch (err) {
      console.error("Error receiving PO:", err);
      throw err;
    }
  };

  const addStockTransfer = async (transferData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      if (!activeStoreId || activeStoreId === 'NONE') {
        throw new Error("Cannot add stock transfer without active store context");
      }
      
      if (userRole === 'staff') {
        await submitApprovalRequest('STOCK_TRANSFER', transferData, transferData.sku, 'Inventory');
        return { status: 'pending' };
      }

      const docRef = await addDoc(collection(db, 'stock_transfers'), {
        ...transferData,
        status: 'completed',
        storeId: activeStoreId,
        createdAt: serverTimestamp()
      });
      
      const currentStoreId = activeStoreId;
      const compositeId = `${currentStoreId}_${transferData.sku}`;
      
      // Update the warehouse of the existing SKU to reflect the transfer
      await updateDoc(doc(db, 'inventory', compositeId), {
        warehouse: transferData.to,
        updatedAt: serverTimestamp()
      });
      
      await logAudit('STOCK_TRANSFERRED', 'Inventory', compositeId, { warehouse: transferData.from }, { warehouse: transferData.to });
      
      return docRef.id;
    } catch (err) {
      console.error("Error logging stock transfer:", err);
      throw err;
    }
  };

  return { inventory, purchaseOrders, stockTransfers, loading, error, updateStock, addPurchaseOrder, receivePurchaseOrder, addStockTransfer };
}
