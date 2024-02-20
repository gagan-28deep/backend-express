import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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
  console.log("email", email);
  //   if(!fullName){
  //     throw new ApiError(400 , "fullname is required")
  //   }
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existingUser = User.findOne({
    $or: [{ username }, { email }],
  });
  //   console.log("existingUser" , existingUser);
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //   Middleware adds extra fields in request
  //   Gives localHost path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export { registerUser };
