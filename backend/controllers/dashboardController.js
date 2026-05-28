const { db } = require('../config/firebase');

exports.getStats = async (req, res) => {
  try {
    // In a real app, you would query orders and products for the specific businessId.
    // For Phase 1, we will return some mock aggregated stats or basic counts.
    
    const productsSnap = await db.collection('jewellery').get();
    const totalProducts = productsSnap.size;
    
    let lowStockCount = 0;
    productsSnap.forEach(doc => {
      const data = doc.data();
      if (data.stock <= 5) {
        lowStockCount++;
      }
    });

    res.json({
      revenue: 125000,
      sales: 45,
      totalInventory: totalProducts,
      lowStockAlerts: lowStockCount,
      recentOrders: [
        { id: 'ORD001', customer: 'John Doe', amount: 1500, status: 'Completed' },
        { id: 'ORD002', customer: 'Jane Smith', amount: 3200, status: 'Pending' }
      ]
    });
  } catch (error) {
    console.error('Dashboard Stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};
