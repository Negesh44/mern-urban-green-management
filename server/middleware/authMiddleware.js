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

// Optional auth for public reporting and browsing - ensures guests never get 401
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Citizen Reporter',
      email: 'citizen@chennai.gov.in',
      role: 'citizen',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_urban_green_jwt_key_2026'
    );

    const user = await findUserById(decoded.id);
    req.user = user || {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Citizen Reporter',
      email: 'citizen@chennai.gov.in',
      role: 'citizen',
    };
    next();
  } catch (error) {
    req.user = {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Citizen Reporter',
      email: 'citizen@chennai.gov.in',
      role: 'citizen',
    };
    next();
  }
};

module.exports = { protect, optionalProtect };
