import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';
import { getStoreQuery } from '../utils/storeQuery';
import { logError } from '../services/logger';
import { useApprovals } from './useApprovals';
import { useApp } from '../context/AppContext';

export function useFinance(activeStoreId = null) {
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vendorPayments, setVendorPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { submitApprovalRequest } = useApprovals(activeStoreId);
  const { user } = useApp();
  const userRole = user?.role || 'staff';

  const fetchFinanceData = useCallback(async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let txQuery, expQuery, vpQuery;
      try {
        const constraints = [orderBy('createdAt', 'desc')];
        txQuery = getStoreQuery(db, 'transactions', activeStoreId, constraints);
        expQuery = getStoreQuery(db, 'expenses', activeStoreId, constraints);
        vpQuery = getStoreQuery(db, 'vendor_payments', activeStoreId, constraints);
      } catch (isolationError) {
        console.warn(isolationError.message);
        setTransactions([]);
        setExpenses([]);
        setVendorPayments([]);
        setLoading(false);
        return;
      }

      const [txSnap, expSnap, vpSnap] = await Promise.all([
        getDocs(txQuery),
        getDocs(expQuery),
        getDocs(vpQuery)
      ]);

      setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setExpenses(expSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setVendorPayments(vpSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (err) {
      console.error("Error fetching finance data:", err);
      logError(err, { context: 'fetchFinanceData', activeStoreId });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeStoreId]);

  useEffect(() => {
    setTransactions([]);
    setExpenses([]);
    setVendorPayments([]);
    fetchFinanceData();
  }, [fetchFinanceData]);

  const addTransaction = async (data) => {
    if (!activeStoreId || activeStoreId === 'NONE') {
      throw new Error("Cannot add transaction without an active store context.");
    }
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      storeId: activeStoreId === 'GLOBAL' ? (data.storeId || 'GLOBAL') : activeStoreId
    };
    if (userRole === 'staff') {
      await submitApprovalRequest('FINANCE_ADJUSTMENT', payload, null, 'Finance');
      return { status: 'pending' };
    }
    return await addDoc(collection(db, 'transactions'), payload);
  };

  const addExpense = async (data) => {
    if (!activeStoreId || activeStoreId === 'NONE') {
      throw new Error("Cannot add expense without an active store context.");
    }
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      storeId: activeStoreId === 'GLOBAL' ? (data.storeId || 'GLOBAL') : activeStoreId
    };
    if (userRole === 'staff') {
      await submitApprovalRequest('FINANCE_ADJUSTMENT', payload, null, 'Finance');
      return { status: 'pending' };
    }
    return await addDoc(collection(db, 'expenses'), payload);
  };

  const addVendorPayment = async (data) => {
    if (!activeStoreId || activeStoreId === 'NONE') {
      throw new Error("Cannot add vendor payment without an active store context.");
    }
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      storeId: activeStoreId === 'GLOBAL' ? (data.storeId || 'GLOBAL') : activeStoreId
    };
    if (userRole === 'staff') {
      await submitApprovalRequest('VENDOR_PAYMENT', payload, null, 'Finance');
      return { status: 'pending' };
    }
    return await addDoc(collection(db, 'vendor_payments'), payload);
  };

  return {
    transactions,
    expenses,
    vendorPayments,
    loading,
    error,
    refreshData: fetchFinanceData,
    addTransaction,
    addExpense,
    addVendorPayment
  };
}
