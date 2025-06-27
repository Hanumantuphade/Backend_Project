import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("No file path provided");
    }
    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfully

    console.log("file uploaded successfully on cloudnary", response.url);
    return response.url;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Delete the file if upload fails
    console.error("Error uploading file to Cloudinary:", error);
  }
};

export { uploadOnCloudinary };
