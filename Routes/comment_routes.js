const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment_controller');
const upload = require('../Middlewares/upload_middleware');

router.post('/', upload.single('image'), commentController.addComment);
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getCommentById);
router.put('/:id', upload.single('image'), commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
