const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CREATE
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

// READ ALL
const getAllComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany();

    const updatedComments = comments.map(comment => {
      if (comment.imageUrl) {
        comment.imageUrl = `${req.protocol}://${req.get('host')}${comment.imageUrl}`;
      }
      return comment;
    });

    res.json(updatedComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ BY ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parsedId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }

    if (comment.imageUrl) {
      comment.imageUrl = `${req.protocol}://${req.get('host')}${comment.imageUrl}`;
    }

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
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

// DELETE
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment
};
