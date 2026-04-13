const router = require('express').Router();
const authenticate = require('../middleware/auth.middleware');
const ctrl = require('../controllers/reviews.controller');

router.get('/package/:packageId', ctrl.getPackageReviews);
router.post('/', authenticate, ctrl.createReview);
router.delete('/:id', authenticate, ctrl.deleteReview);

module.exports = router;
