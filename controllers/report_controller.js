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
        imageUrl = await uploadToCloudinary(
          file.buffer,
          "reports",
          file.originalname
        );
        // imageUrl di sini SUDAH berupa URL lengkap dari Cloudinary (misal: https://res.cloudinary.com/...)
      } catch (uploadError) {
        console.error("Error mengupload gambar ke Cloudinary:", uploadError);
        return res
          .status(500)
          .json({ error: uploadError.message || "Gagal mengupload gambar." });
      }
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        location,
        imageUrl, // Simpan URL Cloudinary apa adanya
        userId,
        status: status || "PENDING",
      },
    });

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

    // --- HAPUS BARIS INI ---
    // if (report.imageUrl) {
    //   report.imageUrl = `${req.protocol}://${req.get("host")}${report.imageUrl}`;
    // }
    // --- HAPUS BARIS INI ---

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
      // --- HAPUS BARIS INI ---
      // if (report.imageUrl) {
      //   report.imageUrl = `${req.protocol}://${req.get("host")}${report.imageUrl}`;
      // }
      // --- HAPUS BARIS INI ---
      return report; // Hanya kembalikan laporan apa adanya
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
    const file = req.file;

    const userRole = req.user.role;

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
        select: { imageUrl: true },
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
            );
          }
        } else {
          console.warn(
            `Could not extract public ID from old image URL: ${existingReport.imageUrl}`
          );
        }
      }

      try {
        const newImageUrl = await uploadToCloudinary(
          file.buffer,
          "reports",
          file.originalname
        );
        updateData.imageUrl = newImageUrl; // Simpan URL Cloudinary apa adanya
      } catch (uploadError) {
        console.error("Error uploading new image to Cloudinary:", uploadError);
        return res.status(500).json({
          error: uploadError.message || "Gagal mengupload gambar baru.",
        });
      }
    } else {
      // Jika tidak ada file baru diupload, pastikan imageUrl tidak di-reset
      // Anda mungkin ingin menambahkan logika untuk menghapus gambar jika request.body.imageUrl = null/empty string
      // Tapi untuk saat ini, biarkan saja jika tidak ada file baru
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
    }

    const updated = await prisma.report.update({
      where: { id: parsedId },
      data: updateData,
    });

    console.log("--- DB update finished, sending response ---");

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

    const existingReport = await prisma.report.findUnique({
      where: { id: parsedId },
      select: { imageUrl: true },
    });

    if (!existingReport) {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }

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
        }
      } else {
        console.warn(
          `Could not extract public ID from image URL: ${existingReport.imageUrl}`
        );
      }
    }

    await prisma.report.delete({ where: { id: parsedId } });

    res.json({ message: "Laporan dan gambar terkait berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting report:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }
    res.status(500).json({
      error: err.message || "Terjadi kesalahan saat menghapus laporan.",
    });
  }
};

const getReportsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await prisma.report.findMany({
      where: {
        userId: userId,
      },
      include: {
        comments: true,
        user: { // Tambahkan include user di sini
          select: { // Pilih field user yang ingin Anda tampilkan
            user_name: true,
            user_profile: true,
            user_email: true,
            role: {
              select: {
                role_name: true
              }
            }
          }
        }
      },
    });

    if (reports.length === 0) {
      return res.status(200).json({ success: true, data: [] }); // Kembalikan array kosong jika tidak ada laporan, bukan 404
    }

    const formattedReports = reports.map((report) => {
      // --- HAPUS BARIS INI ---
      // if (report.imageUrl) {
      //   report.imageUrl = `${req.protocol}://${req.get("host")}${report.imageUrl}`;
      // }
      // --- HAPUS BARIS INI ---
      return report; // Kembalikan laporan apa adanya
    });

    res.status(200).json({ success: true, data: formattedReports });
  } catch (error) {
    console.error("Error fetching reports by user ID:", error); // Lebih spesifik log error-nya
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportsByUserId,
};