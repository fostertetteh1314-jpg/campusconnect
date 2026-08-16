const express = require('express');
const controller = require('../controllers/orderController');
const { initialize, status } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

const router = express.Router();
router.use(protect);
router.route('/').get(controller.list).post(validate(schemas.orderCreate), controller.create);
router.route('/:id').get(validate(schemas.idParam), controller.detail);
router.patch('/:id/status', validate(schemas.orderTransition), controller.changeStatus);
router.post('/:id/payment', validate(schemas.paymentInitialize), initialize);
router.post('/:id/payment/status', validate(schemas.paymentStatus), status);
module.exports = router;
