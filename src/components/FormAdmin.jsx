import React, { useState } from 'react';

function FormAdmin({ onTambahBarang, isLoading }) {
  const [nama, setNama] = useState('');
  const [stok, setStok] = useState('');
  const [kategori, setKategori] = useState(''); // State Baru buat Kategori
  const [gambarBase64, setGambarBase64] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto terlalu besar! Maksimal 2MB ya Bro.");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGambarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || !stok || !kategori || !gambarBase64) return alert("Isi semua data termasuk kategori dan fotonya, Bro!");

    // Menyesuaikan key data payload dengan App.jsx & GAS backend
    onTambahBarang({
      nama_barang: nama,
      stok: parseInt(stok, 10),
      kategori: kategori, 
      foto_barang: gambarBase64 
    });

    // Reset Form
    setNama('');
    setStok('');
    setKategori('');
    setGambarBase64('');
    e.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm max-w-xl mx-auto mb-12">
      <h2 className="text-xl font-bold text-slate-100 mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
        Panel Admin: Input Alat Baru
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nama Alat</label>
          <input 
            type="text" 
            value={nama} 
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Mikrotik RB951Ui-2HnD"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
            required
          />
        </div>

        {/* REVISI: Mengubah grid menjadi 3 kolom untuk menyelipkan Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Jumlah Stok</label>
            <input 
              type="number" 
              value={stok} 
              onChange={(e) => setStok(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Kategori / Rak</label>
            <input 
              type="text" 
              value={kategori} 
              onChange={(e) => setKategori(e.target.value)}
              placeholder="Contoh: Rak 1, Tools, dll"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Foto Alat Lab</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-2 file:py-2.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer"
              required={!gambarBase64}
            />
          </div>
        </div>

        {gambarBase64 && (
          <div className="mt-2">
            <p className="text-[10px] uppercase text-slate-500 mb-1">Preview Foto:</p>
            <img src={gambarBase64} alt="preview" className="h-28 w-44 object-cover rounded-xl border border-slate-800" />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? "Menyimpan ke Sheets..." : "Simpan Alat Baru"}
        </button>
      </form>
    </div>
  );
}

export default FormAdmin;