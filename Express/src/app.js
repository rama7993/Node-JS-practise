const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateUser } = require("./utils/validation");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NodeJS_Practise";
const { userAuth } = require("./middlewares/auth");

//Middlewares
app.use(express.json());
app.use(cookieParser());

// CREATE - Add a new user
app.post("/users", async (req, res) => {
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

// CREATE - Login user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Email id doesn't exists");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign({ id: user._id }, SECRET_KEY);
      res.cookie("token", token);
      res.status(200).send("User logged in successfully!");
    } else {
      throw new Error("Password is not correct");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// READ - Get User Profile (PROTECTED)
app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error("Invalid token");
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(decoded);
    const { id: userId } = decoded;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// READ - Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// READ - Get a user by ID
app.get("/users/:id", async (req, res) => {
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
app.put("/users/:id", async (req, res) => {
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
app.patch("/users/:id", async (req, res) => {
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
app.delete("/users/:id", async (req, res) => {
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

const port = process.env.PORT || 3000;
connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(port, () => {
      console.log(`Server listening on port ${port}...`);
    });
  })
  .catch(() => {
    console.log("Database connection failed..");
  });
