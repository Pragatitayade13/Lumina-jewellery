const admin = require('firebase-admin');
const { hasPermission } = require('../utils/rbac');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    // decodedToken contains standard claims and custom claims (like role)
    req.user.role = decodedToken.role || 'customer'; // Default to customer if no custom claim exists
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Middleware factory for Role-Based Access Control
const authorize = (requiredRoles = [], requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const userRole = req.user.role;

    // 1. Check Role Requirement
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return res.status(403).json({ message: `Forbidden: Requires one of roles: ${requiredRoles.join(', ')}` });
    }

    // 2. Check Permission Requirement
    if (requiredPermissions.length > 0) {
      const hasAllPerms = requiredPermissions.every(perm => hasPermission(userRole, perm));
      if (!hasAllPerms) {
        return res.status(403).json({ message: `Forbidden: Requires permissions: ${requiredPermissions.join(', ')}` });
      }
    }

    next();
  };
};

module.exports = { verifyToken, authorize };
