const express = require('express');
const router = express.Router();
const { inputsearchBytitle, inputsearchBylocation , inputsearchByStatus , inputsearchByuser} = require('../controllers/inputsearch_controller');

router.get('/search/title', inputsearchBytitle);
router.get('/search/location', inputsearchBylocation);
router.get('/search/status', inputsearchByStatus);
router.get('/search/user', inputsearchByuser);

module.exports = router;