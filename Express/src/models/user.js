const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

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

module.exports = mongoose.model("User", userSchema);
