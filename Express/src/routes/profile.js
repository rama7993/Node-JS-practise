const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const User = require("../models/user");

// READ - Get User Profile (PROTECTED)
router.get("/profile", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// CREATE - Reset password
router.post("/reset-password", userAuth, async (req, res) => {
  const { user } = req;
  const { newPassword } = req.body;

  try {
    console.log(user);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
