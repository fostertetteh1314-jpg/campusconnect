const express = require('express');
const controller = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

const router = express.Router();
router.use(protect);
router.route('/').get(controller.list).post(validate(schemas.conversationCreate), controller.create);
router.route('/:id').get(validate(schemas.idParam), controller.detail);
router.post('/:id/messages', validate(schemas.conversationMessage), controller.sendMessage);
router.post('/:id/offers', validate(schemas.offerCreate), controller.createOffer);
router.patch('/offers/:id', validate(schemas.offerRespond), controller.respondOffer);
module.exports = router;
