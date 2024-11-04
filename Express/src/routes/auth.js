const express = require("express");
const router = express.Router();
const User = require("../models/user");

// CREATE - Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Email id doesn't exists");
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

module.exports = router;
