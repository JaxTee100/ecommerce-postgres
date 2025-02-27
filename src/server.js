require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require('./routes/auth-routes');
const productRoutes = require('./routes/product-routes');
const cartRoutes = require('./routes/cart-router');
const orderRoutes = require('./routes/order-routes');
const stripeRoutes = require('./routes/payment-routes')

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", stripeRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
