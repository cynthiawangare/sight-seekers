const UserModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/bcrypt');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await UserModel.update(req.user.id, { name, email });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.id);
    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const passwordHash = await hashPassword(newPassword);
    await UserModel.update(req.user.id, { passwordHash });
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};
