const express = require('express');
const router = express.Router();
const {
  getStats, getAllUsers, banUser, unbanUser,
  getAllListings, adminDeleteListing, getReports, updateReportStatus, createReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/ban', protect, adminOnly, banUser);
router.put('/users/:id/unban', protect, adminOnly, unbanUser);
router.get('/listings', protect, adminOnly, getAllListings);
router.delete('/listings/:id', protect, adminOnly, adminDeleteListing);
router.get('/reports', protect, adminOnly, getReports);
router.put('/reports/:id', protect, adminOnly, updateReportStatus);
router.post('/reports', protect, createReport);

module.exports = router;
