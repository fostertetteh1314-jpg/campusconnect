const express = require('express');
const router = express.Router();
const {
  getListings, getListing, createListing, updateListing, deleteListing, getMyListings,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');
const { uploadLimiter } = require('../middleware/security');

router.get('/', validate(schemas.listingQuery), getListings);
router.get('/my', protect, getMyListings);
router.get('/:id', validate(schemas.idParam), getListing);
router.post('/', protect, uploadLimiter, upload.array('images', 5), validate(schemas.listingCreate), createListing);
router.put('/:id', protect, uploadLimiter, upload.array('images', 5), validate(schemas.listingUpdate), updateListing);
router.delete('/:id', protect, validate(schemas.idParam), deleteListing);

module.exports = router;
