const express = require('express');
const router = express.Router();
const {
  getStats, getAllUsers, banUser, unbanUser,
  getAllListings, adminDeleteListing, getReports, updateReportStatus, createReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/ban', protect, adminOnly, validate(schemas.idParam), banUser);
router.put('/users/:id/unban', protect, adminOnly, validate(schemas.idParam), unbanUser);
router.get('/listings', protect, adminOnly, getAllListings);
router.delete('/listings/:id', protect, adminOnly, validate(schemas.idParam), adminDeleteListing);
router.get('/reports', protect, adminOnly, getReports);
router.put('/reports/:id', protect, adminOnly, validate(schemas.adminStatus), updateReportStatus);
router.post('/reports', protect, validate(schemas.reportCreate), createReport);

module.exports = router;
