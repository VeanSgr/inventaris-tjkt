import React from 'react';

function CardBarang({ barang, onPinjam }) {
  const isStokHabis = barang.stok === 0;

  return (
    <div className="max-w-sm rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/5">
      {/* Gambar Alat */}
      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-800">
        <img 
          src={barang.gambar || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={barang.nama} 
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Badge Stok */}
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
          isStokHabis ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
        }`}>
          Stok: {barang.stok}
        </span>
      </div>

      {/* Info Alat */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-100 line-clamp-1">{barang.nama}</h3>
        <p className="mt-1 text-xs text-slate-400">Lab TJKT - Alat Praktikum</p>
      </div>

      {/* Tombol Aksi Eksklusif */}
      <div className="mt-5">
        {isStokHabis ? (
          <button 
            disabled
            className="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed border border-slate-700/50"
          >
            Stok Habis
          </button>
        ) : (
          <button 
            onClick={() => onPinjam(barang)}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/40 active:scale-95"
          >
            Pinjam Alat
          </button>
        )}
      </div>
    </div>
  );
}

export default CardBarang;