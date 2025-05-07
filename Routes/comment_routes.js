const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment_controller');
const upload = require('../Middlewares/upload_middleware');

router.post('/comment', upload.single('image'), commentController.addComment);
router.get('/comment', commentController.getAllComments);
router.get('/comment/:id', commentController.getCommentById);
router.put('/comment/:id', upload.single('image'), commentController.updateComment);
router.delete('/comment/:id', commentController.deleteComment);

module.exports = router;
