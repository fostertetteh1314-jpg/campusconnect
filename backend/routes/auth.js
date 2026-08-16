const express = require('express');
const router = express.Router();
const { register, login, logout, refresh, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');
const { authLimiter, uploadLimiter } = require('../middleware/security');

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadLimiter, upload.single('profileImage'), validate(schemas.profile), updateProfile);

module.exports = router;
