import React, { useState } from 'react';

function ModalPinjam({ barang, isOpen, onClose, onSubmit }) {
  const [namaPeminjam, setNamaPeminjam] = useState('');
  
  // Ambil tanggal hari ini (Format: YYYY-MM-DD)
  const today = new Date();
  const tglPinjam = today.toISOString().split('T')[0]; 

  // Hitung otomatis tanggal kembali (+3 hari dari hari ini)
  const autoTglKembali = new Date();
  autoTglKembali.setDate(today.getDate() + 3);
  const tglKembali = autoTglKembali.toISOString().split('T')[0];

  if (!isOpen) return null;

const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaPeminjam.trim()) return alert('Nama peminjam tidak boleh kosong!');
    
    onSubmit({
      id_barang: barang.id,
      nama_peminjam: namaPeminjam,
      tgl_pinjam: tglPinjam,
      tgl_kembali: "-" // Dikirim kosong/strip dulu, nanti diisi pas admin klik terima kembali
    });
    
    setNamaPeminjam('');
  };

  // Fungsi utilitas biar tampilan tanggal hari ini lebih enak dibaca manusia (Contoh: 02 Juli 2026)
  const formatTanggalIndo = (dateStr) => {
    const opsi = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', opsi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-100">Konfirmasi Peminjaman</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200">✕</button>
        </div>

        {/* Info Barang */}
        <div className="my-4 flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800/50">
          <img src={barang.gambar} alt={barang.nama} className="h-12 w-12 rounded-lg object-cover" />
          <div>
            <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{barang.nama}</h4>
            <p className="text-xs text-emerald-400">Tersedia: {barang.stok} unit</p>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Nama Lengkap Peminjam
            </label>
            <input 
              type="text"
              placeholder="Masukkan nama lengkap siswa..."
              value={namaPeminjam}
              onChange={(e) => setNamaPeminjam(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Info Tanggal Otomatis */}
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/30 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Tanggal Pinjam (Hari Ini):</span>
              <span className="font-semibold text-slate-200">{formatTanggalIndo(tglPinjam)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/50 pt-2">
              <span className="text-slate-400">Batas Pengembalian:</span>
              <span className="font-semibold text-rose-400">{formatTanggalIndo(tglKembali)} (Maks 3 Hari)</span>
            </div>
          </div>

          {/* Tombol Action */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-800 py-3 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200">
              Batal
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all duration-200">
              Minta Izin Pinjam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalPinjam;