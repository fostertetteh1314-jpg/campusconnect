const Service = require('../models/Service');
const { ApiError, asyncHandler } = require('../middleware/errors');

const getServices = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 12 } = req.query;
  const query = { isActive: true };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;

  const total = await Service.countDocuments(query);
  const services = await Service.find(query)
    .populate('providerId', 'name profileImage level phoneVerifiedAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ services, total, pages: Math.ceil(total / limit), page: Number(page) });
});

const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('providerId', 'name profileImage level phoneVerifiedAt');
  if (!service) throw new ApiError(404, 'SERVICE_NOT_FOUND', 'Service not found');
  res.json(service);
});

const createService = asyncHandler(async (req, res) => {
  const { title, description, price, category, contactNumber, campus, location, fulfilmentMethods } = req.body;
  const service = await Service.create({
    title,
    description,
    price: Number(price),
    category,
    contactNumber,
    campus,
    location,
    fulfilmentMethods,
    providerId: req.user._id,
  });
  res.status(201).json(service);
});

const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'SERVICE_NOT_FOUND', 'Service not found');
  if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'SERVICE_FORBIDDEN', 'You cannot update this service');
  }
  const { title, description, price, category, contactNumber, campus, location, fulfilmentMethods } = req.body;
  const updated = await Service.findByIdAndUpdate(
    req.params.id,
    { title, description, price, category, contactNumber, campus, location, fulfilmentMethods },
    { new: true, runValidators: true }
  );
  res.json(updated);
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'SERVICE_NOT_FOUND', 'Service not found');
  if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'SERVICE_FORBIDDEN', 'You cannot delete this service');
  }
  await service.deleteOne();
  res.json({ message: 'Service deleted' });
});

const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ providerId: req.user._id }).sort({ createdAt: -1 });
  res.json(services);
});

module.exports = { getServices, getService, createService, updateService, deleteService, getMyServices };
