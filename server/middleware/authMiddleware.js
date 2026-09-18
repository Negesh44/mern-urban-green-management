const jwt = require('jsonwebtoken');
const { findUserById } = require('../utils/userStore');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_urban_green_jwt_key_2026'
    );

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please log in again.',
      details: error.message,
    });
  }
};

module.exports = { protect };
