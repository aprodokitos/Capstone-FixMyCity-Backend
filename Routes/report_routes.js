const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report_controller');
const upload = require('../Middlewares/upload_middleware'); 
const { verifyToken } = require('../Middlewares/verify');

router.post('/report', upload.single('image'), reportController.createReport); 
router.get('/report', reportController.getAllReports);
router.get('/report/:id', reportController.getReportById);
router.put('/report/:id', upload.single('image'), verifyToken ,reportController.updateReport); 
router.delete('/report/:id', reportController.deleteReport);
router.get('/report/user/:userId', reportController.getReportsByUserId);

module.exports = router;  