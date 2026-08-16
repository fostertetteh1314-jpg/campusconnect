const express = require('express');
const controller = require('../controllers/verificationController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

const router = express.Router();
router.use(protect);
router.post('/phone/request', controller.requestCode);
router.post('/phone/confirm', validate(schemas.phoneConfirm), controller.confirmCode);
module.exports = router;
