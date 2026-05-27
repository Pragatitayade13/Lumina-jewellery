const { db } = require('../config/firebase');

const COLLECTION = 'jewellery';

const docToItem = (doc) => ({ id: doc.id, ...doc.data() });

exports.getProducts = async (req, res) => {
  try {
    const { search, category, material, stockStatus } = req.query;

    let query = db.collection(COLLECTION);

    if (category) query = query.where('category', '==', category);
    if (material) query = query.where('material', '==', material);

    if (stockStatus === 'out') {
      query = query.where('stock', '==', 0);
    } else if (stockStatus === 'low') {
      query = query.where('stock', '>', 0).where('stock', '<=', 5);
    } else if (stockStatus === 'in') {
      query = query.where('stock', '>', 5);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    let items = snapshot.docs.map(docToItem);

    if (search) {
      const term = search.toLowerCase();
      items = items.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.sku && item.sku.toLowerCase().includes(term))
      );
    }

    res.json(items);
  } catch (error) {
    console.error('GET /products error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Jewellery item not found' });
    }
    res.json(docToItem(doc));
  } catch (error) {
    console.error('GET /products/:id error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, sku, category, material, purity, weight, price, stock, imageUrl, description, businessId } = req.body;

    if (!name || !sku || !category || !material || !purity || weight == null || price == null) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const skuSnap = await db.collection(COLLECTION).where('sku', '==', sku).limit(1).get();
    if (!skuSnap.empty) {
      return res.status(400).json({ message: 'An item with this SKU/Code already exists' });
    }

    const newItem = {
      name, sku, category, material, purity,
      weight: Number(weight),
      price: Number(price),
      stock: Number(stock ?? 0),
      imageUrl: imageUrl || '',
      description: description || '',
      businessId: businessId || 'default', // For multi-tenant later
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(newItem);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    console.error('POST /products error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Jewellery item not found' });
    }

    const existing = doc.data();
    const { name, sku, category, material, purity, weight, price, stock, imageUrl, description } = req.body;

    if (sku && sku !== existing.sku) {
      const skuSnap = await db.collection(COLLECTION).where('sku', '==', sku).limit(1).get();
      if (!skuSnap.empty) {
        return res.status(400).json({ message: 'An item with this SKU/Code already exists' });
      }
    }

    const updatedFields = {
      name: name ?? existing.name,
      sku: sku ?? existing.sku,
      category: category ?? existing.category,
      material: material ?? existing.material,
      purity: purity ?? existing.purity,
      weight: weight != null ? Number(weight) : existing.weight,
      price: price != null ? Number(price) : existing.price,
      stock: stock != null ? Number(stock) : existing.stock,
      imageUrl: imageUrl ?? existing.imageUrl,
      description: description ?? existing.description,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedFields);
    res.json({ id: req.params.id, ...updatedFields });
  } catch (error) {
    console.error('PUT /products/:id error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Jewellery item not found' });
    }

    await docRef.delete();
    res.json({ message: 'Jewellery item deleted successfully' });
  } catch (error) {
    console.error('DELETE /products/:id error:', error);
    res.status(500).json({ message: error.message });
  }
};
