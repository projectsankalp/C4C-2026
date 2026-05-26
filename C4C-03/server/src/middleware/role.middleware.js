const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }
  next();
};

module.exports = { allowRoles };
