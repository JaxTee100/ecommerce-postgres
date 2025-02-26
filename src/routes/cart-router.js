const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart-controller");
const { authMiddleware } = require("../middlewares/auth-middleware");

router.post("/", authMiddleware, cartController.addItemToCart);
router.get("/", authMiddleware, cartController.getCartItems);
router.put("/", authMiddleware, cartController.updateCartItem);
router.delete("/:cartItemId", authMiddleware, cartController.removeCartItem);

module.exports = router;
