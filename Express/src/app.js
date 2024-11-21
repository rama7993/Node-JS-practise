const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const usersRouter = require("./routes/users");
const requestRouter = require("./routes/request");

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", usersRouter);
app.use("/request", requestRouter);

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
