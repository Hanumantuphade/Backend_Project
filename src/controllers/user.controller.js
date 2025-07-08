import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Assuming you have a cloudinary utility for image uploads


const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  // validation - user is not empty
  // check if user already exists:username or email
  //check for images,check for Avatar
  // upload images to cloudinary
  //create user in database
  //remove password and refresh token from response
  //check for user creation success
  //send response to frontend

  const { username, email, password, fullname } = req.body;
  console.log("Registering user:", { username, email });

  //validation

  if (
    [username, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All fields are required",
      [],
      "User registration failed due to empty fields"
    );
  }
  //check if user already exists
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      400,
      "User already exists",
      [],
      "User registration failed due to existing username or email"
    );
  }
  //check for images

  const avtarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avtarLocalPath) {
    throw new ApiError(
      400,
      "Avatar is required",
      [],
      "User registration failed due to missing avatar"
    );
  }

  // upload images to cloudinary
  const avatar = await User.uploadOnCloudinary(avtarLocalPath);
  const coverImage = await User.uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(
      500,
      "Avatar upload failed",
      [],
      "User registration failed due to avatar upload error"
    );
  }
  //create user in database
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullname,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
  });
  // remove password and refresh token from response
  const createdUser = User.findById(user._id).select("-password -refreshToken");
// check for user creation
  if (!createdUser) {
    throw new ApiError(
      500,
      "User creation failed",
      [],
      "User registration failed due to database error"
    );
  }
  //send response to frontend
return res.status(201).json(
    new ApiResponse(
      201,
      "User registered successfully",
      createdUser,
      "User registration successful"
    )
  );

});


export { registerUser };
