const mongoose = require("mongoose");
require("dotenv").config();

console.log("URI loaded:", !!process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("CONNECTED TO MONGODB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FULL ERROR:");
    console.error(err);
    process.exit(1);
  });