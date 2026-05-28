// src/admin/data/mockData.js
import imgDiamondNecklace from '../../assets/products/diamond_necklace_set.png';
import imgGoldJhumka from '../../assets/products/gold_jhumka_earrings.png';
import imgTempleNecklace from '../../assets/products/antique_temple_necklace.png';
import imgPolkiChoker from '../../assets/products/polki_kundan_choker.png';
import imgSolitaireRing from '../../assets/products/solitaire_diamond_ring.png';
import imgDiamondMangalsutra from '../../assets/products/diamond_mangalsutra.png';
import imgPlatinumRing from '../../assets/products/platinum_solitaire_ring.png';
import imgMaangTikka from '../../assets/products/bridal_maang_tikka.png';

export const adminUsers = [
  { id: 1, name: 'Priya Sharma', email: 'priya@luminajewels.com', role: 'superadmin', department: 'Management', status: 'active', lastLogin: '2 min ago', joinDate: '15 Jan 2021', avatar: 'PS', avatarColor: '#C9A84C' },
  { id: 2, name: 'Rahul Kumar', email: 'rahul@luminajewels.com', role: 'manager', department: 'Products', status: 'active', lastLogin: '1 hr ago', joinDate: '10 Jun 2021', avatar: 'RK', avatarColor: '#9b59b6' },
  { id: 3, name: 'Anita Patel', email: 'anita@luminajewels.com', role: 'staff', department: 'Orders', status: 'active', lastLogin: '3 hr ago', joinDate: '20 Feb 2022', avatar: 'AP', avatarColor: '#3498db' },
  { id: 4, name: 'Vikram Singh', email: 'vikram@luminajewels.com', role: 'staff', department: 'Inventory', status: 'inactive', lastLogin: '2 days ago', joinDate: '05 Apr 2022', avatar: 'VS', avatarColor: '#e74c3c' },
  { id: 5, name: 'Deepa Nair', email: 'deepa@luminajewels.com', role: 'manager', department: 'Marketing', status: 'active', lastLogin: '30 min ago', joinDate: '12 Nov 2021', avatar: 'DN', avatarColor: '#2ecc71' },
  { id: 6, name: 'Amit Shah', email: 'amit@luminajewels.com', role: 'staff', department: 'Support', status: 'blocked', lastLogin: '1 week ago', joinDate: '08 Jan 2023', avatar: 'AS', avatarColor: '#f39c12' },
  { id: 7, name: 'Neha Joshi', email: 'neha@luminajewels.com', role: 'staff', department: 'Content', status: 'active', lastLogin: '4 hr ago', joinDate: '22 Mar 2023', avatar: 'NJ', avatarColor: '#1abc9c' },
  { id: 8, name: 'Karan Mehta', email: 'karan@luminajewels.com', role: 'manager', department: 'Finance', status: 'active', lastLogin: '1 hr ago', joinDate: '09 Sep 2022', avatar: 'KM', avatarColor: '#e67e22' },
];

