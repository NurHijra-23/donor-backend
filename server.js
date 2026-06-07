console.log("SERVER INI YANG JALAN 🔥🔥🔥");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Donor = require("./models/Donor");
const authMiddleware = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token tidak ada"
      });
    }

    const token = authHeader.split(" ")[1];

    const verify = jwt.verify(token, JWT_SECRET);

    req.user = verify;

    next();

  } catch (err) {

    return res.status(401).json({
      message: "Token tidak valid"
    });

  }
};

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ CONNECT MONGODB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
  console.log("✅ MongoDB CONNECTED");
})
  .catch(err => console.log("❌ ERROR:", err.message));

/* =========================
   SCHEMA DONOR (TIDAK DIUBAH)
========================= */
const donorSchema = new mongoose.Schema({
  nama: String,
  jenisKelamin: String,
  umur: Number,
  beratBadan: Number,
  golonganDarah: String,
  lokasi: String,
  kontak: String,
  status: {
  type: String,
  default: "Aktif",
},

   userId: String, 
});

/* =========================
   🔥 TAMBAHAN: SCHEMA USER
========================= */
const userSchema = new mongoose.Schema({
  nama: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

/* =========================
   TEST INSERT (TIDAK DIUBAH)
========================= */
const testInsert = async () => {
  try {

    // ambil 1 user dari database
    const user = await User.findOne();

    // cek data test sudah ada atau belum
    const cek = await Donor.findOne({ nama: "TEST USER" });

    if (!cek) {

      const data = new Donor({
        nama: "TEST USER",
        jenisKelamin: "Perempuan",
        umur: 20,
        beratBadan: 50,
        golonganDarah: "O+",
        lokasi: "Parepare",
        kontak: "08123456789",
        userId: user._id
      });

      await data.save();

      console.log("🔥 DATA TEST BERHASIL MASUK");

    } else {

      console.log("⚠️ DATA TEST SUDAH ADA");

    }

  } catch (err) {

    console.log("❌ ERROR TEST:", err.message);

  }
};
testInsert();

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

/* =========================
   DONOR API (TIDAK DIUBAH)
========================= */
app.get("/donor", async (req, res) => {
  const data = await Donor.find();
  res.json(data);
});

app.get("/donor/user/:userId", async (req, res) => {
  const data = await Donor.findOne({ userId: req.params.userId });
  res.json(data);
});

app.post("/donor", authMiddleware, async (req, res) => {
  try {
    const data = await Donor.create({
      nama: req.body.nama,
      jenisKelamin: req.body.jenisKelamin,
      umur: req.body.umur,
      beratBadan: req.body.beratBadan,
      golonganDarah: req.body.golonganDarah,
      lokasi: req.body.lokasi,
      kontak: req.body.kontak,
      userId: req.body.userId 
    });

    res.json({ message: "Data berhasil disimpan", data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Gagal simpan" });
  }
});

/* =========================
   🔥 REGISTER USER
========================= */


app.post("/register", async (req, res) => {

  try {

    const { nama, email, password } = req.body;

    const cekUser = await User.findOne({ email });

    if (cekUser) {
      return res.status(400).json({
        message: "Email sudah digunakan"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      nama,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(200).json({
      message: "Register berhasil"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
});

/* =========================
   🔥 LOGIN USER
========================= */
app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email tidak ditemukan"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Password salah"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
});

app.delete("/donor/:id", async (req, res) => {
  try {
    const deleted = await Donor.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal hapus" });
  }
});

app.put("/donor/:id", async (req, res) => {
  try {
    const updated = await Donor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Berhasil update", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update" });
  }
});
/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});