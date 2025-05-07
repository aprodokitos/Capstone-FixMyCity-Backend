const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report_controller');
const upload = require('../Middlewares/upload_middleware');

router.post('/report', upload.single('image'), reportController.createReport);
router.get('/report', reportController.getAllReports);
router.get('/report/:id', reportController.getReportById);
router.put('/report/:id', upload.single('image'), reportController.updateReport);
router.delete('/report/:id', reportController.deleteReport);

module.exports = router;
