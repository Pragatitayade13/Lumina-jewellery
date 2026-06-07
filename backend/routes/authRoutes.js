const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', verifyToken, authController.login);
router.post('/set-role', verifyToken, authorize(['superadmin']), authController.setRole);

module.exports = router;
