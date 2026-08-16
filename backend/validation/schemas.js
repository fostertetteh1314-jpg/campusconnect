const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');
const trimmed = (min, max) => z.string().trim().min(min).max(max);
const phone = z.string().trim().regex(/^(?:\+233|0)[235][0-9]{8}$/, 'Enter a valid Ghana phone number');
const price = z.coerce.number().finite().min(0).max(10_000_000);
const amountMinor = z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const pageQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
};
const parseStringArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value;
  } catch {
    return value;
  }
};
const fulfilmentMethods = (fallback) => z.preprocess(
  parseStringArray,
  z.array(z.enum(['campus_pickup', 'public_meetup', 'delivery', 'digital'])).min(1).max(4).default(fallback)
);

const register = z.object({
  name: trimmed(2, 80),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
  department: z.string().trim().max(100).default(''),
  level: z.enum(['', '100', '200', '300', '400', '500', 'Graduate']).default(''),
  phone,
}).strict();

const login = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
}).strict();

const profile = z.object({
  name: trimmed(2, 80),
  department: z.string().trim().max(100).default(''),
  level: z.enum(['', '100', '200', '300', '400', '500', 'Graduate']).default(''),
  phone,
}).strict();

const listingBody = z.object({
  title: trimmed(3, 120),
  description: trimmed(10, 5000),
  price,
  category: z.enum(['Textbooks', 'Calculators', 'Laptops', 'Phones', 'Hostel Items', 'Furniture', 'Other']),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']),
  contactNumber: phone,
  quantity: z.coerce.number().int().min(1).max(100).default(1),
  campus: z.string().trim().min(2).max(80).default('University of Cape Coast'),
  location: z.string().trim().max(120).default(''),
  fulfilmentMethods: fulfilmentMethods(['campus_pickup', 'public_meetup']),
}).strict();

const serviceBody = z.object({
  title: trimmed(3, 120),
  description: trimmed(10, 5000),
  price,
  category: z.enum(['Typing', 'Graphic Design', 'Printing', 'Academic Support', 'Programming', 'Tutorials', 'Other']),
  contactNumber: phone,
  campus: z.string().trim().min(2).max(80).default('University of Cape Coast'),
  location: z.string().trim().max(120).default(''),
  fulfilmentMethods: fulfilmentMethods(['public_meetup', 'digital']),
}).strict();

const listingQuery = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  condition: z.string().trim().max(30).optional(),
  minPrice: z.coerce.number().finite().min(0).optional(),
  maxPrice: z.coerce.number().finite().min(0).optional(),
  ...pageQuery,
}).strict().refine((value) => value.minPrice === undefined || value.maxPrice === undefined || value.minPrice <= value.maxPrice, {
  message: 'Minimum price cannot exceed maximum price', path: ['minPrice'],
});

const serviceQuery = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  ...pageQuery,
}).strict();

module.exports = {
  adminStatus: { params: z.object({ id: objectId }), body: z.object({ status: z.enum(['pending', 'resolved', 'dismissed']) }).strict() },
  idParam: { params: z.object({ id: objectId }) },
  listingCreate: { body: listingBody },
  listingQuery: { query: listingQuery },
  listingUpdate: { params: z.object({ id: objectId }), body: listingBody },
  login: { body: login },
  messageList: { params: z.object({ userId: objectId }) },
  messageSend: { body: z.object({ receiverId: objectId, message: trimmed(1, 2000) }).strict() },
  profile: { body: profile },
  register: { body: register },
  reportCreate: { body: z.object({ targetType: z.enum(['listing', 'service', 'user']), targetId: objectId, reason: trimmed(10, 1000) }).strict() },
  serviceCreate: { body: serviceBody },
  serviceQuery: { query: serviceQuery },
  serviceUpdate: { params: z.object({ id: objectId }), body: serviceBody },
  favorite: { body: z.object({ listingId: objectId }).strict() },
  favoriteParam: { params: z.object({ listingId: objectId }) },
  conversationCreate: { body: z.object({ participantId: objectId, contextType: z.enum(['listing', 'service', 'order', 'general']).default('general'), contextId: objectId.nullable().optional() }).strict().refine((value) => value.contextType === 'general' || Boolean(value.contextId), { message: 'Context is required for this conversation', path: ['contextId'] }) },
  conversationMessage: { params: z.object({ id: objectId }), body: z.object({ message: trimmed(1, 2000) }).strict() },
  offerCreate: { params: z.object({ id: objectId }), body: z.object({ recipientId: objectId, subjectType: z.enum(['listing', 'service']), subjectId: objectId, amountMinor, note: z.string().trim().max(500).default(''), expiresInHours: z.coerce.number().int().min(1).max(168).default(48) }).strict() },
  offerRespond: { params: z.object({ id: objectId }), body: z.object({ action: z.enum(['accept', 'decline', 'withdraw']) }).strict() },
  orderCreate: { body: z.object({ subjectType: z.enum(['listing', 'service']), subjectId: objectId, offerId: objectId.nullable().optional(), fulfilmentMethod: z.enum(['campus_pickup', 'public_meetup', 'delivery', 'digital']) }).strict() },
  orderTransition: { params: z.object({ id: objectId }), body: z.object({ action: z.enum(['accept', 'mark_fulfilled', 'confirm_complete', 'cancel']), reason: z.string().trim().max(500).default('') }).strict() },
  paymentInitialize: { params: z.object({ id: objectId }), body: z.object({ network: z.enum(['MTN', 'TELECEL', 'AT']), phone, otpCode: z.string().regex(/^\d{4,8}$/).optional() }).strict() },
  paymentStatus: { params: z.object({ id: objectId }) },
  phoneConfirm: { body: z.object({ code: z.string().regex(/^\d{6}$/) }).strict() },
  reviewCreate: { body: z.object({ orderId: objectId, rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(1000).default('') }).strict() },
  disputeCreate: { body: z.object({ orderId: objectId, reason: trimmed(10, 2000), evidenceUrls: z.array(z.string().url().max(500)).max(8).default([]) }).strict() },
  disputeEvidence: { params: z.object({ id: objectId }), body: z.object({ description: trimmed(5, 2000), urls: z.array(z.string().url().max(500)).max(8).default([]) }).strict() },
  disputeResolve: { params: z.object({ id: objectId }), body: z.object({ resolution: z.enum(['buyer', 'seller', 'close']), note: trimmed(5, 2000) }).strict() },
  withdrawalCreate: { body: z.object({ amountMinor, provider: z.enum(['MTN', 'AT', 'TELECEL']), accountName: trimmed(2, 120), idempotencyKey: z.string().trim().min(8).max(120) }).strict() },
  withdrawalReview: { params: z.object({ id: objectId }), body: z.object({ action: z.enum(['approve', 'reject']), reason: z.string().trim().max(500).default('') }).strict() },
};
