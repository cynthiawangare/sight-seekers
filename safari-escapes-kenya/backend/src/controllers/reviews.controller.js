const ReviewModel = require('../models/review.model');

exports.getPackageReviews = async (req, res, next) => {
  try {
    const reviews = await ReviewModel.findByPackageId(req.params.packageId);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { packageId, rating, comment } = req.body;
    const review = await ReviewModel.create({
      userId: req.user.id,
      packageId,
      rating,
      comment,
    });
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await ReviewModel.delete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
