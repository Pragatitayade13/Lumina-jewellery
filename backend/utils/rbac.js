// backend/utils/rbac.js

// Define all possible permissions in the system
const PERMISSIONS = {
  // Global
  ALL: 'all',
  
  // Users
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  DELETE_USERS: 'delete:users',
  
  // Products
  READ_PRODUCTS: 'read:products',
  WRITE_PRODUCTS: 'write:products',
  DELETE_PRODUCTS: 'delete:products',
  
  // Orders
  READ_ORDERS: 'read:orders',
  WRITE_ORDERS: 'write:orders',
  DELETE_ORDERS: 'delete:orders',
  
  // Inventory
  READ_INVENTORY: 'read:inventory',
  WRITE_INVENTORY: 'write:inventory',

  // Logistics
  READ_LOGISTICS: 'read:logistics',
  WRITE_LOGISTICS: 'write:logistics',
  DELIVER_ORDERS: 'deliver:orders',

  // Settings
  READ_SETTINGS: 'read:settings',
  WRITE_SETTINGS: 'write:settings',

  // Finance
  READ_FINANCE: 'read:finance',
  WRITE_FINANCE: 'write:finance'
};

// Map roles to their intrinsic permissions
const ROLE_PERMISSIONS = {
  superadmin: [PERMISSIONS.ALL],
  admin: [
    PERMISSIONS.READ_USERS, PERMISSIONS.WRITE_USERS,
    PERMISSIONS.READ_PRODUCTS, PERMISSIONS.WRITE_PRODUCTS,
    PERMISSIONS.READ_ORDERS, PERMISSIONS.WRITE_ORDERS,
    PERMISSIONS.READ_INVENTORY, PERMISSIONS.WRITE_INVENTORY,
    PERMISSIONS.READ_LOGISTICS, PERMISSIONS.WRITE_LOGISTICS,
    PERMISSIONS.READ_SETTINGS, PERMISSIONS.WRITE_SETTINGS,
    PERMISSIONS.READ_FINANCE, PERMISSIONS.WRITE_FINANCE
  ],
  manager: [
    PERMISSIONS.READ_USERS,
    PERMISSIONS.READ_PRODUCTS, PERMISSIONS.WRITE_PRODUCTS,
    PERMISSIONS.READ_ORDERS, PERMISSIONS.WRITE_ORDERS,
    PERMISSIONS.READ_INVENTORY, PERMISSIONS.WRITE_INVENTORY,
    PERMISSIONS.READ_LOGISTICS,
    PERMISSIONS.READ_FINANCE
  ],
  staff: [
    PERMISSIONS.READ_PRODUCTS,
    PERMISSIONS.READ_ORDERS, PERMISSIONS.WRITE_ORDERS,
    PERMISSIONS.READ_INVENTORY
  ],
  finance: [
    PERMISSIONS.READ_ORDERS,
    PERMISSIONS.READ_FINANCE, PERMISSIONS.WRITE_FINANCE
  ],
  delivery: [
    PERMISSIONS.READ_LOGISTICS, PERMISSIONS.DELIVER_ORDERS
  ],
  customer: [
    // Customers implicitly have rights to their own resources only (enforced by code/rules)
  ]
};

// Helper to check if a role has a specific permission
const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission);
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission
};
