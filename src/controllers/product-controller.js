const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req, res) => {
    try {
        const { name, description, price,stock } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }
        console.log("userID", userId);
        const product = await prisma.product.create({
            data: { name, description, price: parseFloat(price), stock: parseInt(stock), userId }
        });
        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: `Internal server error: ${error.message}`
         });
    }
};


const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: `Internal server error: ${error.message}`
        });
    }
};



const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, stock } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find the product
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if the user is the owner or an admin
        if (product.userId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Access Denied. You can only modify your own products.' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: { name, price, description, stock, userId }
        });

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find the product
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if the user is the owner or an admin
        if (product.userId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Access Denied. You can only delete your own products.' });
        }

        

        await prisma.product.delete({ where: { id } });

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };