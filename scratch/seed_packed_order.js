import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCDlAkj_zPOOr0BFAFkFjBxCaoTNjNDTU",
  authDomain: "jewellery-website-50d32.firebaseapp.com",
  projectId: "jewellery-website-50d32",
  storageBucket: "jewellery-website-50d32.firebasestorage.app",
  messagingSenderId: "629829902057",
  appId: "1:629829902057:web:3ae0fabf6f6b9971cd1a78"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const orderId = "J615j5c03N9ZG5FiImho";
  console.log(`Updating order ${orderId} status to 'packed'...`);
  
  // Update order status to 'packed'
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: 'packed',
    deliveryPartnerId: null, // clear any previous assignments so it shows as pending assignment
    deliveryPartnerName: null,
    updatedAt: serverTimestamp()
  });
  console.log(`✅ Order ${orderId} updated successfully.`);

  // Check if shipment exists
  console.log(`Checking shipment for order ${orderId}...`);
  const shipmentsQuery = query(collection(db, 'shipments'), where('orderId', '==', orderId));
  const shipmentsSnap = await getDocs(shipmentsQuery);
  
  if (!shipmentsSnap.empty) {
    const shipmentDoc = shipmentsSnap.docs[0];
    console.log(`Updating existing shipment ${shipmentDoc.id}...`);
    await updateDoc(doc(db, 'shipments', shipmentDoc.id), {
      status: 'PACKED',
      storeId: 'OCoSBsKDGGOT5NOqZpP1',
      assignedTo: null,
      assignedPartnerName: null,
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Shipment ${shipmentDoc.id} updated to PACKED.`);
  } else {
    console.log(`Creating new shipment for order ${orderId}...`);
    const newShipmentRef = doc(collection(db, 'shipments'));
    await setDoc(newShipmentRef, {
      orderId: orderId,
      status: 'PACKED',
      storeId: 'OCoSBsKDGGOT5NOqZpP1',
      customerId: 'BgjSjNatv8XNwDmF1aqFXSmA3Ys1',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ New shipment created with ID ${newShipmentRef.id}.`);
  }
}

seed().catch(err => {
  console.error("Error seeding order:", err);
  process.exit(1);
});