export const products = [
  { id: 1, name: 'Royal Diamond Necklace Set', category: 'Diamond Jewellery', subcategory: 'Diamond Necklaces', price: 285000, mrp: 320000, stock: 12, status: 'active', sku: 'DN-2026-001', weight: '45g', purity: '18KT + VS1', badge: 'bestseller', image: imgDiamondNecklace },
  { id: 2, name: 'Polki Kundan Bridal Choker', category: 'Bridal Collections', subcategory: 'Bridal Choker Sets', price: 165000, mrp: 195000, stock: 5, status: 'active', sku: 'BC-2026-014', weight: '78g', purity: '22KT', badge: 'new', image: imgPolkiChoker },
  { id: 3, name: 'Solitaire Diamond Ring 1.5ct', category: 'Diamond Jewellery', subcategory: 'Solitaire Collection', price: 195000, mrp: 225000, stock: 8, status: 'active', sku: 'DR-2026-007', weight: '8.2g', purity: '18KT + VVS2', badge: 'hot', image: imgSolitaireRing },
  { id: 4, name: 'Gold Jhumka Earrings 22KT', category: 'Gold Jewellery', subcategory: 'Gold Earrings', price: 45000, mrp: 52000, stock: 24, status: 'active', sku: 'GE-2026-032', weight: '22g', purity: '22KT', badge: null, image: imgGoldJhumka },
  { id: 5, name: 'Antique Temple Necklace', category: 'Necklaces', subcategory: 'Temple Necklaces', price: 92000, mrp: 108000, stock: 0, status: 'out_of_stock', sku: 'TN-2026-009', weight: '65g', purity: '22KT', badge: null, image: imgTempleNecklace },
  { id: 6, name: 'Diamond Mangalsutra Modern', category: 'Gold Jewellery', subcategory: 'Gold Mangalsutra', price: 78000, mrp: 90000, stock: 15, status: 'active', sku: 'GM-2026-021', weight: '18g', purity: '18KT', badge: 'bestseller', image: imgDiamondMangalsutra },
  { id: 7, name: 'Platinum Solitaire Ring', category: 'Rings', subcategory: 'Platinum Rings', price: 145000, mrp: 168000, stock: 6, status: 'active', sku: 'PR-2026-003', weight: '5.8g', purity: 'PT950', badge: 'new', image: imgPlatinumRing },
  { id: 8, name: 'Bridal Maang Tikka Polki', category: 'Bridal Collections', subcategory: 'Bridal Maang Tikka', price: 55000, mrp: 65000, stock: 9, status: 'active', sku: 'BM-2026-011', weight: '35g', purity: '22KT', badge: null, image: imgMaangTikka },
];

export const orders = [
  { id: '#LJ-7891', customer: 'Meera Krishnan', email: 'meera@email.com', product: 'Royal Diamond Necklace Set', amount: 285000, status: 'delivered', date: '27 May 2026', paymentMethod: 'UPI', city: 'Mumbai' },
  { id: '#LJ-7890', customer: 'Sunita Rao', email: 'sunita@email.com', product: 'Polki Kundan Choker', amount: 165000, status: 'shipped', date: '27 May 2026', paymentMethod: 'Credit Card', city: 'Bangalore' },
  { id: '#LJ-7889', customer: 'Ritu Mehta', email: 'ritu@email.com', product: 'Solitaire Diamond Ring', amount: 195000, status: 'confirmed', date: '26 May 2026', paymentMethod: 'Net Banking', city: 'Delhi' },
  { id: '#LJ-7888', customer: 'Kavya Nair', email: 'kavya@email.com', product: 'Gold Jhumka Earrings', amount: 45000, status: 'pending', date: '26 May 2026', paymentMethod: 'UPI', city: 'Kochi' },
  { id: '#LJ-7887', customer: 'Ananya Gupta', email: 'ananya@email.com', product: 'Diamond Mangalsutra', amount: 78000, status: 'delivered', date: '25 May 2026', paymentMethod: 'EMI', city: 'Pune' },
  { id: '#LJ-7886', customer: 'Pooja Sharma', email: 'pooja@email.com', product: 'Bridal Maang Tikka', amount: 55000, status: 'cancelled', date: '25 May 2026', paymentMethod: 'Credit Card', city: 'Chennai' },
  { id: '#LJ-7885', customer: 'Lakshmi Iyer', email: 'lakshmi@email.com', product: 'Platinum Solitaire Ring', amount: 145000, status: 'shipped', date: '24 May 2026', paymentMethod: 'UPI', city: 'Hyderabad' },
  { id: '#LJ-7884', customer: 'Priya Verma', email: 'priya@email.com', product: 'Antique Temple Necklace', amount: 92000, status: 'delivered', date: '24 May 2026', paymentMethod: 'Net Banking', city: 'Jaipur' },
  { id: '#LJ-7883', customer: 'Sneha Kapoor', email: 'sneha@email.com', product: 'Gold Jhumka Earrings', amount: 45000, status: 'delivered', date: '23 May 2026', paymentMethod: 'UPI', city: 'Mumbai' },
  { id: '#LJ-7882', customer: 'Radha Pillai', email: 'radha@email.com', product: 'Diamond Mangalsutra', amount: 78000, status: 'confirmed', date: '23 May 2026', paymentMethod: 'Credit Card', city: 'Chennai' },
];

