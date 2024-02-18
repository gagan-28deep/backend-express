// This is the file which which is like index when we are using Db connection function in index file

// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import express from "express";

// Only for the first file
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";

import connectDb from "./db/index.js";
const app = express();

dotenv.config({
  path: "./env",
});
// Connection execution
connectDb();

// IIFEE

// THis is good but index/main file is polluted, we will different file for the connection.
// (async () => {
//   try {
//     await mongoose.connect(
//       `mongodb+srv://gagandeep:PxA7GS0ozfNRNsgx@db.vwgxpex.mongodb.net/?retryWrites=true&w=majority/${DB_NAME}`
//     );
//     app.on("error", (error) => {
//       console.log("error", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`Server running on PORT ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Error", error);
//     throw error;
//   }
// })();
