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
        imageUrl,
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

    const report = await prisma.report.findUnique({
      where: { id },
      include: { comments: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Laporan tidak ditemukan" });
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

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, status } = req.body;
    const file = req.file;
    const userRole = req.user.role;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;

    if (userRole.toLowerCase() === "admin" && status !== undefined) {
      const validStatuses = Object.values(ReportStatus);
      if (validStatuses.includes(status)) {
        updateData.status = status;
      } else {
        return res.status(400).json({
          error: `Nilai status tidak valid. Gunakan salah satu: ${validStatuses.join(", ")}`,
        });
      }
    } else if (status !== undefined && userRole.toLowerCase() !== "admin") {
      console.warn(`Non-admin user (${req.user.id}) attempted to update status.`);
    }

    if (file) {
      const existingReport = await prisma.report.findUnique({
        where: { id },
        select: { imageUrl: true },
      });

      if (existingReport?.imageUrl) {
        const publicId = extractPublicId(existingReport.imageUrl);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (deleteError) {
            console.error("Gagal menghapus gambar lama:", deleteError);
          }
        }
      }

      try {
        const newImageUrl = await uploadToCloudinary(
          file.buffer,
          "reports",
          file.originalname
        );
        updateData.imageUrl = newImageUrl;
      } catch (uploadError) {
        return res.status(500).json({
          error: uploadError.message || "Gagal mengupload gambar baru.",
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Tidak ada field yang valid atau diizinkan untuk diupdate.",
      });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: updateData,
    });

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

    const existingReport = await prisma.report.findUnique({
      where: { id },
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
        } catch (deleteError) {
          console.error("Gagal menghapus gambar:", deleteError);
        }
      }
    }

    await prisma.report.delete({ where: { id } });

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
      where: { userId },
      include: {
        comments: true,
        user: {
          select: {
            user_name: true,
            user_profile: true,
            user_email: true,
            role: {
              select: {
                role_name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching reports by user ID:", error);
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
