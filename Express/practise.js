const express = require("express");
const app = express();

app.use("/", (req, res) => {
    res.send("Hello NodeJs");
  });

app.use("/hello", (req, res) => {
  res.send("Hello world");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
