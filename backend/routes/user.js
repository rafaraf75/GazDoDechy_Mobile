const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/full', userController.getAllUsersWithStatus);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
router.put('/:id/role', userController.updateUserRole);

module.exports = router;