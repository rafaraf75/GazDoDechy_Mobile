const express = require('express');
const router = express.Router();
const {
  getCommentsByPostId,
  addComment
} = require('../controllers/commentsController');

router.get('/:postId', getCommentsByPostId);
router.post('/:postId', addComment);

module.exports = router;
