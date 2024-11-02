const mongoose = require("mongoose");
const URI =
  "mongodb+srv://Rama7993:k1hwY4svZouDsAm8@nodejs-practise.wtxno.mongodb.net/practise";

const connectDB = async () => {
  await mongoose.connect(URI);
};

module.exports = connectDB;
