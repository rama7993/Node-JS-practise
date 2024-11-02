const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NodeJS_Practise";

const userAuth = async (req, res, next) => {
  try {
    //Read the token
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid token");
    }
    //Validate token
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(decoded);
    const { id: userId } = decoded;

    //Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
};

module.exports = { userAuth };
