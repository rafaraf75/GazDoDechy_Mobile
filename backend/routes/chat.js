const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/users', chatController.getChatUsers);
router.get('/history', chatController.getChatHistory);
router.post('/message', chatController.sendMessage);
router.get('/online-users', chatController.getOnlineUsers);

module.exports = router;