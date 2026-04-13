module.exports = (req, res, next) => {
  if (!req.user || req.user.admin !== true) {
    return res.status(403).json({ error: 'Forbidden — admin access required' });
  }
  next();
};
