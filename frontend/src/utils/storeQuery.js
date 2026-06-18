import { collection, query, where } from 'firebase/firestore';

/**
 * Custom Error thrown when store isolation is violated
 */
export class StoreIsolationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StoreIsolationError';
  }
}

/**
 * Creates a Firestore query that is securely scoped to the active store.
 * 
 * @param {Firestore} db The Firestore instance
 * @param {string} collectionName The name of the collection to query
 * @param {string} activeStoreId The currently selected store ID
 * @param {Array} additionalConstraints Any extra where/orderBy/limit constraints
 * @returns {Query} The built Firestore query
 * @throws {StoreIsolationError} If activeStoreId is invalid, missing, or 'NONE'
 */
export function getStoreQuery(db, collectionName, activeStoreId, additionalConstraints = []) {
  if (!activeStoreId || activeStoreId === 'NONE') {
    throw new StoreIsolationError(`Data fetch aborted: No active store selected for collection '${collectionName}'.`);
  }

  const baseCollection = collection(db, collectionName);
  const constraints = [...additionalConstraints];

  // Apply isolation filter unless it's a superadmin viewing GLOBAL
  if (activeStoreId !== 'GLOBAL') {
    constraints.unshift(where('storeId', '==', activeStoreId));
  }

  return query(baseCollection, ...constraints);
}
