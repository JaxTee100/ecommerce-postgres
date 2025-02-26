const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch cart items for this user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });


    if (cartItems.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    // Calculate total
    let total = 0;
    const orderItemsData = cartItems.map((item) => {
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;
      return {
        product: {
          connect: { id: item.product.id }, // ✅ Corrected: Use `connect`
        },
        quantity: item.quantity,
        price: item.product.price,
      };
    });


    // Create order
    const newOrder = await prisma.order.create({
      data: {
        userId,
        total,
        OrderItem: {
          create: orderItemsData,
        },
      },
      include: {
        OrderItem: true,
      },
    });

    // Clear user’s cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};


const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

const getAllOrdersAdmin = async (req, res) => {
  try {
    // For Admin use only
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};


module.exports = { createOrder, getOrders, getAllOrdersAdmin };