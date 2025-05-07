const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReport = async (req, res) => {
  try {
    const { title, description, location, userId, status } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const report = await prisma.report.create({
      data: {
        title,
        description,
        location,
        imageUrl,
        userId,
        status: status || 'PENDING'
      }
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: { comments: true },
    });

    if (!report) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({ include: { comments: true } });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, status } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updated = await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        location,
        status,
        ...(imageUrl && { imageUrl })
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.report.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createReport,
  getAllReports,     
  getReportById,     
  updateReport,
  deleteReport,
};
