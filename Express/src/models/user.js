const mongoose = require("mongoose");
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NodeJS_Practise";
const RESET_TOKEN_EXPIRATION = "7d";
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    gender: {
      type: String,
      required: true,
      validate(value) {
        const genders = ["Male", "Female", "Others"];
        if (!genders.includes(value)) {
          throw new Error("Gender not valid");
        }
      },
    },
    bio: {
      type: String,
      maxlength: 2000,
    },
    skills: {
      type: [String],
    },
    age: {
      type: Number,
      min: 18,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ id: user._id }, SECRET_KEY, {
    expiresIn: RESET_TOKEN_EXPIRATION,
  });
  return token;
};

userSchema.methods.validatePassword = async function (userInputPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordvalid = await bcrypt.compare(userInputPassword, passwordHash);
  return isPasswordvalid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
