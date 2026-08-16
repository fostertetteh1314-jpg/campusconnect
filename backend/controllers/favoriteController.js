const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');
const { ApiError, asyncHandler } = require('../middleware/errors');

const getFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ userId: req.user._id }).populate({
      path: 'listingId',
      populate: { path: 'sellerId', select: 'name profileImage' },
    });
    res.json(favorites);
});

const toggleFavorite = asyncHandler(async (req, res) => {
    const { listingId } = req.body;
    if (!(await Listing.exists({ _id: listingId, isActive: true }))) {
      throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    }
    const existing = await Favorite.findOne({ userId: req.user._id, listingId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ favorited: false });
    }
    await Favorite.create({ userId: req.user._id, listingId });
    res.json({ favorited: true });
});

const checkFavorite = asyncHandler(async (req, res) => {
    const exists = await Favorite.findOne({ userId: req.user._id, listingId: req.params.listingId });
    res.json({ favorited: !!exists });
});

module.exports = { getFavorites, toggleFavorite, checkFavorite };
