import React, { useState, useEffect } from 'react';
import CardBarang from './components/CardBarang';
import ModalPinjam from './components/ModalPinjam';
import FormAdmin from './components/FormAdmin';
// Mengimpor pustaka XLSX untuk fitur cetak laporan pesanan Pak Angga
import * as XLSX from 'xlsx';

// ========================================================
// 🛠️ CONFIG & KREDENSIAL UTAMA
// ========================================================
// GANTI DENGAN URL DEPLOYMENT APPS SCRIPT LU YANG BARU
const API_URL = 'https://script.google.com/macros/s/AKfycbxHF_B01Bh_u9fojJH-xI96MFzQT4bnsyp26fZAd0U0r4EGjGC8qMlP5iZ57tjo9QPPfw/exec';

function App() {
  const [daftarBarang, setDaftarBarang] = useState([]);
  const [logPeminjaman, setLogPeminjaman] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  
  // State manajemen kategori dan pencarian (Search Input)
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState(''); // Fitur baru
  const [currentPage, setCurrentPage] = useState('user');
  
  // State Jam WIB Real-time
  const [waktuWIB, setWaktuWIB] = useState('');
  
  const [inputPin, setInputPin] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    // Cek routing admin/user dari URL param
    const queryParams = new URLSearchParams(window.location.search);
    const page = queryParams.get('page');
    if (page === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('user');
    }
    fetchAllData();

    // Jam Real-time WIB
    const timer = setInterval(() => {
      const d = new Date();
      // Mengonversi waktu ke zona Jakarta (WIB) secara eksplisit
      const options = { 
        timeZone: 'Asia/Jakarta', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      };
      setWaktuWIB(d.toLocaleTimeString('id-ID', options) + ' WIB');
    }, 1000);

    return () => clearInterval(timer);
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

  // Helper mendapatkan format Tanggal YYYY-MM-DD standar WIB 
  const getWIBDateString = () => {
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Jakarta', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    return formatter.format(new Date()); 
  };

  const handleExportExcel = () => {
    if (logPeminjaman.length === 0) {
      alert("Belum ada data log sirkulasi bulan ini untuk di-export, Bro!");
      return;
    }

    const dataRapi = logPeminjaman.map((log, index) => ({
      "No": index + 1,
      "ID Peminjaman": log.id_pinjam,
      "Nama Siswa / Peminjam": log.nama_peminjam,
      "ID Alat": log.id_barang,
      "Nama Perangkat Lab": log.nama_alat,
      "Jumlah (Qty)": log.jumlah_pinjam || 1,
      "Tanggal Pinjam": formatTgl(log.tgl_pinjam),
      "Tanggal Pengembalian": formatTgl(log.tgl_kembali),
      "Status Sirkulasi": log.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRapi);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Sirkulasi");

    const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const tglNow = new Date();
    // Export dengan waktu lokal
    const namaFile = `Laporan_Inventaris_TJKT_${bulanIndo[tglNow.getMonth()]}_${tglNow.getFullYear()}.xlsx`;

    XLSX.writeFile(workbook, namaFile);
  };

  const handleTambahBarangKeSheets = async (dataBarangBaru) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "addBarang", ...dataBarangBaru })
      });
      
      const textData = await response.text();
      try {
        const result = JSON.parse(textData);
        alert(result.message || "Barang berhasil ditambahkan!");
      } catch (e) {
        alert("Barang berhasil ditambahkan ke Sheets!");
      }
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan barang.");
      setIsLoading(false);
    }
  };

  const handleHapusBarang = async (barang) => {
    const idTarget = barang.id || barang.id_barang || barang.id_alat;
    const namaTarget = barang.nama || barang.nama_barang || barang.nama_alat;

    if (!idTarget) {
      alert(`Gagal menghapus! ID untuk alat "${namaTarget}" tidak terbaca di React (undefined). Cek header kolom di Google Sheets.`);
      return;
    }

    if (!window.confirm(`Apakah lu yakin mau menghapus alat "${namaTarget}" dengan ID: ${idTarget} dari sistem, Bro?`)) return;
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: "hapusBarang", 
          id_barang: idTarget
        })
      });
      
      const textData = await response.text();
      try {
        const result = JSON.parse(textData);
        alert(result.message || "Alat berhasil dihapus!");
      } catch (e) {
        alert("Respons dari server diterima!");
      }
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

    const hariIniWIB = getWIBDateString();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: "kembalikanAlat", 
          id_pinjam: idPinjam,
          id_barang: idBarang,
          tgl_kembali_real: hariIniWIB // Terkirim format WIB
        })
      });
      
      const textData = await response.text();
      try {
        const result = JSON.parse(textData);
        alert(result.message || "Barang berhasil dikembalikan!");
      } catch (e) {
        alert("Proses pengembalian barang sukses!");
      }
      fetchAllData(); 
    } catch (error) {
      console.error("Error Fetching:", error);
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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "pinjamAlat", ...dataPayload })
      });
      
      const textData = await response.text();
      try {
        const result = JSON.parse(textData);
        alert(result.message || "Permintaan izin pinjam berhasil dikirim!");
      } catch (e) {
        alert("Izin peminjaman alat berhasil diproses!");
      }
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("Gagal memproses transaksi peminjaman.");
      setIsLoading(false);
    }
  };

  // FIX SECURITY: Otentikasi ditarik ke Backend GAS
  const handleLoginAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "verifikasiAdmin", pin: inputPin })
      });
      
      const textData = await response.text();
      const result = JSON.parse(textData);
      
      if (result.success) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('isAdminLoggedIn', 'true');
      } else {
        alert(result.message || 'PIN Salah, Bro! Akses Ditolak.');
        setInputPin('');
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghubungi server untuk verifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTgl = (dateStr) => {
    if (!dateStr || dateStr === "-") return '-';
    const opsi = { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' };
    return new Date(dateStr).toLocaleDateString('id-ID', opsi);
  };

  const listKategoriUnik = ['Semua', ...new Set(daftarBarang.map(b => b.kategori || 'Umum'))];

  // FITUR SEARCH: Filter multi-layer (kategori + teks pencarian)
  const barangTerfilter = daftarBarang.filter(b => {
    const matchKategori = selectedKategori === 'Semua' ? true : (b.kategori || 'Umum') === selectedKategori;
    const matchSearch = (b.nama || b.nama_barang || b.nama_alat || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });

  // ========================================================
  // RENDER: DASHBOARD INTERNAL ADMIN (PREMIUM DESIGN)
  // ========================================================
  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-[#070a13] p-4 md:p-8 text-slate-100 antialiased font-sans relative overflow-x-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-6xl relative z-10">
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/30 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-black/30 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">Sistem Inventaris Lab</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-300 bg-clip-text text-transparent">
                Dashboard Admin TJKT
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Pantau sirkulasi, manajemen klasifikasi rak, dan export laporan database.</p>
            </div>
            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-md">{waktuWIB || 'Memuat waktu...'}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('isAdminLoggedIn');
                  window.location.href = window.location.origin;
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all duration-300 shadow-md shadow-black/40 active:scale-95"
              >
                ← Keluar ke Mode Siswa
              </button>
            </div>
          </header>

          {!isAdminLoggedIn ? (
            <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-2xl shadow-black/50 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-xl">🔒</div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">Otentikasi Berlapis</h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">Masukkan PIN verifikasi untuk memvalidasi akses administrasi.</p>
              <form onSubmit={handleLoginAdmin} className="space-y-4">
                <input 
                  type="password" placeholder="••••••" value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  disabled={isLoading}
                  className="w-full text-center tracking-[0.4em] rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3.5 text-3xl font-extrabold text-amber-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all duration-300 disabled:opacity-50"
                  required
                />
                <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-[0.99] transition duration-200 shadow-lg shadow-amber-600/10 disabled:opacity-70">
                  {isLoading ? 'Memverifikasi...' : 'Verifikasi PIN'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Form Input Alat Baru */}
              <div className="bg-slate-900/10 border border-slate-800/50 backdrop-blur-md rounded-2xl p-1 shadow-lg">
                <FormAdmin onTambahBarang={handleTambahBarangKeSheets} isLoading={isLoading} />
              </div>

              {/* RAK MANAGEMENT UTAMA */}
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/20 backdrop-blur-md p-6 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm">📦</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 tracking-tight">Manajemen & Hapus Rak Alat</h2>
                    <p className="text-xs text-slate-400">Arsip seluruh perangkat lab dan pengaturan klasifikasi penempatan.</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-6 text-xs text-slate-400">Memuat data rak...</div>
                ) : daftarBarang.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-4">Belum ada alat di dalam rak database.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daftarBarang.map((barang) => (
                      <div key={barang.id || barang.id_barang} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center group hover:border-slate-700/80 transition-all duration-200">
                        <div className="overflow-hidden pr-2">
                          <h4 className="text-sm font-bold text-slate-200 truncate">{barang.nama || barang.nama_barang}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-medium">{barang.kategori || 'Umum'}</span>
                            <p className="text-[11px] text-slate-400">Stok: <span className="text-slate-200 font-semibold">{barang.stok || barang.stok_barang || 0} u</span></p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleHapusBarang(barang)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-400 hover:text-white text-xs font-bold rounded-lg transition-all duration-150 active:scale-95 flex-shrink-0"
                        >
                          Hapus Card
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tabel Log Sirkulasi */}
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/20 backdrop-blur-md p-6 shadow-2xl shadow-black/20">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">📋</div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100 tracking-tight">Log Sirkulasi Alat</h2>
                      <p className="text-xs text-slate-400">Arsip pencatatan serah terima inventaris laboratorium.</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md shadow-emerald-900/30 active:scale-95 self-start sm:self-auto"
                  >
                    <span>📥</span> Export Laporan (.xlsx)
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-14">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-amber-500 mx-auto mb-3"></div>
                    <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Menyinkronkan Data...</p>
                  </div>
                ) : logPeminjaman.length === 0 ? (
                  <div className="text-center py-14 border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20">
                    <p className="text-sm text-slate-500">Belum terdeteksi adanya riwayat sirkulasi.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-950/50 shadow-inner">
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
                          <tr key={log.id_pinjam} className="hover:bg-slate-900/30 transition-all duration-200 group">
                            <td className="p-4 font-semibold text-slate-200 group-hover:text-white">{log.nama_peminjam}</td>
                            <td className="p-4 text-slate-300 font-medium">{log.nama_alat}</td>
                            <td className="p-4 text-center text-slate-200 font-bold">{log.jumlah_pinjam || 1}</td>
                            <td className="p-4 text-slate-400 text-xs">{formatTgl(log.tgl_pinjam)}</td>
                            <td className="p-4 text-slate-400 text-xs">{formatTgl(log.tgl_kembali)}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${
                                log.status === "Dipinjam" ? "bg-amber-500/5 text-amber-400 border-amber-500/20" : "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                              }`}>
                                <span className={`w-1 h-1 rounded-full mr-1.5 ${log.status === 'Dipinjam' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {log.status === "Dipinjam" ? (
                                <button
                                  onClick={() => handleKembalikanBarang(log.id_pinjam, log.id_barang)}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-lg transition-all duration-200 shadow-md shadow-amber-500/10 active:scale-95"
                                >
                                  Terima Kembali
                                </button>
                              ) : (
                                <span className="inline-block text-[10px] text-slate-500 font-bold bg-slate-900/80 border border-slate-800/80 px-2.5 py-1 rounded-md">Selesai</span>
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
  // RENDER: VIEW DISPLAY UTAMA KATALOG (MODE SISWA)
  // ========================================================
  return (
    <div className="min-h-screen bg-[#070a13] p-4 md:p-8 text-slate-100 antialiased font-sans relative overflow-x-hidden">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10">
        <header className="mb-6 text-center sm:text-left border-b border-slate-900 pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Terminal Praktikan
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent sm:text-4xl">
              Sirkulasi Alat Lab TJKT
            </h1>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">Silakan pinjam perangkat lab yang tersedia sesuai modul praktikum ngetek atau konfigurasi jaringan hari ini.</p>
          </div>
          
          {/* Jam Real Time WIB */}
          <div className="flex justify-center sm:justify-end">
            <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-sm shadow-inner text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Waktu Server</p>
              <p className="text-sm font-mono text-emerald-400 font-bold">{waktuWIB || 'Memuat...'}</p>
            </div>
          </div>
        </header>

        {/* TAB FILTER & SEARCH BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/40 p-2 border border-slate-900 rounded-xl backdrop-blur-sm w-full sm:w-auto">
            {listKategoriUnik.map((kat) => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-wider ${
                  selectedKategori === kat
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          {/* FITUR BARU: Search Input */}
          <div className="w-full sm:w-72 relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">🔍</span>
            <input 
              type="text" 
              placeholder="Cari nama alat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-300"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-400"></div>
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Sinkronisasi Database...</p>
          </div>
        ) : barangTerfilter.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
            <p className="text-sm text-slate-500">Alatnya ga ketemu, Bro. Coba keyword lain atau ganti kategori.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barangTerfilter.map((barang) => (
              <CardBarang key={barang.id || barang.id_barang} barang={barang} onPinjam={handlePinjamKlik} />
            ))}
          </div>
        )}
      </div>

      {selectedBarang && (
        <ModalPinjam 
          barang={selectedBarang} isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} onSubmit={handleProsesPeminjaman}
        />
      )}
    </div>
  );
}

export default App;