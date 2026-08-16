const Message = require('../models/Message');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errors');

const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: -1 });

    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const otherId =
        msg.senderId._id.toString() === userId.toString()
          ? msg.receiverId._id.toString()
          : msg.senderId._id.toString();
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push(msg);
      }
    }
  res.json(conversations);
});

const getMessages = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 });

    await Message.updateMany({ senderId: userId, receiverId: myId, read: false }, { read: true });
  res.json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, message } = req.body;
    if (receiverId === req.user._id.toString()) throw new ApiError(400, 'INVALID_RECIPIENT', 'You cannot message yourself');
    if (!(await User.exists({ _id: receiverId, isBanned: false }))) {
      throw new ApiError(404, 'RECIPIENT_NOT_FOUND', 'Recipient not found');
    }
    const msg = await Message.create({ senderId: req.user._id, receiverId, message });
    const populated = await msg.populate('senderId', 'name profileImage');
    res.status(201).json(populated);
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Message.countDocuments({ receiverId: req.user._id, read: false });
    res.json({ count });
});

module.exports = { getConversations, getMessages, sendMessage, getUnreadCount };
