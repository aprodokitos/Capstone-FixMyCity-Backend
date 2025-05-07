const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report_controller');
const upload = require('../Middlewares/upload_middleware');

router.post('/', upload.single('image'), reportController.createReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.put('/:id', upload.single('image'), reportController.updateReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
