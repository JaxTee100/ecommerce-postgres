const express = require('express');
const { createCheckoutSession, handleWebhook } = require('../controllers/payment-controller');
const { authMiddleware } = require('../middlewares/auth-middleware');


const router = express.Router();

router.post('/create-checkout-session',authMiddleware, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
