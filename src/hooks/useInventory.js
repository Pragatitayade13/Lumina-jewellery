import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, setDoc, addDoc, increment } from 'firebase/firestore';
import { inventory as mockInventory, products as mockProducts } from '../admin/data/mockData';

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stockTransfers, setStockTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getFallbackData = () => {
    if (!mockInventory || !mockProducts) return [];
    return mockInventory.map(item => {
      const prod = mockProducts.find(p => p.sku === item.sku);
      return { ...item, price: prod?.price || 50000, mrp: prod?.mrp || 60000 };
    });
  };

  useEffect(() => {
    if (!db) {
      setInventory(getFallbackData());
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'inventory'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Ensure all mock items exist in Firebase (seed missing items)
      if (mockInventory) {
        try {
          const existingSkus = new Set(snapshot.docs.map(doc => doc.id));
          const missingItems = mockInventory.filter(item => !existingSkus.has(item.sku));
          
          if (missingItems.length > 0) {
            console.log("Seeding missing items...", missingItems.length);
            for (const item of missingItems) {
              await setDoc(doc(db, 'inventory', item.sku), {
                ...item,
                price: item.price || Math.floor(Math.random() * 50000) + 10000,
                updatedAt: serverTimestamp()
              });
            }
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
          sku: data.sku || doc.id,
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
          status: status
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

    const poQuery = query(collection(db, 'purchase_orders'));
    const unsubscribePO = onSnapshot(poQuery, (snapshot) => {
      const poData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toLocaleDateString('en-GB') || 'Just now'
      }));
      setPurchaseOrders(poData);
    }, (err) => console.error("Error fetching POs:", err));

    const transferQuery = query(collection(db, 'stock_transfers'));
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
  }, []);

  const updateStock = async (id, updateData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = doc(db, 'inventory', id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating stock:", err);
      throw err;
    }
  };

  const addPurchaseOrder = async (poData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = await addDoc(collection(db, 'purchase_orders'), {
        ...poData,
        status: 'pending',
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
      await updateDoc(doc(db, 'inventory', sku), {
        stock: increment(quantity)
      });
    } catch (err) {
      console.error("Error receiving PO:", err);
      throw err;
    }
  };

  const addStockTransfer = async (transferData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = await addDoc(collection(db, 'stock_transfers'), {
        ...transferData,
        status: 'completed',
        createdAt: serverTimestamp()
      });
      
      // Update the warehouse of the existing SKU to reflect the transfer
      await updateDoc(doc(db, 'inventory', transferData.sku), {
        warehouse: transferData.to,
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (err) {
      console.error("Error logging stock transfer:", err);
      throw err;
    }
  };

  return { inventory, purchaseOrders, stockTransfers, loading, error, updateStock, addPurchaseOrder, receivePurchaseOrder, addStockTransfer };
}
