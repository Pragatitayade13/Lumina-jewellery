const { db } = require('../config/firebase');

exports.register = async (req, res) => {
  try {
    const { uid, email, businessName, gstNumber, phone, role = 'owner', plan = 'free' } = req.body;

    if (!uid || !email || !businessName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if business exists
    const businessRef = db.collection('BUSINESS').doc(uid);
    const businessDoc = await businessRef.get();
    
    if (businessDoc.exists) {
      return res.status(400).json({ message: 'Business already registered' });
    }

    // Create Business Profile
    const businessData = {
      businessName,
      gstNumber: gstNumber || '',
      email,
      phone: phone || '',
      subscriptionPlan: plan,
      ownerId: uid,
      createdAt: new Date().toISOString()
    };
    await businessRef.set(businessData);

    // Create User Profile
    const userData = {
      uid,
      name: businessName, // Or separate owner name if provided
      email,
      role,
      businessId: uid, // Use owner's uid as businessId for simplicity
      phone: phone || '',
      createdAt: new Date().toISOString()
    };
    await db.collection('USERS').doc(uid).set(userData);

    res.status(201).json({ message: 'Registration successful', user: userData, business: businessData });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    // With Firebase Auth, login is handled client-side.
    // The client sends the ID token to a protected route to establish session.
    // This endpoint can be used to return user data after a successful Firebase login.
    const { uid } = req.user; // populated by authMiddleware

    const userDoc = await db.collection('USERS').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    const userData = userDoc.data();
    
    let businessData = null;
    if (userData.businessId) {
      const businessDoc = await db.collection('BUSINESS').doc(userData.businessId).get();
      if (businessDoc.exists) {
        businessData = businessDoc.data();
      }
    }

    res.status(200).json({ user: userData, business: businessData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const admin = require('firebase-admin');
const { ROLE_PERMISSIONS } = require('../utils/rbac');

exports.setRole = async (req, res) => {
  try {
    const { targetUid, role, customPermissions } = req.body;

    if (!targetUid || !role) {
      return res.status(400).json({ message: 'Target UID and role are required' });
    }

    // Default to the role's intrinsic permissions if custom ones aren't provided
    const permissions = customPermissions || ROLE_PERMISSIONS[role] || [];

    // Set custom claims on Firebase Auth
    await admin.auth().setCustomUserClaims(targetUid, { role, permissions });

    // Ensure Firestore `users` collection stays in sync
    const userRef = db.collection('users').doc(targetUid);
    
    // We use set with merge to avoid overwriting existing profile data like email/name
    await userRef.set({
      uid: targetUid,
      role: role,
      permissions: permissions,
      isActive: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ message: `Successfully assigned role ${role} to user ${targetUid}`, role, permissions });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    res.status(500).json({ message: 'Server error assigning role', details: error.message });
  }
};
