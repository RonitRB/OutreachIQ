const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET /auth/google — Initiate Google OAuth
router.get('/google', authController.googleAuth);

// GET /auth/google/callback — OAuth callback
router.get('/google/callback', ...authController.googleCallback);

// GET /auth/me — Get current user
router.get('/me', authController.getMe);

// GET /auth/logout — Logout
router.get('/logout', authController.logout);

module.exports = router;
