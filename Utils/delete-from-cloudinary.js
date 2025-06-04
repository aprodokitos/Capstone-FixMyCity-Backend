const cloudinary = require("./cloudinary-config.js");

async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      return true;
    } else if (result.result === "not found") {
      console.warn(`Image not found in cloudinary ${publicId}`);
      return false;
    } else {
      console.warn(`Unexpected result : ${result.result}`);
      return false;
    }
  } catch (error) {
    console.error("[Cloudinary Delete Error]", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}

module.exports = deleteFromCloudinary;