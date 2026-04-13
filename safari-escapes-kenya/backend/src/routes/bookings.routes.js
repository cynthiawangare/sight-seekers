const router = require('express').Router();
const authenticate = require('../middleware/auth.middleware');
const ctrl = require('../controllers/bookings.controller');

router.use(authenticate);

router.get('/', ctrl.getUserBookings);
router.get('/:id', ctrl.getBookingById);
router.post('/', ctrl.createBooking);
router.patch('/:id/cancel', ctrl.cancelBooking);

module.exports = router;
