const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add item to cart
const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("name", product.name) 

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1)}
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: quantity || 1
        }
      });
    }

    res.status(200).json({
      message: ` ${product.name} Item added to cart`,
      cartItem
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart", error: error.message });
  }
};

// Get cart items
const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id, quantity } = req.body;

    // Find the cart item
    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
    if (cartItem.userId !== userId) return res.status(403).json({ message: "Access denied" });

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id},
      data: { quantity }
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item", error: error.message });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
    if (cartItem.userId !== userId) return res.status(403).json({ message: "Access denied" });

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Error removing cart item", error: error.message });
  }
};


module.exports = { addItemToCart, getCartItems, updateCartItem, removeCartItem };