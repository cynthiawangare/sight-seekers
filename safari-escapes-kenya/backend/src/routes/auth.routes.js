const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const authenticate = require('../middleware/auth.middleware');
const ctrl = require('../controllers/auth.controller');

router.post(
  '/register',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post('/logout', ctrl.logout);
router.post('/refresh', ctrl.refreshToken);
router.get('/me', authenticate, ctrl.getMe);

module.exports = router;
