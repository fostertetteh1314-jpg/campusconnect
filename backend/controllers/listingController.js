const Listing = require('../models/Listing');
const Favorite = require('../models/Favorite');
const { ApiError, asyncHandler } = require('../middleware/errors');

const getListings = asyncHandler(async (req, res) => {
    const { search, category, condition, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('sellerId', 'name profileImage level phoneVerifiedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

  res.json({ listings, total, pages: Math.ceil(total / limit), page: Number(page) });
});

const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('sellerId', 'name profileImage level phoneVerifiedAt');
  if (!listing) throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
  res.json(listing);
});

const createListing = asyncHandler(async (req, res) => {
    const { title, description, price, category, condition, contactNumber, quantity, campus, location, fulfilmentMethods } = req.body;
    const images = req.files ? req.files.map((f) => f.path) : [];

    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      category,
      condition,
      contactNumber,
      quantity,
      campus,
      location,
      fulfilmentMethods,
      images,
      sellerId: req.user._id,
    });
  res.status(201).json(listing);
});

const updateListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError(403, 'LISTING_FORBIDDEN', 'You cannot update this listing');
    }

    const { title, description, price, category, condition, contactNumber, quantity, campus, location, fulfilmentMethods } = req.body;
    const update = { title, description, price: Number(price), category, condition, contactNumber, quantity, campus, location, fulfilmentMethods };
    if (req.files && req.files.length > 0) update.images = req.files.map((f) => f.path);

    const updated = await Listing.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.json(updated);
});

const deleteListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError(403, 'LISTING_FORBIDDEN', 'You cannot delete this listing');
    }
    await listing.deleteOne();
    await Favorite.deleteMany({ listingId: req.params.id });
    res.json({ message: 'Listing deleted' });
});

const getMyListings = asyncHandler(async (req, res) => {
    const listings = await Listing.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
});

module.exports = { getListings, getListing, createListing, updateListing, deleteListing, getMyListings };
