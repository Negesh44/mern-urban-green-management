const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, createUser } = require('../utils/userStore');

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_urban_green_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register a new user (admin or citizen)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'An account with this email address already exists.',
      });
    }

    const userRole = role === 'admin' ? 'admin' : 'citizen';

    const user = await createUser({
      name,
      email,
      password,
      role: userRole,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      status: 'success',
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Signup Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during signup.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password.',
      });
    }

    // Find user with password hash
    const user = await findUserByEmail(email, true);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials.',
      });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during login.',
    });
  }
};

// @desc    Get currently authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      user: req.user,
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching user profile.',
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
};
