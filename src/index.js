// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import express from "express";

import connectDb from "./db/index.js";
const app = express();

dotenv.config({
  path: "./env",
});
// Connection execution
connectDb();
