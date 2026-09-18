const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required prior to role verification.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = { authorize };
