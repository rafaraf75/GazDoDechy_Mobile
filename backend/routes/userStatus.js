const express = require('express');
const router = express.Router();
const {
  blockUser,
  unblockUser,
  getUserStatus,
  getAllUserStatuses
} = require('../controllers/userStatusController');

router.post('/block/:id', blockUser);
router.post('/unblock/:id', unblockUser);
router.get('/:userId', getUserStatus);
router.get('/', getAllUserStatuses);

module.exports = router;