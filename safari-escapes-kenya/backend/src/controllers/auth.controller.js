const UserModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await UserModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await hashPassword(password);
    const user = await UserModel.create({ name, email, passwordHash });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    res
      .cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(201)
      .json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    res
      .cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.logout = (_req, res) => {
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json({ message: 'Logged out' });
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const payload = verifyRefreshToken(token);
    const user = await UserModel.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    res
      .cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
      .json({ message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};
