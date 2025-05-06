const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addComment = async (req, res) => {
  try {
    const { text, reportId, userId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const comment = await prisma.comment.create({
      data: {
        text,
        reportId: parseInt(reportId),
        userId,
        imageUrl
      }
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCommentsByReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { reportId: parseInt(reportId) }
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updated = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: {
        text,
        ...(imageUrl && { imageUrl })
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addComment,
  getCommentsByReport,
  updateComment,
  deleteComment
};
