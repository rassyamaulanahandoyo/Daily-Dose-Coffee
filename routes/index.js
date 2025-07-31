const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');
const { isLoggedIn, isAdmin } = require('../middlewares/auth');
