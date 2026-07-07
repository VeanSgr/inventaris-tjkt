import React, { useState, useEffect } from 'react';

// ========================================================
// 🛠️ CONFIG & KREDENSIAL
// ========================================================
// GANTI DENGAN URL DEPLOY GAS YANG BARU!!!
const API_URL = 'https://script.google.com/macros/s/AKfycbx2sfMYJznjLthK3h9Bq24bBKe8cGrjErBCOYZrJBzIxMtrzhXpK_AIe7IfRI-Dzz0n3w/exec';
const PIN_ADMIN = 'sXyKl$Pewk?'; 

// ========================================================
// 🧩 KOMPONEN INLINE (Digabung dalam satu file agar tidak error)
// ========================================================

const CardBarang = ({ barang, onPinjam }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-all duration-300">
    <div>
      <div className="text-[10px] bg-slate-950 inline-block px-2 py-1 rounded text-amber-400 font-bold uppercase tracking-wider border border-slate-800 mb-3">{barang.kategori || 'Umum'}</div>
      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{barang.nama_alat}</h3>
      <p className="text-xs text-slate-400 mb-5">Stok Tersedia: <span className="text-emerald-400 font-bold text-sm ml-1">{barang.stok_tersedia}</span> <span className="text-slate-600">/ {barang.stok_total}</span></p>
    </div>
    <button
      onClick={() => onPinjam(barang)}
      disabled={barang.stok_tersedia <= 0}
      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-[0.98] ${
        barang.stok_tersedia > 0 
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30' 
          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
      }`}
    >
      {barang.stok_tersedia > 0 ? 'Pinjam Alat' : 'Stok Habis'}
    </button>
  </div>
);

const FormAdmin = ({ onTambahBarang, isLoading }) => {
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [stok, setStok] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onTambahBarang({ nama_alat: nama, kategori, stok });
    setNama('');
    setKategori('');
    setStok(1);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-900/40 rounded-xl border border-slate-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">➕</div>
        <h3 className="text-md font-bold text-white">Input Perangkat Baru</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Nama Alat</label>
          <input required type="text" placeholder="Cth: Mikrotik RB951" value={nama} onChange={e=>setNama(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-700" />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Kategori</label>
          <input required type="text" placeholder="Cth: Router" value={kategori} onChange={e=>setKategori(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-700" />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Stok Awal</label>
          <input required type="number" min="1" placeholder="Qty" value={stok} onChange={e=>setStok(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" />
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

const ModalPinjam = ({ barang, isOpen, onClose, onSubmit, isLoading }) => {
  const [nama, setNama] = useState('');
  const [qty, setQty] = useState(1);
  
  if(!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ id_barang: barang.id_barang, nama_alat: barang.nama_alat, nama_peminjam: nama, qty });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl shadow-black">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            📋
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Form Peminjaman</h3>
          <p className="text-xs text-slate-400 mt-1">Isi data identitas untuk meminjam <span className="text-emerald-400 font-bold">{barang.nama_alat}</span></p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wide">Nama Peminjam / Kelompok</label>
              <input required type="text" value={nama} onChange={e=>setNama(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-slate-700" placeholder="Masukkan nama lengkap..." />
            </div>
            <div>
              <div className="flex justify-between items-end mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Jumlah (Qty)</label>
                <span className="text-[10px] text-slate-500 font-medium">Maksimal: {barang.stok_tersedia}</span>
              </div>
              <input required type="number" min="1" max={barang.stok_tersedia} value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-bold rounded-xl transition-all">Batal</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30 active:scale-95">
              {isLoading ? 'Memproses...' : 'Ajukan Izin'}
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
  const [isLoading, setIsLoading] = useState(false); // Diubah defaultnya agar tidak nyangkut saat init
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  
  // State untuk Fitur Filter & Search
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState(''); 
  
  const [currentPage, setCurrentPage] = useState('user');
  const [inputPin, setInputPin] = useState('');
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('page') === 'admin') setCurrentPage('admin');
    fetchAllData();
  }, []);

  // --- CORE FETCH API ---
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.status === 'success') {
        setDaftarBarang(data.barang || []);
        setLogPeminjaman(data.log_peminjaman || []);
      } else {
        console.error("Backend Error:", data.message);
        alert("Gagal load data: " + data.message);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi Sheets:", error);
      alert("Koneksi ke server Google Sheets terputus.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- REUSABLE POST FUNCTION ---
  const postData = async (payload, successMsg) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        alert(result.message || successMsg);
        await fetchAllData(); 
        return true;
      } else {
        alert("Error: " + result.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      alert("Gagal koneksi ke server saat memproses data.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleTambahBarang = (dataBarangBaru) => {
    postData({ action: "addBarang", ...dataBarangBaru }, "Barang sukses ditambahkan!");
  };

  const handleHapusBarang = (barang) => {
    const targetId = barang.id_barang || barang.id;
    if (!targetId) return alert("ID barang nggak valid!");
    
    if (window.confirm(`Yakin mau hapus ${barang.nama_alat} dari database?`)) {
      postData({ action: "hapusBarang", id_barang: targetId }, "Barang berhasil dihapus!");
    }
  };

  const handleProsesPeminjaman = async (dataPayload) => {
    setIsModalOpen(false);
    const sukses = await postData({ action: "pinjamAlat", ...dataPayload }, "Mantap, izin pinjam sukses dicatat!");
    if(!sukses) setIsModalOpen(true); 
  };

  const handleKembalikanBarang = (idPinjam, idBarang) => {
    if (window.confirm("Pastikan fisik alat udah dicek dan kondisinya baik. Yakin mau konfirmasi pengembalian?")) {
      postData({ action: "kembalikanAlat", id_pinjam: idPinjam, id_barang: idBarang }, "Alat berhasil dikembalikan ke rak!");
    }
  };

  // --- EXPORT CSV (Pengganti library XLSX agar bisa jalan tanpa install package eksternal) ---
  const handleExportLaporan = () => {
    if (logPeminjaman.length === 0) return alert("Belum ada data sirkulasi bulan ini!");

    const headers = ["No", "ID Transaksi", "Nama Peminjam", "Perangkat Lab", "Jumlah", "Tgl Pinjam", "Tgl Pengembalian", "Status"];
    
    const csvRows = logPeminjaman.map((log, index) => {
      return [
        index + 1,
        log.id_pinjam,
        `"${log.nama_peminjam}"`, 
        `"${log.nama_alat}"`,
        log.qty,
        `"${formatTgl(log.tgl_pinjam)}"`,
        `"${formatTgl(log.tgl_kembali)}"`,
        `"${log.status}"`
      ].join(",");
    });

    const csvString = [headers.join(","), ...csvRows].join("\n");
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const tglNow = new Date();
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_TJKT_${tglNow.getMonth()+1}_${tglNow.getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    if (inputPin === PIN_ADMIN) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
    } else {
      alert('PIN Salah, Akses Ditolak!');
      setInputPin('');
    }
  };

  const formatTgl = (dateStr) => {
    if (!dateStr || dateStr === "-") return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  // --- FILTER LOGIC (SEARCH + KATEGORI) ---
  const listKategoriUnik = ['Semua', ...new Set(daftarBarang.map(b => b.kategori || 'Umum'))];
  
  const barangTerfilter = daftarBarang.filter(b => {
    const matchKategori = selectedKategori === 'Semua' || (b.kategori || 'Umum') === selectedKategori;
    const matchSearch = (b.nama_alat || b.nama_barang || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });


  // ========================================================
  // RENDER: ADMIN DASHBOARD
  // ========================================================
  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-[#070a13] p-4 md:p-8 text-slate-100 antialiased font-sans relative">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="mx-auto max-w-6xl relative z-10">
          <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center bg-slate-900/30 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">Sistem Inventaris Lab</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Dashboard <span className="text-amber-500">Admin</span></h1>
              <p className="text-xs text-slate-400 mt-1">Area khusus admin untuk manajemen dan rekap sirkulasi.</p>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('isAdminLoggedIn'); window.location.href = window.location.pathname; }}
              className="px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-900 transition-all shadow-md shadow-black/40 active:scale-95"
            >
              ← Keluar ke Mode Siswa
            </button>
          </header>

          {!isAdminLoggedIn ? (
            <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-sm text-center">
              <div className="w-14 h-14 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4">🔒</div>
              <h2 className="text-lg font-bold text-slate-100">Otentikasi Keamanan</h2>
              <p className="text-xs text-slate-400 mt-1">Masukkan PIN verifikasi untuk mengakses panel.</p>
              <form onSubmit={handleLoginAdmin} className="space-y-4 mt-6">
                <input 
                  type="password" placeholder="••••••" value={inputPin} onChange={(e) => setInputPin(e.target.value)}
                  className="w-full text-center tracking-[0.5em] rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-4 text-2xl font-bold text-amber-400 outline-none focus:border-amber-500/50 transition-all" required
                />
                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-amber-900/20 active:scale-95">Verifikasi PIN</button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative">
                <FormAdmin onTambahBarang={handleTambahBarang} isLoading={isLoading} />
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm">📦</div>
                  <h2 className="text-lg font-bold text-slate-100">Manajemen Rak Alat</h2>
                </div>
                
                {isLoading && daftarBarang.length === 0 ? <p className="text-slate-400 text-sm animate-pulse">Menyinkronkan dari Sheets...</p> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daftarBarang.map((barang) => (
                      <div key={barang.id_barang} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center group hover:border-slate-700 transition-all">
                        <div className="pr-4 overflow-hidden">
                          <h4 className="text-sm font-bold text-slate-200 truncate">{barang.nama_alat}</h4>
                          <div className="text-[11px] mt-1.5 flex items-center gap-2">
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-medium">{barang.kategori}</span>
                            <span className="text-slate-400">Tersedia: <span className="text-emerald-400 font-bold">{barang.stok_tersedia}/{barang.stok_total}</span></span>
                          </div>
                        </div>
                        <button onClick={() => handleHapusBarang(barang)} className="shrink-0 px-3 py-2 bg-red-900/20 text-red-400 border border-red-900/30 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all">
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm">📋</div>
                    <h2 className="text-lg font-bold text-slate-100">Log Sirkulasi Bulan Ini</h2>
                  </div>
                  <button onClick={handleExportLaporan} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95 flex items-center justify-center gap-2">
                    📥 Unduh Laporan (CSV)
                  </button>
                </div>
                
                {isLoading && logPeminjaman.length === 0 ? <p className="text-slate-400 text-sm animate-pulse">Menyinkronkan dari Sheets...</p> : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800/60 shadow-inner">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800/80">
                        <tr>
                          <th className="p-4">Nama Peminjam</th>
                          <th className="p-4">Alat Lab</th>
                          <th className="p-4 text-center">Qty</th>
                          <th className="p-4">Waktu Pinjam</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 bg-slate-900/20">
                        {logPeminjaman.map((log) => (
                          <tr key={log.id_pinjam} className="hover:bg-slate-800/50 transition-colors text-slate-300">
                            <td className="p-4 font-bold text-white">{log.nama_peminjam}</td>
                            <td className="p-4">{log.nama_alat}</td>
                            <td className="p-4 font-bold text-center text-emerald-400">{log.qty}</td>
                            <td className="p-4 text-xs text-slate-400">{formatTgl(log.tgl_pinjam)}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wide border ${
                                log.status === "Dipinjam" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {log.status === "Dipinjam" ? (
                                <button onClick={() => handleKembalikanBarang(log.id_pinjam, log.id_barang)} className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md">
                                  Terima Barang
                                </button>
                              ) : <span className="inline-block text-[10px] text-slate-500 font-bold bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">Selesai</span>}
                            </td>
                          </tr>
                        ))}
                        {logPeminjaman.length === 0 && (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">Belum ada catatan sirkulasi peminjaman.</td>
                          </tr>
                        )}
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
  // RENDER: VIEW USER (SISWA)
  // ========================================================
  return (
    <div className="min-h-screen bg-[#070a13] p-4 md:p-8 text-slate-100 antialiased font-sans relative">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10">
        <header className="mb-8 border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Terminal Praktikan
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl tracking-tight">Katalog <span className="text-emerald-500">Alat Lab</span></h1>
            <p className="mt-2 text-sm text-slate-400 max-w-lg leading-relaxed">Cari dan pinjam perangkat jaringan yang diperlukan untuk modul praktikum lo hari ini.</p>
          </div>
          
          {/* SEARCH BAR */}
          <div className="w-full md:w-80">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">🔍</span>
              <input 
                type="text" 
                placeholder="Cari alat (ex: Mikrotik, Kabel)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-white placeholder-slate-600 shadow-inner"
              />
            </div>
          </div>
        </header>

        {/* KATEGORI FILTER */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/40 p-2 border border-slate-800/80 rounded-xl w-max backdrop-blur-sm">
          {listKategoriUnik.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                selectedKategori === kat ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* RENDER KARTU BARANG */}
        {isLoading && daftarBarang.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-500"></div>
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">Menghubungkan ke Database...</p>
          </div>
        ) : barangTerfilter.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20">
            <div className="text-3xl mb-3 opacity-50">📡</div>
            <p className="text-sm text-slate-400">Tidak ada perangkat yang sesuai dengan pencarian lo, Bro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {barangTerfilter.map((barang) => (
              <CardBarang key={barang.id_barang} barang={barang} onPinjam={(b) => { setSelectedBarang(b); setIsModalOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      {/* MODAL PEMINJAMAN */}
      <ModalPinjam 
        barang={selectedBarang} isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} onSubmit={handleProsesPeminjaman}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;