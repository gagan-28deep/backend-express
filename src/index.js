// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import express from "express";

import connectDb from "./db/index.js";
const app = express();

dotenv.config({
  path: "./env",
});
// Connection execution
connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to DB");
  });
