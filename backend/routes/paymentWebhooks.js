const express = require('express');
const { webhook } = require('../controllers/paymentController');

const router = express.Router();
router.post('/moolre', webhook);
module.exports = router;
