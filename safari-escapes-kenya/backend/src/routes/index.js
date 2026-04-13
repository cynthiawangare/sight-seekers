const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/packages', require('./packages.routes'));
router.use('/bookings', require('./bookings.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/reviews', require('./reviews.routes'));
router.use('/users', require('./users.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/cancellations', require('./cancellations.routes'));

module.exports = router;
