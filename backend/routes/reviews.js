const express = require('express');
const controller = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

const router = express.Router();
router.get('/users/:id', validate(schemas.idParam), controller.forUser);
router.post('/', protect, validate(schemas.reviewCreate), controller.create);
module.exports = router;
