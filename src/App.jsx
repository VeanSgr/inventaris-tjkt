import React, { useState, useEffect } from 'react';

// ========================================================
// 🛠️ CONFIG & KREDENSIAL UTAMA
// ========================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbx2sfMYJznjLthK3h9Bq24bBKe8cGrjErBCOYZrJBzIxMtrzhXpK_AIe7IfRI-Dzz0n3w/exec';
const PIN_ADMIN = 'sXyKl$Pewk?'; 

// ========================================================
// 🧩 KOMPONEN INLINE (Biar folder components bisa dihapus)
// ========================================================

const CardBarang = ({ barang, onPinjam }) => {
  const idTarget = barang.id || barang.id_barang;
  const namaTarget = barang.nama || barang.nama_barang || barang.nama_alat;
  const stokTersedia = barang.stok_tersedia !== undefined ? barang.stok_tersedia : (barang.stok || 0);
  const stokTotal = barang.stok_total !== undefined ? barang.stok_total : (barang.stok || 0);
  const gambarSrc = barang.gambar || '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-all duration-300">
      <div>
        {/* Frame Gambar Alat */}
        <div className="w-full h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80 mb-4 flex items-center justify-center relative">
          {gambarSrc ? (
            <img 
              src={gambarSrc} 
              alt={namaTarget} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = ''; }} // fallback jika error
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-700">
              <span className="text-4xl mb-1">🔌</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600">No Image</span>
            </div>
          )}
        </div>

        <div className="text-[10px] bg-slate-950 inline-block px-2 py-1 rounded text-amber-400 font-bold uppercase tracking-wider border border-slate-800 mb-3">
          {barang.kategori || 'Umum'}
        </div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors truncate">
          {namaTarget}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Stok Tersedia: <span className="text-emerald-400 font-bold text-sm ml-1">{stokTersedia}</span> 
          <span className="text-slate-600"> / {stokTotal}</span>
        </p>
      </div>
      <button
        onClick={() => onPinjam(barang)}
        disabled={stokTersedia <= 0}
        className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-[0.98] ${
          stokTersedia > 0 
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
        }`}
      >
        {stokTersedia > 0 ? 'Pinjam Alat' : 'Stok Habis'}
      </button>
    </div>
  );
};

const FormAdmin = ({ onTambahBarang, isLoading }) => {
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [stok, setStok] = useState(1);
  const [gambar, setGambar] = useState(''); // Menyimpan data Base64 gambar
  const [preview, setPreview] = useState('');

  // Handler Konversi & Kompresi Gambar ke Base64 (Maks 250x250px agar muat di sel Sheets)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Kompresi kualitas gambar ke JPEG 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setGambar(dataUrl);
          setPreview(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onTambahBarang({ nama_alat: nama, kategori, stok, gambar });
    setNama('');
    setKategori('');
    setStok(1);
    setGambar('');
    setPreview('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-900/40 rounded-xl border border-slate-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">➕</div>
        <h3 className="text-md font-bold text-white">Input Perangkat Baru</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Nama Alat</label>
            <input required type="text" placeholder="Cth: Mikrotik RB951" value={nama} onChange={e=>setNama(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-700" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Kategori</label>
            <input required type="text" placeholder="Cth: Router" value={kategori} onChange={e=>setKategori(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-700" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Stok Awal</label>
            <input required type="number" min="1" placeholder="Qty" value={stok} onChange={e=>setStok(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Upload Gambar Alat</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer cursor-pointer focus:outline-none" />
          </div>
        </div>

        {/* Box Preview Gambar */}
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-2 bg-slate-950/40">
          {preview ? (
            <div className="relative w-full h-full max-h-[110px] rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              <button type="button" onClick={() => { setGambar(''); setPreview(''); }} className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 text-[8px] font-bold">✕</button>
            </div>
          ) : (
            <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Preview Gambar</span>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button disabled={isLoading} type="submit" className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20 active:scale-95">
          {isLoading ? 'Menyimpan...' : 'Simpan ke Database'}
        </button>
      </div>
    </form>
  );
};

// ========================================================
// 🛠️ MEMBUAT MODAL PINJAM PERSIS SEPERTI GAMBAR MOCKUP
// ========================================================
const ModalPinjam = ({ barang, isOpen, onClose, onSubmit, isLoading }) => {
  const [nama, setNama] = useState('');
  const [qty, setQty] = useState(1);
  
  if (!isOpen || !barang) return null;
  
  const namaTarget = barang.nama || barang.nama_barang || barang.nama_alat;
  const stokTersedia = barang.stok_terfilter !== undefined ? barang.stok_terfilter : (barang.stok_tersedia || barang.stok || 1);
  const gambarSrc = barang.gambar || '';

  // Hitung tanggal pinjam (hari ini) dan batas pengembalian (hari ini + 3 hari)
  const hariIni = new Date();
  const batasKembali = new Date();
  batasKembali.setDate(hariIni.getDate() + 3);

  // Format tanggal lokal Indonesia: Cth "02 Juli 2026"
  const formatTglLokal = (dateObj) => {
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      id_barang: barang.id || barang.id_barang, 
      nama_alat: namaTarget, 
      nama_peminjam: nama, 
      qty: qty,
      tgl_pinjam: hariIni.toISOString().split('T')[0] // Mengirim format standar YYYY-MM-DD ke server GAS
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-[#070a13]/85 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      
      {/* Box Modal */}
      <div className="relative bg-[#111625] border border-slate-800/80 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl shadow-black/90">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white tracking-wide">Konfirmasi Peminjaman</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-all text-xl p-1">
            ✕
          </button>
        </div>

        {/* Card Ringkasan Alat */}
        <div className="bg-[#0c0f1a] border border-slate-800/50 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
            {gambarSrc ? (
              <img src={gambarSrc} alt={namaTarget} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🔌</span>
            )}
          </div>
          <div>
            <h4 className="text-md font-extrabold text-white">{namaTarget}</h4>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              Tersedia: {stokTersedia} unit
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Nama Peminjam */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Nama Lengkap Peminjam
            </label>
            <input 
              required 
              type="text" 
              value={nama} 
              onChange={e => setNama(e.target.value)} 
              className="w-full bg-[#0a0d16] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-slate-600 font-medium" 
              placeholder="Masukkan nama lengkap siswa..." 
            />
          </div>

          {/* Input Qty */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Jumlah Pinjam (Qty)
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">Maksimal: {stokTersedia}</span>
            </div>
            <input 
              required 
              type="number" 
              min="1" 
              max={stokTersedia} 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))} 
              className="w-full bg-[#0a0d16] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all font-semibold" 
            />
          </div>

          {/* Bagian Tanggal & Batas Pinjam (Sesuai Mockup) */}
          <div className="bg-[#0c0f1a] border border-slate-850 rounded-2xl p-4 space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tanggal Pinjam (Hari Ini):</span>
              <span className="text-slate-200">{formatTglLokal(hariIni)}</span>
            </div>
            <div className="border-t border-slate-800/60"></div>
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Batas Pengembalian:</span>
              <div className="text-right">
                <span className="text-red-400 block">{formatTglLokal(batasKembali)}</span>
                <span className="text-[10px] text-red-400/80 font-semibold">(Maks 3 Hari)</span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all active:scale-95"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-500/10"
            >
              {isLoading ? 'Memproses...' : 'Minta Izin Pinjam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================================
// 🚀 APLIKASI UTAMA
// ========================================================

function App() {
  const [daftarBarang, setDaftarBarang] = useState([]);
  const [logPeminjaman, setLogPeminjaman] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [currentPage, setCurrentPage] = useState('user');
  const [searchQuery, setSearchQuery] = useState(''); // State Search Bar
  
  const [inputPin, setInputPin] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const page = queryParams.get('page');
    if (page === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('user');
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.barang) {
        setDaftarBarang(data.barang);
        setLogPeminjaman(data.log_peminjaman || []);
      } else {
        setDaftarBarang(data);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi Sheets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (logPeminjaman.length === 0) {
      alert("Belum ada data log sirkulasi bulan ini untuk di-export, Bro!");
      return;
    }

    const headers = ["No", "ID Peminjaman", "Nama Siswa / Peminjam", "ID Alat", "Nama Perangkat Lab", "Jumlah (Qty)", "Tanggal Pinjam", "Tanggal Pengembalian", "Status Sirkulasi"];
    
    const rows = logPeminjaman.map((log, index) => {
      const cleanNamaPeminjam = (log.nama_peminjam || "").replace(/"/g, '""');
      const cleanNamaAlat = (log.nama_alat || "").replace(/"/g, '""');
      const qty = log.jumlah_pinjam || log.qty || 1;
      const tglPinjam = formatTgl(log.tgl_pinjam);
      const tglKembali = formatTgl(log.tgl_kembali);
      const status = log.status || "-";

      return [
        index + 1,
        `"${log.id_pinjam || ""}"`,
        `"${cleanNamaPeminjam}"`,
        `"${log.id_barang || ""}"`,
        `"${cleanNamaAlat}"`,
        qty,
        `"${tglPinjam}"`,
        `"${tglKembali}"`,
        `"${status}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const tglNow = new Date();
    const namaFile = `Laporan_Inventaris_TJKT_${bulanIndo[tglNow.getMonth()]}_${tglNow.getFullYear()}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", namaFile);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTambahBarangKeSheets = async (dataBarangBaru) => {
    setIsLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "addBarang", ...dataBarangBaru })
      });
      alert("Barang berhasil ditambahkan ke database!");
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan barang.");
      setIsLoading(false);
    }
  };

  const handleHapusBarang = async (barang) => {
    const idTarget = barang.id || barang.id_barang;
    const namaTarget = barang.nama || barang.nama_barang || barang.nama_alat;

    if (!idTarget) {
      alert(`Gagal menghapus! ID untuk alat "${namaTarget}" tidak terbaca.`);
      return;
    }

    if (!window.confirm(`Apakah lu yakin mau menghapus alat "${namaTarget}" dari sistem, Bro?`)) return;
    setIsLoading(true);

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "hapusBarang", id_barang: idTarget })
      });
      alert("Alat sukses dihapus!");
      fetchAllData(); 
    } catch (error) {
      console.error(error);
      alert("Gagal koneksi ke server untuk menghapus barang.");
      setIsLoading(false);
    }
  };

  const handleKembalikanBarang = async (idPinjam, idBarang) => {
    if (!window.confirm("Pastikan fisik alat sudah dicek dengan aman ya, Bro?")) return;
    setIsLoading(true);
    const hariIni = new Date().toISOString().split('T')[0];

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: "kembalikanAlat",
          id_pinjam: idPinjam,
          id_barang: idBarang,
          tgl_kembali_real: hariIni 
        })
      });
      alert("Proses pengembalian barang sukses!");
      fetchAllData(); 
    } catch (error) {
      console.error(error);
      alert("Gagal memproses pengembalian.");
      setIsLoading(false);
    }
  };

  const handlePinjamKlik = (barang) => {
    setSelectedBarang(barang);
    setIsModalOpen(true);
  };

  const handleProsesPeminjaman = async (dataPayload) => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "pinjamAlat", ...dataPayload })
      });
      alert("Izin peminjaman alat berhasil diproses!");
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("Gagal memproses transaksi peminjaman.");
      setIsLoading(false);
    }
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    if (inputPin === PIN_ADMIN) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
    } else {
      alert('PIN Salah, Bro! Akses Ditolak.');
      setInputPin('');
    }
  };

  const formatTgl = (dateStr) => {
    if (!dateStr || dateStr === "-") return '-';
    const opsi = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', opsi);
  };

  const listKategoriUnik = ['Semua', ...new Set(daftarBarang.map(b => b.kategori || 'Umum'))];

  // Logic filter gabungan Kategori & Search Bar
  const barangTerfilter = daftarBarang.filter(b => {
    const matchKategori = selectedKategori === 'Semua' || (b.kategori || 'Umum') === selectedKategori;
    const namaAlat = b.nama || b.nama_barang || b.nama_alat || '';
    const matchSearch = namaAlat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });

  // ========================================================
  // RENDER: DASHBOARD INTERNAL ADMIN
  // ========================================================
  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-[#070a13] p-4 md:p-8 text-slate-100 antialiased font-sans relative overflow-x-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="mx-auto max-w-6xl relative z-10">
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/30 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">Sistem Inventaris Lab</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white to-amber-300 bg-clip-text text-transparent">
                Dashboard Admin TJKT
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Pantau sirkulasi, manajemen klasifikasi rak, and export laporan database.</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('isAdminLoggedIn');
                window.location.origin ? window.location.href = window.location.origin : window.location.reload();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all active:scale-95"
            >
              ← Keluar ke Mode Siswa
            </button>
          </header>

          {!isAdminLoggedIn ? (
            <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-xl">🔒</div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">Otentikasi Berlapis</h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">Masukkan PIN verifikasi untuk memvalidasi akses administrasi.</p>
              <form onSubmit={handleLoginAdmin} className="space-y-4">
                <input 
                  type="password" placeholder="••••••" value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  className="w-full text-center tracking-[0.4em] rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3.5 text-3xl font-extrabold text-amber-400 focus:border-amber-500/50 focus:outline-none transition-all"
                  required
                />
                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 shadow-lg active:scale-95">
                  Verifikasi PIN
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <FormAdmin onTambahBarang={handleTambahBarangKeSheets} isLoading={isLoading} />

              {/* MANAJEMEN RAK */}
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/20 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm">📦</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 tracking-tight">Manajemen Rak Alat</h2>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-6 text-xs text-slate-400">Memuat data rak...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daftarBarang.map((barang) => {
                      const idItem = barang.id || barang.id_barang;
                      const namaItem = barang.nama || barang.nama_barang || barang.nama_alat;
                      
                      const stokTersedia = barang.stok_tersedia !== undefined ? barang.stok_tersedia : (barang.stok || 0);
                      const stokTotal = barang.stok_total !== undefined ? barang.stok_total : (barang.stok || 0);

                      return (
                        <div key={idItem} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center group hover:border-slate-700/80 transition-all">
                          <div className="overflow-hidden pr-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                              {barang.gambar ? (
                                <img src={barang.gambar} alt="" className="w-full h-full object-cover" />
                              ) : <span className="text-xs">🔌</span>}
                            </div>
                            <div className="truncate">
                              <h4 className="text-sm font-bold text-slate-200 truncate">{namaItem}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded text-amber-400">{barang.kategori || 'Umum'}</span>
                                <p className="text-[10px] text-slate-400">
                                  Tersedia: <span className="text-emerald-400 font-semibold">{stokTersedia}</span> / <span className="text-slate-300 font-semibold">{stokTotal}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleHapusBarang(barang)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white text-xs font-bold rounded-lg transition-all active:scale-95 flex-shrink-0">
                            Hapus
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* TABEL LOG SIRKULASI */}
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/20 p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">📋</div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100 tracking-tight">Log Sirkulasi Alat</h2>
                    </div>
                  </div>
                  
                  {/* EXPORT LAPORAN */}
                  <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95">
                    <span>📊</span> Export Laporan (.csv)
                  </button>
                </div>
                
                {isLoading ? (
                  <p className="text-center py-6 text-xs text-slate-400">Menyinkronkan data...</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-950/50">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-950/80 text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-800/80">
                          <th className="p-4">Nama Peminjam</th>
                          <th className="p-4">Alat Lab</th>
                          <th className="p-4 text-center">Qty</th>
                          <th className="p-4">Tgl Pinjam</th>
                          <th className="p-4">Tgl Kembali</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {logPeminjaman.map((log) => (
                          <tr key={log.id_pinjam} className="hover:bg-slate-900/30 text-slate-300">
                            <td className="p-4 font-semibold text-slate-200">{log.nama_peminjam}</td>
                            <td className="p-4">{log.nama_alat}</td>
                            <td className="p-4 text-center font-bold">{log.jumlah_pinjam || log.qty || 1}</td>
                            <td className="p-4 text-xs text-slate-400">{formatTgl(log.tgl_pinjam)}</td>
                            <td className="p-4 text-xs text-slate-400">{formatTgl(log.tgl_kembali)}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                log.status === "Dipinjam" ? "bg-amber-500/5 text-amber-400 border-amber-500/20" : "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {log.status === "Dipinjam" ? (
                                <button onClick={() => handleKembalikanBarang(log.id_pinjam, log.id_barang)} className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold rounded-lg transition-all active:scale-95">
                                  Terima Kembali
                                </button>
                              ) : (
                                <span className="inline-block text-[10px] text-slate-500 font-bold bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">Selesai</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: MODE USER (SISWA)
  // ========================================================
  return (
    <div className="min-h-screen bg-[#070a13] p-4 md:p-8 text-slate-100 antialiased font-sans relative overflow-x-hidden">
      <div className="mx-auto max-w-6xl relative z-10">
        <header className="mb-6 border-b border-slate-850 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Terminal Praktikan
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent sm:text-4xl">
              Sirkulasi Alat Lab TJKT
            </h1>
            <p className="mt-1 text-xs text-slate-400">Pilih dan pinjam modul praktikum yang lo butuhin.</p>
          </div>

          {/* INPUT FILTER CARI BARANG */}
          <div className="w-full md:w-80 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">🔍</span>
            <input 
              type="text"
              placeholder="Cari perangkat lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
            />
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-950/40 p-2 border border-slate-900 rounded-xl max-w-fit">
          {listKategoriUnik.map((kat) => (
            <button key={kat} onClick={() => setSelectedKategori(kat)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${selectedKategori === kat ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
              {kat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center py-10 text-xs text-slate-400">Sinkronisasi Database...</p>
        ) : barangTerfilter.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <p className="text-sm text-slate-500">Tidak ada alat yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barangTerfilter.map((barang) => (
              <CardBarang key={barang.id || barang.id_barang} barang={barang} onPinjam={handlePinjamKlik} />
            ))}
          </div>
        )}
      </div>

      <ModalPinjam barang={selectedBarang} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleProsesPeminjaman} isLoading={isLoading} />
    </div>
  );
}

export default App;