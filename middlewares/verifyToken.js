const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secretbosku123';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Format: Bearer <token>
  if (!token) return res.status(401).json({ message: 'Token tidak ada' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

module.exports = verifyToken;
