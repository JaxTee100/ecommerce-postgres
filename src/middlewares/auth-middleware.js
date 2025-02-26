const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    console.log("authmiddleware")

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access Denied. Admins only.' });
  }
  console.log("adminmiddleware")
  next();
};

module.exports = { authMiddleware, adminMiddleware };
