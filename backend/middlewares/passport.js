const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

console.log("🔍 Initializing Passport with:", {
  clientID: process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Missing",
  environment: process.env.NODE_ENV
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? "https://resumeport.onrender.com/api/auth/google/callback"
      : "http://localhost:9000/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      console.log("🔍 Google Profile received:", {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });
      
      // Try to find existing user by Google ID first, then by email
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Check if user exists with same email (from old Clerk data)
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Update existing user with Google ID
          user.googleId = profile.id;
          user.profileImage = profile.photos?.[0]?.value;
          await user.save();
          console.log("✅ Updated existing user with Google ID:", user.email);
        } else {
          // Create new user
          user = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profileImage: profile.photos?.[0]?.value,
          });
          await user.save();
          console.log("✅ New user created:", user.email);
        }
      } else {
        console.log("✅ Existing user found:", user.email);
      }

      return cb(null, user);
    } catch (error) {
      console.error("❌ Error in Google Strategy:", error);
      
      // Handle duplicate key errors more gracefully
      if (error.code === 11000) {
        console.log("🔄 Duplicate key error, trying to find existing user...");
        try {
          const existingUser = await User.findOne({ 
            $or: [
              { googleId: profile.id },
              { email: profile.emails[0].value }
            ]
          });
          if (existingUser) {
            return cb(null, existingUser);
          }
        } catch (findError) {
          console.error("❌ Error finding existing user:", findError);
        }
      }
      
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