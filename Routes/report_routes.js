const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report_controller');
const upload = require('../Middlewares/upload_middleware');

router.post('/reports', upload.single('image'), reportController.createReport);
router.get('/reports', reportController.getAllReports);
router.get('/reports/:id', reportController.getReportById);
router.put('/reports/:id', upload.single('image'), reportController.updateReport);
router.delete('/reports/:id', reportController.deleteReport);

module.exports = router;
