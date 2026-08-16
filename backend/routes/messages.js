const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');
const { messageLimiter } = require('../middleware/security');

router.get('/conversations', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.get('/:userId', protect, validate(schemas.messageList), getMessages);
router.post('/', protect, messageLimiter, validate(schemas.messageSend), sendMessage);

module.exports = router;
