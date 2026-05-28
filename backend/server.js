require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./config/firebase'); // Initializes Firebase Admin SDK

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes); // Changed from /api/jewellery as per PRD
// Keep old route for backward compatibility during transition if needed
app.use('/api/jewellery', productRoutes); 

// Root Endpoint for checking API health
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LuxeOrbit API (Firebase)' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
