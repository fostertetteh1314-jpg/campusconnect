const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Offer = require('../models/Offer');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errors');

const assertParticipant = (conversation, userId) => {
  if (!conversation.participants.some((participant) => String(participant._id || participant) === String(userId))) throw new ApiError(403, 'CONVERSATION_FORBIDDEN', 'You do not have access to this conversation');
};

const list = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id, archivedBy: { $ne: req.user._id } })
    .sort({ lastMessageAt: -1 }).populate('participants', 'name profileImage phoneVerifiedAt').lean();
  res.json({ conversations });
});

const create = asyncHandler(async (req, res) => {
  if (String(req.body.participantId) === String(req.user._id)) throw new ApiError(400, 'CONVERSATION_SELF', 'Choose another person to start a conversation');
  if (!await User.exists({ _id: req.body.participantId, isBanned: false })) throw new ApiError(404, 'PARTICIPANT_NOT_FOUND', 'The person could not be found');
  const participants = [String(req.user._id), req.body.participantId].sort();
  const participantKey = participants.join(':');
  const contextId = req.body.contextType === 'general' ? null : req.body.contextId;
  let conversation = await Conversation.findOne({ participantKey, contextType: req.body.contextType, contextId });
  if (!conversation) {
    try { conversation = await Conversation.create({ participants, participantKey, contextType: req.body.contextType, contextId }); }
    catch (error) { if (error.code === 11000) conversation = await Conversation.findOne({ participantKey, contextType: req.body.contextType, contextId }); else throw error; }
  }
  res.status(201).json(conversation);
});

const detail = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id).populate('participants', 'name profileImage phoneVerifiedAt');
  if (!conversation) throw new ApiError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  assertParticipant(conversation, req.user._id);
  const [messages, offers] = await Promise.all([
    Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(200).lean(),
    Offer.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).lean(),
  ]);
  res.json({ conversation, messages, offers });
});

const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  assertParticipant(conversation, req.user._id);
  const receiverId = conversation.participants.find((participant) => String(participant) !== String(req.user._id));
  const message = await Message.create({ senderId: req.user._id, receiverId, conversationId: conversation._id, message: req.body.message });
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();
  req.app.get('io')?.to(String(receiverId)).emit('newMessage', message);
  res.status(201).json(message);
});

const createOffer = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  assertParticipant(conversation, req.user._id);
  if (!conversation.participants.some((participant) => String(participant) === req.body.recipientId) || req.body.recipientId === String(req.user._id)) throw new ApiError(400, 'OFFER_RECIPIENT_INVALID', 'Offer recipient must be the other participant');
  const offer = await Offer.create({ ...req.body, conversationId: conversation._id, createdBy: req.user._id, expiresAt: new Date(Date.now() + req.body.expiresInHours * 60 * 60 * 1000) });
  res.status(201).json(offer);
});

const respondOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, 'OFFER_NOT_FOUND', 'Offer not found');
  if (offer.status !== 'pending' || offer.expiresAt <= new Date()) throw new ApiError(409, 'OFFER_NOT_PENDING', 'This offer can no longer be changed');
  if (req.body.action === 'withdraw') {
    if (String(offer.createdBy) !== String(req.user._id)) throw new ApiError(403, 'OFFER_FORBIDDEN', 'Only the sender can withdraw this offer');
    offer.status = 'withdrawn';
  } else {
    if (String(offer.recipientId) !== String(req.user._id)) throw new ApiError(403, 'OFFER_FORBIDDEN', 'Only the recipient can respond to this offer');
    offer.status = req.body.action === 'accept' ? 'accepted' : 'declined';
  }
  offer.respondedAt = new Date();
  await offer.save();
  res.json(offer);
});

module.exports = { create, createOffer, detail, list, respondOffer, sendMessage };
