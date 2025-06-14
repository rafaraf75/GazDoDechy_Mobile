const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactionController');

router.post('/', reactionController.addOrUpdateReaction);
router.get('/:postId', reactionController.getReactionsForPost);

module.exports = router;
