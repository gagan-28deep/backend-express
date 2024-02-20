import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// JWT is a bearer token, who have the token we send data to them
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Just before saving data in middleware whatever we want to do.
// Like we want to encrypt the password.

// Avoid using arrow function in callback , as we want the current context reference

// Next -> as it is middleware
userSchema.pre("save", async function (next) {
  // Only change password if the password is modified , else return next
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// To check if the password returning is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
  // password -> who have called the method -> clear text password
  // this.password -> compare with the current password in the db -> encrypted one
  return await bcrypt.compare(password, this.password);
};

// generate access and refresh tokens

userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      // This -> from database , since we have method in the schema, this has access to all the data
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Refresh token has less information
userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      // This -> from database , since we have method in the schema, this has access to all the data
      _id: this._id,
    },
    process.env.REFRESH_TOEKN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
