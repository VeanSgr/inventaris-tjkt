import React, { useState } from 'react';

function ModalPinjam({ barang, isOpen, onClose, onSubmit }) {
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [jumlahPinjam, setJumlahPinjam] = useState(1); // Default pinjam 1 unit
  
  const today = new Date();
  const tglPinjam = today.toISOString().split('T')[0]; 

  const autoTglKembali = new Date();
  autoTglKembali.setDate(today.getDate() + 3);
  const tglKembali = autoTglKembali.toISOString().split('T')[0];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaPeminjam.trim()) return alert('Nama peminjam tidak boleh kosong!');
    
    const qty = parseInt(jumlahPinjam, 10);
    const stokTersedia = barang.stok || barang.stok_barang || 0;

    // Proteksi logika input kuantitas
    if (isNaN(qty) || qty <= 0) return alert('Jumlah peminjam minimal 1 unit, Bro!');
    if (qty > stokTersedia) return alert(`Stok tidak mencukupi! Batas maksimum peminjaman alat ini adalah ${stokTersedia} unit.`);

    onSubmit({
      id_barang: barang.id || barang.id_barang,
      nama_alat: barang.nama || barang.nama_barang,
      nama_peminjam: namaPeminjam,
      jumlah_pinjam: qty, // Kirim nilai Qty baru ke App.jsx
      tgl_pinjam: tglPinjam,
      tgl_kembali: tglKembali // Kirim batas estimasi kembali
    });
    
    setNamaPeminjam('');
    setJumlahPinjam(1);
  };

  const formatTanggalIndo = (dateStr) => {
    const opsi = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', opsi);
  };

  const stokTersedia = barang.stok || barang.stok_barang || 0;

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
          <img src={barang.gambar || barang.foto_barang} alt={barang.nama || barang.nama_barang} className="h-12 w-12 rounded-lg object-cover" />
          <div>
            <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{barang.nama || barang.nama_barang}</h4>
            <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-medium mr-2">{barang.kategori || 'Umum'}</span>
            <p className="text-xs text-emerald-400 inline-block">Tersedia: {stokTersedia} unit</p>
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
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* REVISI: Input Quantity Unit Alat */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Jumlah Alat Yang Dipinjam (Quantity)
            </label>
            <input 
              type="number"
              min="1"
              max={stokTersedia}
              value={jumlahPinjam}
              onChange={(e) => setJumlahPinjam(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
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