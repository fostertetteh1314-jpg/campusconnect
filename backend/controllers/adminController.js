const User = require('../models/User');
const Listing = require('../models/Listing');
const Service = require('../models/Service');
const Report = require('../models/Report');
const { ApiError, asyncHandler } = require('../middleware/errors');

const getStats = asyncHandler(async (req, res) => {
    const [users, listings, services, reports] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Service.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);
    res.json({ users, listings, services, pendingReports: reports });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
});

const banUser = asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'SELF_SUSPENSION_DENIED', 'You cannot suspend your own account');
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    res.json(user);
});

const unbanUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    res.json(user);
});

const getAllListings = asyncHandler(async (req, res) => {
    const listings = await Listing.find().populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json(listings);
});

const adminDeleteListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    res.json({ message: 'Listing deleted' });
});

const getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
});

const updateReportStatus = asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!report) throw new ApiError(404, 'REPORT_NOT_FOUND', 'Report not found');
    res.json(report);
});

const createReport = asyncHandler(async (req, res) => {
    const { targetType, targetId, reason } = req.body;
    const report = await Report.create({ reporterId: req.user._id, targetType, targetId, reason });
    res.status(201).json(report);
});

module.exports = { getStats, getAllUsers, banUser, unbanUser, getAllListings, adminDeleteListing, getReports, updateReportStatus, createReport };
