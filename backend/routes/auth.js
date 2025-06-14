const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  changePassword,
  deleteUserAccount
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/change-password', changePassword);
router.delete('/delete/:id', deleteUserAccount);

module.exports = router;
