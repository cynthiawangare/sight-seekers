const router = require('express').Router();
const authenticate = require('../middleware/auth.middleware');
const ctrl = require('../controllers/users.controller');

router.use(authenticate);

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);

module.exports = router;
