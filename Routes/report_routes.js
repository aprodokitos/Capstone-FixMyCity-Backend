const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report_controller');
const upload = require('../Middlewares/upload_middleware');
// Import dengan destructuring untuk mengambil fungsi spesifik
const { verifyToken, verifyAdmin } = require('../Middlewares/verify'); // <-- Perbaiki di sini

router.post('/report', upload.single('image'), reportController.createReport);
router.get('/report', reportController.getAllReports);
router.get('/report/:id', reportController.getReportById);
// Gunakan verifyToken yang sudah diimpor dengan benar
router.put('/report/:id', upload.single('image'), verifyToken ,reportController.updateReport);
router.delete('/report/:id', reportController.deleteReport);

module.exports = router;