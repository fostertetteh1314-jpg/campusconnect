const Favorite = require('../models/Favorite');

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id }).populate({
      path: 'listingId',
      populate: { path: 'sellerId', select: 'name profileImage' },
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { listingId } = req.body;
    const existing = await Favorite.findOne({ userId: req.user._id, listingId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ favorited: false });
    }
    await Favorite.create({ userId: req.user._id, listingId });
    res.json({ favorited: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const exists = await Favorite.findOne({ userId: req.user._id, listingId: req.params.listingId });
    res.json({ favorited: !!exists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFavorites, toggleFavorite, checkFavorite };
