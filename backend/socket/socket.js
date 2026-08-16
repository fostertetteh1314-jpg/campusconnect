const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const connectedUsers = new Map();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      const user = await User.findById(decoded.id).select('_id isBanned');
      if (!user || user.isBanned) return next(new Error('Authentication failed'));
      socket.userId = user._id.toString();
      return next();
    } catch {
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    connectedUsers.set(userId, socket.id);

    io.emit('onlineUsers', Array.from(connectedUsers.keys()));

    socket.on('sendMessage', async ({ receiverId, message }, acknowledge) => {
      try {
        if (!/^[a-f\d]{24}$/i.test(receiverId) || typeof message !== 'string' || !message.trim() || message.trim().length > 2000) {
          throw new Error('Invalid message');
        }
        const msg = await Message.create({ senderId: userId, receiverId, message: message.trim() });
        const populated = await msg.populate('senderId', 'name profileImage');

        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', populated);
        }
        if (typeof acknowledge === 'function') acknowledge({ ok: true, message: populated });
      } catch (_error) {
        if (typeof acknowledge === 'function') acknowledge({ ok: false, error: 'Message could not be sent' });
      }
    });

    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit('userTyping', { senderId: userId });
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit('userStoppedTyping', { senderId: userId });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      io.emit('onlineUsers', Array.from(connectedUsers.keys()));
    });
  });
};

module.exports = initSocket;
