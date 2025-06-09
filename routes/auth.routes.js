const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getProfile, updateProfile } = require('../controllers/auth.controller');
const { registerValidator, loginValidator, validate } = require('../utils/validators');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
