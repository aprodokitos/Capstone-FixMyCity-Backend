const cloudinary = require("./cloudinary-config.js");

function uploadToCloudinary(buffer, folderName, filename) {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("Tidak ada file buffer yang diberikan"));
    }

    // Membuat options yang sesuai untuk upload
    const uploadOptions = {
      folder: folderName,
      resource_type: "auto", // Deteksi tipe file secara otomatis
      public_id: filename.split('.')[0], // Hapus ekstensi file untuk public_id
    };

    console.log(`Mencoba mengupload file "${filename}"...`);
    
    // Tambahkan timeout untuk mencegah request menggantung
    const timeoutId = setTimeout(() => {
      console.error("Cloudinary upload timeout setelah 30 detik");
      reject(new Error("Upload timeout setelah 30 detik"));
    }, 30000); // 30 detik timeout
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        // Hapus timeout karena sudah mendapat respon
        clearTimeout(timeoutId);
        
        console.log("--- MASUK DALAM CLOUDINARY CALLBACK ---");
        
        if (error) {
          console.error("Error upload Cloudinary:", error);
          return reject(error);
        }
        
        console.log("Upload Cloudinary berhasil. Hasil:", result);
        // Kembalikan URL aman dari hasil
        resolve(result.secure_url);
      }
    );

    console.log("upload_stream dibuat. Menulis buffer...");
    uploadStream.end(buffer);
    console.log("Buffer ditulis ke stream. Menunggu callback...");
  });
}

module.exports = uploadToCloudinary;