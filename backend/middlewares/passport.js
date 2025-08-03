const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? "https://resumeport.onrender.com/api/auth/google/callback"
      : "http://localhost:9000/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      console.log("🔍 Google Profile received:", profile.id);
      
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          user.profileImage = profile.photos[0].value;
          await user.save();
        }
        console.log("✅ Existing user found:", user.email);
      } else {
        user = new User({
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0].value,
        });
        await user.save();
        console.log("✅ New user created:", user.email);
      }

      return cb(null, user);
    } catch (error) {
      console.error("❌ Error in Google Strategy:", error);
      return cb(error, null);
    }
  }
));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user._id, email: user.email, name: user.firstName + ' ' + user.lastName });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});