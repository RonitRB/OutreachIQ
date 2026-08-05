const passport = require('passport');
const logger = require('../utils/logger');


const googleAuth = passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.compose',
  ],
  accessType: 'offline',
  prompt: 'consent',
});

const googleCallback = [
  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL,
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/jobs`);
  },
];

const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: true, message: 'Not authenticated' });
  }
  return res.json({
    _id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    avatar: req.user.avatar,
    skills: req.user.skills,
    projects: req.user.projects,
    summary: req.user.summary,
  });
};

const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      logger.error('Logout error', { error: err.message });
    }
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destroy error', { error: err.message });
      }
      res.redirect(process.env.FRONTEND_URL);
    });
  });
};

module.exports = { googleAuth, googleCallback, getMe, logout };
