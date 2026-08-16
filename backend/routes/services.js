const express = require('express');
const router = express.Router();
const {
  getServices, getService, createService, updateService, deleteService, getMyServices,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

router.get('/', validate(schemas.serviceQuery), getServices);
router.get('/my', protect, getMyServices);
router.get('/:id', validate(schemas.idParam), getService);
router.post('/', protect, validate(schemas.serviceCreate), createService);
router.put('/:id', protect, validate(schemas.serviceUpdate), updateService);
router.delete('/:id', protect, validate(schemas.idParam), deleteService);

module.exports = router;
