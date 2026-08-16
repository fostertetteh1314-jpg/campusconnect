const express = require('express');
const controller = require('../controllers/disputeController');
const { adminOnly, protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

const router = express.Router();
router.use(protect);
router.get('/admin', adminOnly, controller.listAll);
router.route('/').get(controller.listMine).post(validate(schemas.disputeCreate), controller.create);
router.post('/:id/evidence', validate(schemas.disputeEvidence), controller.addEvidence);
router.patch('/:id/resolve', adminOnly, validate(schemas.disputeResolve), controller.resolve);
module.exports = router;
