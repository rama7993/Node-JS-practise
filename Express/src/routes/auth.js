const express = require("express");
const router = express.Router();
const User = require("../models/user");

const { sendResetEmail } = require("../utils/reset-email");

// CREATE - Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 360000), // 7 days
      });
      res.status(200).send("User logged in successfully!");
    } else {
      throw new Error("Password is not correct");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// CREATE - Logout user
router.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });

    res.send("Logged out successfully!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// CREATE - Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }
    // Generate a password reset token
    const token = user.getJWT();
    await sendResetEmail(email, token);
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = router;
