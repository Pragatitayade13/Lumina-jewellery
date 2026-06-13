/**
 * Database Migration Script: Initialize Store Management Data
 * 
 * This script initializes the default stores for Phase 1 of Multi-Store support.
 * In a real production setup, this would be executed via Node.js locally
 * using the Firebase Admin SDK.
 * 
 * Usage:
 * node scripts/migrateStores.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// WARNING: You must provide your own serviceAccountKey.json to run this.
// const serviceAccount = require('./serviceAccountKey.json');

/*
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
*/

async function migrateStores(db) {
  console.log("Starting Store Management Migration...");

  try {
    // 1. Check if stores collection exists or has documents
    const storesSnapshot = await db.collection('stores').limit(1).get();
    
    if (!storesSnapshot.empty) {
      console.log("Stores collection already exists. Migration skipped.");
      return;
    }

    console.log("Initializing default 'Headquarters' store...");

    // 2. Add Default Store
    const hqStoreRef = db.collection('stores').doc();
    await hqStoreRef.set({
      name: 'Main Headquarters',
      code: 'HQ-01',
      address: '123 Luxury Avenue, Mumbai, India',
      contactPhone: '+91 9876543210',
      contactEmail: 'hq@luminajewels.com',
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log(`Successfully created HQ store with ID: ${hqStoreRef.id}`);

    // Note: userStores collection will be created automatically when 
    // Super Admin assigns a user to a store from the UI.
    
    console.log("Migration completed successfully.");

  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// migrateStores(db);
module.exports = { migrateStores };
