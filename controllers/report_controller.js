const { PrismaClient, ReportStatus } = require('@prisma/client');
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
        // Pastikan ID valid integer
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return res.status(400).json({ error: "ID laporan tidak valid." });
        }

        // Ambil semua potential fields dari body. Status akan ditangani secara kondisional.
        const { title, description, location, status } = req.body;
        // Ambil imageUrl dari file jika ada.
        // upload.single('image') sudah dijalankan sebelum ini dan menempelkan file ke req.file
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        // Ambil role pengguna dari token JWT (verifyToken middleware menempelkan ini)
        // Pastikan verifyToken menempelkan user object ke req, contoh: req.user = { id: '...', role: 'Admin' }
        const userRole = req.user.role;

        // Buat objek data yang akan diupdate di database
        const updateData = {};

        // 1. Field yang bisa diupdate oleh SIAPA SAJA (User atau Admin)
        // Hanya tambahkan field jika field tersebut ADA dalam request body
        if (title !== undefined) {
            updateData.title = title;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (location !== undefined) {
            updateData.location = location;
        }
        // Tambahkan imageUrl jika ada file yang diupload
        if (imageUrl !== undefined) {
             updateData.imageUrl = imageUrl;
        } else {
            // Opsional: Jika Anda ingin mengizinkan menghapus gambar dengan mengirim field gambar kosong/null
            // Anda mungkin perlu logika yang berbeda, ini hanya menangani penambahan/penggantian gambar saat upload baru.
        }


        // 2. Field 'status' HANYA bisa diupdate oleh Admin
        // Periksa apakah role adalah 'admin' DAN field 'status' ada di request body
        if (userRole.toLowerCase() === 'admin' && status !== undefined) {
             // Opsional tapi sangat disarankan: Validasi nilai status yang diterima
             // Pastikan nilai 'status' yang diterima ('PENDING', 'DIPROSES', 'SELESAI') sesuai dengan enum di Prisma
             const validStatuses = Object.values(ReportStatus); // Ambil nilai valid dari enum Prisma
             if (validStatuses.includes(status)) {
                 updateData.status = status;
             } else {
                 // Jika admin mengirim nilai status yang tidak valid
                 console.warn(`Admin (${req.user.id}) attempted to set invalid status: ${status}`);
                 return res.status(400).json({ error: `Nilai status tidak valid. Gunakan salah satu: ${validStatuses.join(', ')}` });
             }
        } else if (status !== undefined && userRole.toLowerCase() !== 'admin') {
            // Jika user NON-ADMIN mencoba mengupdate field 'status'
            console.warn(`Non-admin user (${req.user.id}) attempted to update status.`);
            // Anda bisa memilih:
            // A) Mengabaikan nilai status yang dikirim non-admin (tidak dimasukkan ke updateData) - KODE SAAT INI MELAKUKAN INI
            // B) Mengembalikan error 403 karena mencoba mengubah field terlarang
            // return res.status(403).json({ error: "Anda tidak memiliki akses untuk mengubah status laporan." }); // Jika memilih opsi B
        }

        // 3. Cek apakah ada data yang valid untuk diupdate setelah filtering role
        if (Object.keys(updateData).length === 0) {
            // Ini terjadi jika request body kosong, atau hanya berisi field yang tidak diizinkan/tidak valid
             if (Object.keys(req.body).length > 0 || req.file) {
                 // Jika ada data di body/file tapi tidak ada yang valid/diizinkan di updateData
                 // Ini bisa karena user biasa hanya mengirim status, atau field lain kosong
                 return res.status(400).json({ error: "Tidak ada field yang valid atau diizinkan untuk diupdate oleh role Anda." });
             } else {
                 // Jika body memang kosong dan tidak ada file sama sekali
                 return res.status(400).json({ error: "Tidak ada data yang dikirim untuk diupdate." });
             }
        }

        // Lakukan update ke database
        const updated = await prisma.report.update({
            where: { id: parsedId },
            data: updateData // Gunakan objek updateData yang sudah disaring
        });

        // Berikan response data laporan yang sudah diupdate
         if (updated.imageUrl) {
             updated.imageUrl = `${req.protocol}://${req.get('host')}${updated.imageUrl}`;
         }

        res.json(updated);

    } catch (err) {
        console.error("Error updating report:", err); // Log error di server untuk debugging
        // Tangani error spesifik (misalnya laporan tidak ditemukan)
        if (err.code === 'P2025') {
             return res.status(404).json({ error: "Laporan tidak ditemukan." });
        }
        // Tangani error lainnya
        res.status(500).json({ error: "Terjadi kesalahan saat mengupdate laporan." }); // Pesan error umum untuk klien
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
