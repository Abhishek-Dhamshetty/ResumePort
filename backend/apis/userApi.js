const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwtAuthMiddleware = require("../middlewares/jwtAuth");

const userApp = express.Router();

// 📌 Get User Profile
userApp.get(
  "/profile",
  jwtAuthMiddleware,
  expressAsyncHandler(async (req, res) => {
    try {
      console.log("🔹 Fetching user profile for User ID:", req.user._id);
      
      res.status(200).json({ success: true, user: req.user });
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      res.status(500).json({ success: false, message: "Error fetching user data", error });
    }
  })
);

// 📌 Update User Profile
userApp.put(
  "/profile",
  jwtAuthMiddleware,
  expressAsyncHandler(async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName, email },
        { new: true }
      );

      res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("❌ Error updating user profile:", error);
      res.status(500).json({ success: false, message: "Error updating user", error });
    }
  })
);

// 📌 Delete User Account
userApp.delete(
  "/",
  jwtAuthMiddleware,
  expressAsyncHandler(async (req, res) => {
    try {
      console.log("🔹 Deleting user with ID:", req.user._id);
      await User.findByIdAndDelete(req.user._id);

      console.log("✅ User deleted successfully from MongoDB");
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      res.status(500).json({ success: false, message: "Error deleting user", error });
    }
  })
);

module.exports = userApp;