const express = require('express');
const router = express.Router();
const reportController = require('../controllers/laporan_controller');

router.post('/', reportController.createReport);
router.get('/user/:userId', reportController.getUserReports);
router.get('/', reportController.getAllReports);
router.patch('/:id/status', reportController.updateReportStatus);

module.exports = router;
