const express = require('express');
const controller = require('../controllers/walletController');
const { adminOnly, protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

const router = express.Router();
router.use(protect);
router.get('/', controller.getWallet);
router.post('/withdrawals', validate(schemas.withdrawalCreate), controller.requestWithdrawal);
router.get('/withdrawals/admin', adminOnly, controller.listAll);
router.patch('/withdrawals/:id', adminOnly, validate(schemas.withdrawalReview), controller.reviewWithdrawal);
module.exports = router;
