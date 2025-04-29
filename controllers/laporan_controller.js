const prisma = require('../config/prismaClient');

exports.createReport = async (req, res) => {
  try {
    const { title, description, photo_url, location, user_id } = req.body;

    const report = await prisma.report.create({
      data: {
        title,
        description,
        photo_url,
        location,
        user_id,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await prisma.report.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            user_name: true,
            user_email: true,
          },
        },
      },
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.report.update({
      where: { id_report: id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
