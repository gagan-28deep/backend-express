import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

// We might get some json data and form data so we have to give settings for that
app.use(express.json({ limit: "16kb" }));

// For url encoder -> we have spaces converted to %20 ,eg-> gagan deep to gagan%20deep
// For that

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// We have to store files in our server, for that we have public directory

app.use(express.static("public"));

// For cookies -> we can access and set browser cookies from server.
// Secure cookies to user browser -> only browser can read and set.

app.use(cookieParser())