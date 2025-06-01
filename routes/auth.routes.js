const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { registerValidator, loginValidator, validate } = require('../utils/validators');

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);

module.exports = router;
