import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Token generation failed",
      [],
      "An error occurred while generating access and refresh tokens"
    );
  }
};

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
  // console.log("Registering user:", { username, email });

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
  const existedUser = await User.findOne({
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

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(
      400,
      "Avatar is required",
      [],
      "User registration failed due to missing avatar"
    );
  }

  // upload images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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
    username: username?.toLowerCase(),
    email,
    password,
    fullname,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
  });
  // remove password and refresh token from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
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
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body contains username and password
  // find user by username or email
  // check the password
  // access and refresh token generation
  // send cookies
  // send response to frontend

  // request body contains username and password
  const { email, username, password } = req.body;

  if (!username && !password) {
    throw new ApiError(
      400,
      "Username and password are required",
      [],
      "User login failed due to missing credentials"
    );
  }
  // find user by username or email
  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });
  if (!user) {
    throw new ApiError(
      404,
      "User not found",
      [],
      "User login failed due to non-existing user"
    );
  }
  //check the password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid usesr credentials",
      [],
      "User login failed due to incorrect password"
    );
  }

  // access and refresh token generation

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // send cookies
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
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined, // clear the refresh token
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(
      401,
      "Refresh token is required",
      [],
      "User refresh token failed due to missing refresh token"
    );
  }
  // verify the refresh token
 try {
   const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   );
   const user = await User.findById(decodedToken?._id);
   if (!user) {
     throw new ApiError(
       404,
       "User not found",
       [],
       "User refresh token failed due to non-existing user"
     );
   }
   if (incomingRefreshToken !== user?.refreshToken) {
     throw new ApiError(
       401,
       "refresh token is expired or invalid",
       [],
       "User refresh token failed due to invalid refresh token"
     );
   }
   const Options = {
     httpOnly: true,
     secure: true,
   };
   // generate new access token
   const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
     user._id );
   return res
     .status(200)
     .cookie("accessToken", accessToken, Options)
     .cookie("refreshToken", newRefreshToken, Options)
     .json(
       new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully")
     );
 
 } catch (error) {
    throw new ApiError(
      401,
      "Invalid refresh token",
      [],
      "User refresh token failed due to invalid refresh token"
    );
  
 }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
