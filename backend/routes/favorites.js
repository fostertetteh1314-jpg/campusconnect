const express = require('express');
const router = express.Router();
const { getFavorites, toggleFavorite, checkFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

router.get('/', protect, getFavorites);
router.post('/', protect, validate(schemas.favorite), toggleFavorite);
router.get('/:listingId', protect, validate(schemas.favoriteParam), checkFavorite);

module.exports = router;
