const Review = require('../models/Review');
const Order = require('../models/Order');
const { ApiError, asyncHandler } = require('../middleware/errors');

const create = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
  if (order.status !== 'completed') throw new ApiError(409, 'REVIEW_ORDER_INCOMPLETE', 'Complete the order before leaving a review');
  if (String(order.buyerId) !== String(req.user._id)) throw new ApiError(403, 'REVIEW_FORBIDDEN', 'Only the buyer can review this order');
  try {
    const review = await Review.create({ orderId: order._id, reviewerId: req.user._id, revieweeId: order.sellerId, rating: req.body.rating, comment: req.body.comment });
    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'REVIEW_EXISTS', 'This order has already been reviewed');
    throw error;
  }
});

const forUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ revieweeId: req.params.id, status: 'published' }).sort({ createdAt: -1 }).populate('reviewerId', 'name profileImage').lean();
  const summary = reviews.length ? { count: reviews.length, average: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length } : { count: 0, average: null };
  res.json({ reviews, summary });
});

module.exports = { create, forUser };
