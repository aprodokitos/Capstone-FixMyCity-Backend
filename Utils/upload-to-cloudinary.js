const cloudinary = require("./cloudinary-config.js");

function uploadToCloudinary(buffer, folderName, filename) {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("Tidak ada file buffer yang diberikan"));
    }

    const uploadOptions = {
      folder: folderName,
      resource_type: "auto", 
      public_id: filename.split('.')[0], 
    };

    const timeoutId = setTimeout(() => {
      console.error("Cloudinary upload timeout setelah 30 detik");
      reject(new Error("Upload timeout setelah 30 detik"));
    }, 30000); 
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Error upload Cloudinary:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    console.log("upload_stream dibuat. Menulis buffer...");
    uploadStream.end(buffer);
    console.log("Buffer ditulis ke stream. Menunggu callback...");
  });
}

module.exports = uploadToCloudinary;