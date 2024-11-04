const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/user");
const { validateUser } = require("../utils/validation");

// CREATE - Add a new user
router.post("/users", async (req, res) => {
  try {
    const { password, ...otherData } = req.body;

    // Encrypt password
    const hashPassword = await bcrypt.hash(password, saltRounds);
    validateUser(req);
    // Create a new user with hashed password
    const user = new User({ ...otherData, password: hashPassword });
    await user.save();

    res.status(201).send("User added!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// READ - Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// READ - Get a user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// UPDATE - Update a user by ID
router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User updated!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// PATCH - Partially update a user by ID
router.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User updated partially!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// DELETE - Delete a user by ID
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User deleted!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = router;
