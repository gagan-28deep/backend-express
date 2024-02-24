import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user?.generateAccessToken();
    const refreshToken = await user?.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While Generating Refresh And Access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //  Get user details from front-end
  // Validation (if there is any empty details)
  // If user already exists (via username or email)
  // Check for images , check for avatars (if yes, upload them to cloudinary)
  // create a user object -> create entry in db
  // Remove password and refreshToken fields while sending to frontend
  // Check for user creation
  // Return response or error

  const { fullName, email, username, password } = req.body;
  //   if(!fullName){
  //     throw new ApiError(400 , "fullname is required")
  //   }
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  //   console.log("existingUser" , existingUser);
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //   Middleware adds extra fields in request
  //   Gives localHost path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    // coverImage : coverImage ? coverImage.url : ""
    coverImage: coverImage.url || "",
    email,
    password,
    username: username?.toLowerCase(),
  });
  const createdUser = await User.findById(user?._id).select(
    // We can give -sign and select which are not required
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while creating a user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Get data from req body
  // find user based on email or username
  //Check password
  //send access and refresh token in cookies

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  let user = await User.findOne({
    $or: [
      { username },
      {
        email,
      },
    ],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user?.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    user?._id
  );

  // Here we can either have another db query to get refresh and access token , or we can modify the existing (User) object

  const loggedInUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  // Cookies should only be modified by the server, not from the front-end
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOEKN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateRefreshAndAccessToken(user?._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logOutUser, refreshAccessToken };
