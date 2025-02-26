const express = require('express');
const { body, validationResult } = require("express-validator");
const { authMiddleware, adminMiddleware } = require('../middlewares/auth-middleware');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/product-controller');
const router = express.Router();

router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ gt: 0 }).withMessage('Stock must be a positive integer')
  ], authMiddleware, adminMiddleware, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware,  deleteProduct);

module.exports = router;
