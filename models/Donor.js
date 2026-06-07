const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  nama: {
    type: String,
    required: true,
  },

  jenisKelamin: {
    type: String,
    required: true,
  },

  umur: {
    type: Number,
    required: true,
  },

  beratBadan: {
    type: Number,
    required: true,
  },

  golonganDarah: {
    type: String,
    required: true,
  },

  lokasi: {
    type: String,
    required: true,
  },

  kontak: {
    type: String,
    required: true,
  },

    status: {
    type: String,
    default: "Aktif"
  }

  
}, {
  timestamps: true // 🔥 auto tanggal
});

module.exports = mongoose.model("Donor", donorSchema);