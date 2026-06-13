const express = require('express');
const router = express.Router();
const {
  getServices, getService, createService, updateService, deleteService, getMyServices,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

router.get('/', getServices);
router.get('/my', protect, getMyServices);
router.get('/:id', getService);
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
