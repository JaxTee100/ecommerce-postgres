const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order-controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth-middleware");

// User places an order
router.post("/", authMiddleware, orderController.createOrder);

// User views their orders
router.get("/", authMiddleware, orderController.getOrders);

// Admin views all orders
router.get("/admin", authMiddleware, adminMiddleware, orderController.getAllOrdersAdmin);

module.exports = router;
