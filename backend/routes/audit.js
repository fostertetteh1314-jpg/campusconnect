const express = require('express');
const { list } = require('../controllers/auditController');
const { adminOnly, protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, adminOnly, list);
module.exports = router;
