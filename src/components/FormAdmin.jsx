import React, { useState } from 'react';

function FormAdmin({ onTambahBarang, isLoading }) {
  const [nama, setNama] = useState('');
  const [stok, setStok] = useState('');
  const [gambarBase64, setGambarBase64] = useState('');

  // Fungsi sakti buat ubah file foto langsung jadi teks Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran (opsional, saran maks 2MB biar sheets gak keberatan)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto terlalu besar! Maksimal 2MB ya Bro.");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGambarBase64(reader.result); // Hasilnya string panjang: data:image/png;base64,...
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || !stok || !gambarBase64) return alert("Isi semua data dulu beserta fotonya, Bro!");

    onTambahBarang({
      nama,
      stok: parseInt(stok, 10),
      gambar: gambarBase64 // Kirim teks string gambar ke API
    });

    // Reset Form setelah submit
    setNama('');
    setStok('');
    setGambarBase64('');
    e.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm max-w-xl mx-auto mb-12">
      <h2 className="text-xl font-bold text-slate-100 mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
        Panel Admin: Input Alat Baru
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nama Alat</label>
          <input 
            type="text" 
            value={nama} 
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Tang Crimping Schneider"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Jumlah Stok awal</label>
            <input 
              type="number" 
              value={stok} 
              onChange={(e) => setStok(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Foto Alat Lab</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Preview Foto Sebelum Upload */}
        {gambarBase64 && (
          <div className="mt-2">
            <p className="text-[10px] uppercase text-slate-500 mb-1">Preview Foto:</p>
            <img src={gambarBase64} alt="preview" className="h-28 w-44 object-cover rounded-xl border border-slate-800" />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? "Menyimpan ke Sheets..." : "Simpan Alat Baru"}
        </button>
      </form>
    </div>
  );
}

export default FormAdmin;