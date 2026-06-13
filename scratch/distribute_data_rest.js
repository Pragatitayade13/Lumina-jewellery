import fs from 'fs';

// Read firebase-tools config to get the token
const config = JSON.parse(fs.readFileSync('C:/Users/praga/.config/configstore/firebase-tools.json', 'utf8'));
const token = config.tokens.access_token;
const projectId = 'jewellery-website-50d32';

const storeA = 'OCoSBsKDGGOT5NOqZpP1'; // Khandelval
const storeB = 'eoNjBBBlw1edDfPWufPD'; // gold and jems

async function run() {
  console.log("Fetching orders from Firestore REST API...");
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders?pageSize=100`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch orders: ${res.statusText} - ${errText}`);
  }

  const data = await res.json();
  const documents = data.documents || [];
  console.log(`Found ${documents.length} orders. Distributing...`);

  let count = 0;
  for (const doc of documents) {
    const docName = doc.name; // e.g., projects/jewellery-website-50d32/databases/(default)/documents/orders/someId
    const orderId = docName.split('/').pop();
    const currentStoreId = doc.fields?.storeId?.stringValue;

    const targetStore = (count % 2 === 0) ? storeA : storeB;
    console.log(`Order ${orderId} is currently store ${currentStoreId || 'none'}. Target: ${targetStore === storeA ? 'Khandelval' : 'Gold & Jems'}`);

    // Update Order storeId
    const updateRes = await fetch(`https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=storeId`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: docName,
        fields: {
          ...doc.fields,
          storeId: { stringValue: targetStore }
        }
      })
    });

    if (!updateRes.ok) {
      console.error(`Failed to update order ${orderId}: ${updateRes.statusText}`);
    }

    // Now update other collections related to this orderId: shipments, invoices, transactions, expenses
    const collections = ['shipments', 'invoices', 'transactions', 'expenses'];
    for (const col of collections) {
      // Search for documents in this collection with orderId == orderId
      const searchRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: col }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'orderId' },
                op: 'EQUAL',
                value: { stringValue: orderId }
              }
            }
          }
        })
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        // searchData is an array of query results
        for (const result of searchData) {
          if (result.document) {
            const subDocName = result.document.name;
            const subDocFields = result.document.fields || {};
            
            // Update storeId
            const subUpdateRes = await fetch(`https://firestore.googleapis.com/v1/${subDocName}?updateMask.fieldPaths=storeId`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: subDocName,
                fields: {
                  ...subDocFields,
                  storeId: { stringValue: targetStore }
                }
              })
            });
            if (subUpdateRes.ok) {
              console.log(`  Updated ${col} document storeId to ${targetStore}`);
            } else {
              console.error(`  Failed to update ${col} document: ${subUpdateRes.statusText}`);
            }
          }
        }
      }
    }

    count++;
  }

  console.log("Distribution finished successfully!");
}

run().catch(console.error);
