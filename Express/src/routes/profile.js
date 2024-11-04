const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");

// READ - Get User Profile (PROTECTED)
router.get("/profile", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = router;
