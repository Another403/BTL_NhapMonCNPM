const User = require('../models/user.js');

const requireAuth = async (req, res, next) => {
  try {
    const userId = req.cookies.token;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userFound = await User.findById(userId).select('_id');
    if (!userFound) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = requireAuth;
