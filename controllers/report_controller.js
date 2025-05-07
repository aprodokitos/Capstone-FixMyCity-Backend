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
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const report = await prisma.report.findUnique({
      where: { id: parsedId },
      include: { comments: true },
    });

    if (!report) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }

    if (report.imageUrl) {
      report.imageUrl = `${req.protocol}://${req.get('host')}${report.imageUrl}`;
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({ include: { comments: true } });

    const updatedReports = reports.map(report => {
      if (report.imageUrl) {
        report.imageUrl = `${req.protocol}://${req.get('host')}${report.imageUrl}`;
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