export const customers = [
  { id: 1, name: 'Meera Krishnan', email: 'meera@email.com', phone: '+91 98765 43210', city: 'Mumbai', totalOrders: 8, totalSpent: 685000, loyaltyPoints: 6850, status: 'vip', joinDate: 'Jan 2022', avatar: 'MK', avatarColor: '#9b59b6' },
  { id: 2, name: 'Sunita Rao', email: 'sunita@email.com', phone: '+91 87654 32109', city: 'Bangalore', totalOrders: 5, totalSpent: 425000, loyaltyPoints: 4250, status: 'active', joinDate: 'Mar 2022', avatar: 'SR', avatarColor: '#3498db' },
  { id: 3, name: 'Ritu Mehta', email: 'ritu@email.com', phone: '+91 76543 21098', city: 'Delhi', totalOrders: 12, totalSpent: 1250000, loyaltyPoints: 12500, status: 'vip', joinDate: 'Nov 2021', avatar: 'RM', avatarColor: '#C9A84C' },
  { id: 4, name: 'Kavya Nair', email: 'kavya@email.com', phone: '+91 65432 10987', city: 'Kochi', totalOrders: 2, totalSpent: 90000, loyaltyPoints: 900, status: 'active', joinDate: 'Apr 2026', avatar: 'KN', avatarColor: '#2ecc71' },
  { id: 5, name: 'Ananya Gupta', email: 'ananya@email.com', phone: '+91 54321 09876', city: 'Pune', totalOrders: 7, totalSpent: 520000, loyaltyPoints: 5200, status: 'active', joinDate: 'Jun 2023', avatar: 'AG', avatarColor: '#e74c3c' },
  { id: 6, name: 'Pooja Sharma', email: 'pooja@email.com', phone: '+91 43210 98765', city: 'Chennai', totalOrders: 1, totalSpent: 55000, loyaltyPoints: 550, status: 'inactive', joinDate: 'May 2026', avatar: 'PS', avatarColor: '#f39c12' },
  { id: 7, name: 'Lakshmi Iyer', email: 'lakshmi@email.com', phone: '+91 32109 87654', city: 'Hyderabad', totalOrders: 15, totalSpent: 1850000, loyaltyPoints: 18500, status: 'vip', joinDate: 'Aug 2020', avatar: 'LI', avatarColor: '#1abc9c' },
];

export const inventory = [
  { id: 1, sku: 'DN-2026-001', name: 'Royal Diamond Necklace Set', category: 'Diamond Jewellery', stock: 12, minStock: 5, warehouse: 'Mumbai HQ', lastUpdated: '2 hr ago', status: 'ok' },
  { id: 2, sku: 'BC-2026-014', name: 'Polki Kundan Choker', category: 'Bridal', stock: 5, minStock: 8, warehouse: 'Mumbai HQ', lastUpdated: '1 day ago', status: 'low' },
  { id: 3, sku: 'DR-2026-007', name: 'Solitaire Diamond Ring', category: 'Diamond Jewellery', stock: 8, minStock: 5, warehouse: 'Delhi Vault', lastUpdated: '3 hr ago', status: 'ok' },
  { id: 4, sku: 'GE-2026-032', name: 'Gold Jhumka Earrings', category: 'Gold Jewellery', stock: 24, minStock: 10, warehouse: 'Mumbai HQ', lastUpdated: '5 hr ago', status: 'ok' },
  { id: 5, sku: 'TN-2026-009', name: 'Antique Temple Necklace', category: 'Necklaces', stock: 0, minStock: 5, warehouse: 'Mumbai HQ', lastUpdated: '2 days ago', status: 'out' },
  { id: 6, sku: 'GM-2026-021', name: 'Diamond Mangalsutra', category: 'Gold Jewellery', stock: 3, minStock: 8, warehouse: 'Bangalore', lastUpdated: '6 hr ago', status: 'critical' },
  { id: 7, sku: 'PR-2026-003', name: 'Platinum Solitaire Ring', category: 'Rings', stock: 6, minStock: 5, warehouse: 'Delhi Vault', lastUpdated: '1 day ago', status: 'ok' },
  { id: 8, sku: 'BM-2026-011', name: 'Bridal Maang Tikka', category: 'Bridal', stock: 9, minStock: 6, warehouse: 'Mumbai HQ', lastUpdated: '4 hr ago', status: 'ok' },
];

