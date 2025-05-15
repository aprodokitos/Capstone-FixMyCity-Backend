const { PrismaClient, ReportStatus } = require("@prisma/client");
const prisma = new PrismaClient();
const uploadToCloudinary = require("../Utils/upload-to-cloudinary");
const deleteFromCloudinary = require("../Utils/delete-from-cloudinary");
const extractPublicId = require("../Utils/extract-cloudinary-publicid");

const createReport = async (req, res) => {
  try {
    const { title, description, location, userId, status } = req.body;
    const file = req.file;

    let imageUrl = null;

    if (file) {
      try {
        console.log(`Memulai upload Cloudinary untuk file: ${file.originalname}`);
        imageUrl = await uploadToCloudinary(
          file.buffer,
          "reports",
          file.originalname
        );
        console.log(`Berhasil mengupload ke Cloudinary: ${imageUrl}`);
      } catch (uploadError) {
        console.error("Error mengupload gambar ke Cloudinary:", uploadError);
        return res
          .status(500)
          .json({ error: uploadError.message || "Gagal mengupload gambar." });
      }
    }

    console.log("--- Upload Cloudinary selesai, melanjutkan ke DB create ---");
    console.log("Data yang akan disimpan:", { title, description, location, imageUrl, userId, status: status || "PENDING" });

    const report = await prisma.report.create({
      data: {
        title,
        description,
        location,
        imageUrl,
        userId,
        status: status || "PENDING",
      },
    });

    console.log("--- DB create selesai, laporan disimpan dengan ID:", report.id);

    res.status(201).json(report);
  } catch (err) {
    console.error("Error membuat laporan:", err);
    res.status(500).json({
      error: err.message || "Terjadi kesalahan saat membuat laporan.",
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const report = await prisma.report.findUnique({
      where: { id: parsedId },
      include: { comments: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Laporan tidak ditemukan" });
    }

    if (report.imageUrl) {
      report.imageUrl = `${req.protocol}://${req.get("host")}${report.imageUrl}`;
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { comments: true },
    });

    const updatedReports = reports.map((report) => {
      if (report.imageUrl) {
        report.imageUrl = `${req.protocol}://${req.get("host")}${report.imageUrl}`;
      }
      return report;
    });

    res.json(updatedReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID laporan tidak valid." });
    }

    const { title, description, location, status } = req.body;
    const file = req.file; // File baru jika diupload (dari Multer memoryStorage)

    const userRole = req.user.role; // Dari middleware verifyToken

    const updateData = {}; // Field yang bisa diupdate oleh SIAPA SAJA

    if (title !== undefined) {
      updateData.title = title;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (location !== undefined) {
      updateData.location = location;
    } // Field 'status' HANYA bisa diupdate oleh Admin

    if (userRole.toLowerCase() === "admin" && status !== undefined) {
      const validStatuses = Object.values(ReportStatus);
      if (validStatuses.includes(status)) {
        updateData.status = status;
      } else {
        console.warn(
          `Admin (${req.user.id}) attempted to set invalid status: ${status}`
        );
        return res.status(400).json({
          error: `Nilai status tidak valid. Gunakan salah satu: ${validStatuses.join(", ")}`,
        });
      }
    } else if (status !== undefined && userRole.toLowerCase() !== "admin") {
      console.warn(
        `Non-admin user (${req.user.id}) attempted to update status.`
      );
    }

    if (file) {
      const existingReport = await prisma.report.findUnique({
        where: { id: parsedId },
        select: { imageUrl: true }, // Ambil hanya field imageUrl
      });

      if (existingReport && existingReport.imageUrl) {
        const publicId = extractPublicId(existingReport.imageUrl);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
            console.log(`Deleted old image ${publicId} from Cloudinary`);
          } catch (deleteError) {
            console.error(
              `Failed to delete old image ${publicId} from Cloudinary:`,
              deleteError
            ); // Mungkin ingin memberi peringatan ke user tapi tidak menghentikan proses update
          }
        } else {
          console.warn(
            `Could not extract public ID from old image URL: ${existingReport.imageUrl}`
          );
        }
      } // Upload gambar baru ke Cloudinary

      try {
        const newImageUrl = await uploadToCloudinary(
          file.buffer,
          "reports",
          file.originalname
        );
        updateData.imageUrl = newImageUrl; // Set URL gambar baru untuk diupdate di database
      } catch (uploadError) {
        // Jika upload gambar baru gagal
        console.error("Error uploading new image to Cloudinary:", uploadError); // Batalkan proses update karena gambar baru tidak bisa diupload
        return res.status(500).json({
          error: uploadError.message || "Gagal mengupload gambar baru.",
        });
      }
    } else {
    }
    if (Object.keys(updateData).length === 0) {
      if (Object.keys(req.body).length > 0 || req.file) {
        return res.status(400).json({
          error:
            "Tidak ada field yang valid atau diizinkan untuk diupdate oleh role Anda, atau gambar baru gagal diupload.",
        });
      } else {
        return res
          .status(400)
          .json({ error: "Tidak ada data yang dikirim untuk diupdate." });
      }
    } // Lakukan update ke database

    console.log("--- Proceeding to DB update ---"); // Log Sebelum DB Update

    const updated = await prisma.report.update({
      where: { id: parsedId },
      data: updateData,
    });

    console.log("--- DB update finished, sending response ---"); // Log Setelah DB Update

    res.json(updated);
  } catch (err) {
    console.error("Error updating report:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }
    res.status(500).json({
      error: err.message || "Terjadi kesalahan saat mengupdate laporan.",
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID laporan tidak valid." });
    }
    
    // Ambil data laporan sebelum dihapus untuk mendapatkan URL gambar
    const existingReport = await prisma.report.findUnique({
      where: { id: parsedId },
      select: { imageUrl: true },
    });
    
    if (!existingReport) {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }
    
    // Hapus gambar dari Cloudinary jika ada
    if (existingReport.imageUrl) {
      const publicId = extractPublicId(existingReport.imageUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          console.log(`Deleted image ${publicId} from Cloudinary for report ${parsedId}`);
        } catch (deleteError) {
          console.error(
            `Failed to delete image ${publicId} from Cloudinary:`,
            deleteError
          );
          // Lanjutkan proses hapus meskipun image gagal dihapus dari Cloudinary
        }
      } else {
        console.warn(
          `Could not extract public ID from image URL: ${existingReport.imageUrl}`
        );
      }
    }
    
    // Hapus laporan dari database
    await prisma.report.delete({ where: { id: parsedId } });
    
    res.json({ message: "Laporan dan gambar terkait berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting report:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }
    res.status(500).json({ 
      error: err.message || "Terjadi kesalahan saat menghapus laporan." 
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
};
