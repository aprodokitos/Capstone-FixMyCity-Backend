const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const inputsearchBytitle = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Masukkan kata kunci pencarian",
      });
    }

    const reports = await prisma.report.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true, 
        title: true, 
        description: true, 
        createdAt: true, 
        status: true, 
        location: true, 
        imageUrl: true, 
        user: {
          select: {
            user_name: true, 
            user_email: true, 
          },
        },
      },
    });

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada laporan yang ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mencari laporan",
      data: reports,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mencari laporan",
      error: error.message,
    });
  }
};

const inputsearchBylocation = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Masukkan kata kunci pencarian",
      });
    }

    const reports = await prisma.report.findMany({
      where: {
        location: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true, 
        title: true, 
        description: true, 
        createdAt: true, 
        status: true, 
        location: true, 
        imageUrl: true, 
        user: {
          select: {
            user_name: true, 
            user_email: true, 
          },
        },
      },
    });

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada laporan yang ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mencari laporan",
      data: reports,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mencari laporan",
      error: error.message,
    });
  }
};

const inputsearchByStatus = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Masukkan kata kunci pencarian",
      });
    }

    const searchStatus = search.toUpperCase();

    const reports = await prisma.report.findMany({
      where: {
        status: {
          equals: searchStatus, 
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        status: true,
        location: true,
        imageUrl: true,
        user: {
          select: {
            user_name: true, 
            user_email: true, 
          },
        },
      },
    });

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada laporan yang ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mencari laporan",
      data: reports,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mencari laporan",
      error: error.message,
    });
  }
};

const inputsearchByuser = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Masukkan kata kunci pencarian",
      });
    }

    const reports = await prisma.report.findMany({
      where: {
        user: {
          OR: [
            {
              user_name: {
                contains: search,
                mode: "insensitive",
              }
            },
            {
              user_email: {
                contains: search,
                mode: "insensitive",
              }
            }
          ]
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        status: true,
        location: true,
        imageUrl: true,
        user: {
          select: {
            user_name: true, 
            user_email: true,   
          },
        },
      },
    });

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada laporan yang ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mencari laporan",
      data: reports,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mencari laporan",
      error: error.message,
    });
  }
};

module.exports = {
  inputsearchBytitle,
  inputsearchBylocation,
  inputsearchByStatus,
  inputsearchByuser
};