export const transactions = [
  { id: '#TXN-28471', orderId: '#LJ-7891', customer: 'Meera Krishnan', amount: 285000, method: 'UPI', gateway: 'Razorpay', status: 'success', date: '27 May 2026, 2:14 PM' },
  { id: '#TXN-28470', orderId: '#LJ-7890', customer: 'Sunita Rao', amount: 165000, method: 'Credit Card', gateway: 'Stripe', status: 'success', date: '27 May 2026, 11:30 AM' },
  { id: '#TXN-28469', orderId: '#LJ-7889', customer: 'Ritu Mehta', amount: 195000, method: 'Net Banking', gateway: 'Razorpay', status: 'success', date: '26 May 2026, 6:45 PM' },
  { id: '#TXN-28468', orderId: '#LJ-7888', customer: 'Kavya Nair', amount: 45000, method: 'UPI', gateway: 'Razorpay', status: 'pending', date: '26 May 2026, 3:20 PM' },
  { id: '#TXN-28467', orderId: '#LJ-7887', customer: 'Ananya Gupta', amount: 78000, method: 'EMI', gateway: 'HDFC', status: 'success', date: '25 May 2026, 10:15 AM' },
  { id: '#TXN-28466', orderId: '#LJ-7886', customer: 'Pooja Sharma', amount: 55000, method: 'Credit Card', gateway: 'Stripe', status: 'refunded', date: '25 May 2026, 8:50 AM' },
  { id: '#TXN-28465', orderId: '#LJ-7885', customer: 'Lakshmi Iyer', amount: 145000, method: 'UPI', gateway: 'PhonePe', status: 'success', date: '24 May 2026, 5:30 PM' },
  { id: '#TXN-28464', orderId: '#LJ-X882', customer: 'Unknown', amount: 10000, method: 'Credit Card', gateway: 'Stripe', status: 'failed', date: '24 May 2026, 1:00 AM' },
];

export const revenueData = [
  { month: 'Jan', revenue: 1250000 },
  { month: 'Feb', revenue: 980000 },
  { month: 'Mar', revenue: 1650000 },
  { month: 'Apr', revenue: 1420000 },
  { month: 'May', revenue: 2180000 },
  { month: 'Jun', revenue: 1890000 },
  { month: 'Jul', revenue: 2450000 },
  { month: 'Aug', revenue: 2100000 },
  { month: 'Sep', revenue: 1780000 },
  { month: 'Oct', revenue: 2800000 },
  { month: 'Nov', revenue: 3200000 },
  { month: 'Dec', revenue: 4100000 },
];

export const categoryRevenue = [
  { name: 'Diamond Jewellery', value: 38, color: '#3498db' },
  { name: 'Gold Jewellery', value: 29, color: '#C9A84C' },
  { name: 'Bridal Collections', value: 18, color: '#9b59b6' },
  { name: 'Silver Jewellery', value: 8, color: '#95a5a6' },
  { name: 'Others', value: 7, color: '#e74c3c' },
];

export const orderStatusData = [
  { label: 'Delivered', value: 68, color: '#2ecc71' },
  { label: 'Shipped', value: 15, color: '#3498db' },
  { label: 'Confirmed', value: 10, color: '#f39c12' },
  { label: 'Pending', value: 5, color: '#9b59b6' },
  { label: 'Cancelled', value: 2, color: '#e74c3c' },
];

export const activities = [
  { icon: '🛍️', color: 'rgba(46,204,113,0.15)', text: '<strong>New order #LJ-7891</strong> placed by Meera Krishnan for ₹2,85,000', time: '2 minutes ago' },
  { icon: '👤', color: 'rgba(52,152,219,0.15)', text: '<strong>Rahul Kumar</strong> updated product catalog — 3 items modified', time: '15 minutes ago' },
  { icon: '📦', color: 'rgba(243,156,18,0.15)', text: 'Low stock alert: <strong>Polki Kundan Choker</strong> — only 5 units left', time: '1 hour ago' },
  { icon: '💳', color: 'rgba(201,168,76,0.15)', text: 'Payment of <strong>₹1,65,000</strong> received via Credit Card — Sunita Rao', time: '2 hours ago' },
  { icon: '⭐', color: 'rgba(155,89,182,0.15)', text: 'New 5-star review from <strong>Ritu Mehta</strong> on Solitaire Diamond Ring', time: '3 hours ago' },
  { icon: '🚨', color: 'rgba(231,76,60,0.15)', text: 'Failed transaction <strong>#TXN-28464</strong> — Fraud alert raised', time: '4 hours ago' },
];

