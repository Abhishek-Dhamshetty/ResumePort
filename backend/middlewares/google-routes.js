const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL || (
  isProduction ? "https://resume-port-ten.vercel.app" : "http://localhost:5173"
);

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${frontendUrl}/signin?error=auth_failed`
  }),
  function(req, res) {
    try {
      console.log("🔍 OAuth Callback - User:", req.user);
      
      if (!req.user) {
        throw new Error("No user data received from Google");
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not configured");
      }

      // Generate JWT token with profile image
      const token = jwt.sign(
        { 
          userId: req.user._id,
          email: req.user.email,
          name: req.user.firstName + ' ' + req.user.lastName,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profileImage: req.user.profileImage
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const redirectUrl = `${frontendUrl}/?token=${encodeURIComponent(token)}`;
      
      console.log("🔄 Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ OAuth callback error:", error);
      const errorUrl = `${frontendUrl}/signin?error=auth_failed`;
      res.redirect(errorUrl);
    }
  });

router.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;