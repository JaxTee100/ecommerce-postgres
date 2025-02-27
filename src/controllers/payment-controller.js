const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Set your Stripe secret key in .env

const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userID", userId);

    // Fetch the user's order (assumes order was created before payment)
    const order = await prisma.order.findFirst({
      where: { userId, status: 'PENDING' },
      include: { OrderItem: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ message: "No pending order found" });
    }

    // Create Stripe line items
    const lineItems = order.OrderItem.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
        },
        unit_amount: item.price * 100, // Stripe expects amount in cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success?orderId=${order.id}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { orderId: order.id },
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ message: "Stripe payment failed", error: error.message });
  }
};


const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
  
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
  
        // Update order status to 'PAID'
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
      }
  
      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ message: "Webhook error", error: error.message });
    }
  };
  
  module.exports = { createCheckoutSession, handleWebhook };
  