export const supportTickets = [
  { id: '#TKT-1024', customer: 'Ananya Gupta', subject: 'Order delivery delay', status: 'open', priority: 'high', date: '27 May 2026' },
  { id: '#TKT-1023', customer: 'Kavya Nair', subject: 'Payment deducted, no confirmation', status: 'in_progress', priority: 'urgent', date: '27 May 2026' },
  { id: '#TKT-1022', customer: 'Pooja Sharma', subject: 'Refund status inquiry', status: 'resolved', priority: 'medium', date: '25 May 2026' },
  { id: '#TKT-1021', customer: 'Sunita Rao', subject: 'Sizing issue with ring', status: 'open', priority: 'low', date: '24 May 2026' },
];

export const blogPosts = [
  { id: 1, title: 'Guide to Buying BIS Hallmark Gold Jewellery', status: 'published', author: 'Neha Joshi', date: '20 May 2026', views: 4821 },
  { id: 2, title: 'Top 10 Bridal Jewellery Trends for 2026', status: 'published', author: 'Deepa Nair', date: '15 May 2026', views: 12340 },
  { id: 3, title: 'How to Care for Your Diamond Jewellery', status: 'draft', author: 'Neha Joshi', date: '28 May 2026', views: 0 },
  { id: 4, title: 'Gold vs Platinum — Which is Better?', status: 'scheduled', author: 'Deepa Nair', date: '01 Jun 2026', views: 0 },
];

export const communications = [
  { id: '#CM-1001', type: 'Email Campaign', subject: 'Diwali Special Offer', target: 'VIP Customers', sentDate: '25 Oct 2024', status: 'completed', performance: '45% Open Rate' },
  { id: '#CM-1002', type: 'Automated Alert', subject: 'Order Shipped Notification', target: 'Recent Buyers', sentDate: '27 May 2026', status: 'active', performance: '98% Deliverability' },
  { id: '#CM-1003', type: 'SMS Alert', subject: 'Gold Rate Drop', target: 'All Subscribers', sentDate: '26 May 2026', status: 'completed', performance: '80% Read' },
];

export const appointments = [
  { id: '#APT-501', customer: 'Lakshmi Iyer', type: 'Bridal Consultation', date: '30 May 2026', time: '14:00', status: 'confirmed', location: 'Mumbai HQ' },
  { id: '#APT-502', customer: 'Ananya Gupta', type: 'Jewellery Trial', date: '31 May 2026', time: '11:30', status: 'pending', location: 'Delhi Vault' },
  { id: '#APT-503', customer: 'Meera Krishnan', type: 'Custom Design', date: '01 Jun 2026', time: '16:00', status: 'confirmed', location: 'Virtual' },
];

export const schemes = [
  { id: '#SCH-901', customer: 'Sunita Rao', plan: '11-Month Gold Scheme', installment: 5000, monthsPaid: 5, status: 'active', startDate: '01 Jan 2026' },
  { id: '#SCH-902', customer: 'Ritu Mehta', plan: 'Golden Harvest', installment: 10000, monthsPaid: 11, status: 'matured', startDate: '01 Jul 2024' },
  { id: '#SCH-903', customer: 'Kavya Nair', plan: 'Diamond Savings', installment: 15000, monthsPaid: 2, status: 'active', startDate: '01 Apr 2026' },
];

export const exchangeRequests = [
  { id: '#EXC-301', customer: 'Pooja Sharma', item: 'Old Gold Bangles', approxWeight: '45g', requestedDate: '25 May 2026', status: 'evaluation_pending', offerAmount: null },
  { id: '#EXC-302', customer: 'Radha Pillai', item: 'Diamond Ring Upgrade', approxWeight: '5g', requestedDate: '22 May 2026', status: 'offer_made', offerAmount: 45000 },
];
