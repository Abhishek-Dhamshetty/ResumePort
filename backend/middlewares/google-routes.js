const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    try {
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

      // ✅ Production-ready redirect URLs
      const redirectUrl = process.env.NODE_ENV === 'production' 
        ? `https://resume-port-ten.vercel.app/?token=${token}` 
        : `http://localhost:5173/?token=${token}`;
      
      console.log("🔄 Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ OAuth callback error:", error);
      const errorUrl = process.env.NODE_ENV === 'production'
        ? "https://resume-port-ten.vercel.app/signin?error=auth_failed"
        : "http://localhost:5173/signin?error=auth_failed";
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