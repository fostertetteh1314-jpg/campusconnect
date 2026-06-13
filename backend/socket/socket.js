const Message = require('../models/Message');

const connectedUsers = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) connectedUsers.set(userId, socket.id);

    io.emit('onlineUsers', Array.from(connectedUsers.keys()));

    socket.on('sendMessage', async ({ receiverId, message, senderId }) => {
      try {
        const msg = await Message.create({ senderId, receiverId, message });
        const populated = await msg.populate('senderId', 'name profileImage');

        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', populated);
        }
        socket.emit('messageSent', populated);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('typing', ({ receiverId, senderId }) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit('userTyping', { senderId });
    });

    socket.on('stopTyping', ({ receiverId, senderId }) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit('userStoppedTyping', { senderId });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      io.emit('onlineUsers', Array.from(connectedUsers.keys()));
    });
  });
};

module.exports = initSocket;
