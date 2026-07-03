import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// GANTI DENGAN URL WEB APP DEPLOYMENT GAS YANG BARU LU DEPLOY YA, BRO!
const API_URL = "https://script.google.com/macros/s/AKfycbxHF_B01Bh_u9fojJH-xI96MFzQT4bnsyp26fZAd0U0r4EGjGC8qMlP5iZ57tjo9QPPfw/exec";

// --- KONFIGURASI PIN ADMIN ---
const MASTER_PIN_ADMIN = "sXyKl$Pewk?"; // <--- Ganti "1234" pake PIN rahasia lu sendiri, Bro!

function App() {
  // --- STATE UTAMA ---
  const [daftarBarang, setDaftarBarang] = useState([]);
  const [logPeminjaman, setLogPeminjaman] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE USER / SISWA INTERFACE ---
  const [searchQuery, setSearchQuery] = useState(""); 
  const [kategoriTerpilih, setKategoriTerpilih] = useState("SEMUA");
  const [modalPinjam, setModalPinjam] = useState(null);
  const [namaSiswa, setNamaSiswa] = useState("");

  // --- STATE MANAGEMENT BARANG (ADMIN) ---
  const [inputNamaAlat, setInputNamaAlat] = useState("");
  const [inputStokAlat, setInputStokAlat] = useState("");
  const [inputKategoriAlat, setInputKategoriAlat] = useState("");

  // --- LOGIKA FILTER TAB 3 BULAN BERGULIR OTOMATIS ---
  const generateTigaBulanTerakhir = () => {
    const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const hasil = [];
    const tgl = new Date();
    
    for (let i = 2; i >= 0; i--) {
      const d = new Date(tgl.getFullYear(), tgl.getMonth() - i, 1);
      const namaBulan = bulanIndo[d.getMonth()];
      const tahun = d.getFullYear();
      hasil.push({
        label: namaBulan,
        value: `${namaBulan}_${tahun}`
      });
    }
    return hasil;
  };

  const listTabBulan = generateTigaBulanTerakhir();
  const [bulanFilterAktif, setBulanFilterAktif] = useState(listTabBulan[2].value);

  // --- GET DATA DARI DATABASE GOOGLE SHEETS ---
  const fetchAllData = async (targetBulan = bulanFilterAktif) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?bulan=${targetBulan}`);
      const data = await response.json();
      
      if (data.barang) {
        setDaftarBarang(data.barang);
        setLogPeminjaman(data.log_peminjaman || []);
      } else {
        setDaftarBarang(data || []);
      }
    } catch (error) {
      console.error("Gagal Sinkronisasi Database Sheets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(bulanFilterAktif);
  }, [bulanFilterAktif]);

  const formatTgl = (tglObj) => {
    if (!tglObj || tglObj === "-") return "-";
    return tglObj.toString();
  };

  // --- FITUR FIX: HANDLER TOGGLE MODE ADMIN DENGAN PROTEKSI PIN ---
  const handleToggleAdminMode = () => {
    if (isAdminMode) {
      // Kalau mau keluar dari mode admin langsung keluar aja tanpa PIN
      setIsAdminMode(false);
    } else {
      // Pas mau masuk Dashboard Admin, minta verifikasi PIN dulu, Bro!
      const inputPin = window.prompt("Masukkan PIN Keamanan Admin Lab TJKT:");
      
      if (inputPin === null) return; // Siswa klik cancel / batal

      if (inputPin === MASTER_PIN_ADMIN) {
        setIsAdminMode(true);
      } else {
        alert("❌ PIN Salah! Akses ditolak. Lu bukan admin lab ya, Bro? 🤔");
      }
    }
  };

  // ====================================================================
  // OPERASI API (SISWA & ADMIN)
  // ====================================================================

  const handlePinjamAlat = async (e) => {
    e.preventDefault();
    if (!namaSiswa.trim()) return alert("Nama kamu jangan kosong, Bro!");

    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "pinjamAlat",
          id_barang: modalPinjam.id,
          nama_peminjam: namaSiswa
        })
      });
      const data = await res.json();
      alert(data.message);
      setModalPinjam(null);
      setNamaSiswa("");
      fetchAllData(bulanFilterAktif);
    } catch (error) {
      alert("Gagal memproses transaksi peminjaman.");
      setIsLoading(false);
    }
  };

  const handleKembalikanAlat = async (idPinjam) => {
    if (!window.confirm("Apakah alat ini benar sudah dikembalikan dan dicek fisiknya, Bro?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "kembalikanAlat",
          id_pinjam: idPinjam
        })
      });
      const data = await res.json();
      alert(data.message);
      fetchAllData(bulanFilterAktif);
    } catch (error) {
      alert("Gagal memproses pengembalian alat.");
      setIsLoading(false);
    }
  };

  const handleTambahAlat = async (e) => {
    e.preventDefault();
    if (!inputNamaAlat || !inputStokAlat) return alert("Form nama dan stok wajib diisi ya!");

    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "tambahAlat",
          nama: inputNamaAlat,
          stok: parseInt(inputStokAlat),
          kategori: inputKategoriAlat.trim() || "Umum"
        })
      });
      const data = await res.json();
      alert(data.message);
      setInputNamaAlat("");
      setInputStokAlat("");
      setInputKategoriAlat("");
      fetchAllData(bulanFilterAktif);
    } catch (error) {
      alert("Gagal menyimpan perangkat baru.");
      setIsLoading(false);
    }
  };

  const handleHapusAlat = async (idAlat) => {
    if (!window.confirm("Data perangkat ini bakal dihapus permanen dari sistem lab, yakin?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "hapusAlat", id: idAlat })
      });
      const data = await res.json();
      alert(data.message);
      fetchAllData(bulanFilterAktif);
    } catch (error) {
      alert("Gagal menghapus perangkat.");
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (logPeminjaman.length === 0) {
      alert(`Belum ada rekap sirkulasi buat periode ${bulanFilterAktif.replace('_', ' ')}, Bro!`);
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
      "Tanggal Kembali": formatTgl(log.tgl_kembali),
      "Status Sirkulasi": log.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRapi);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Sirkulasi");

    const namaFile = `Laporan_Inventaris_TJKT_${bulanFilterAktif}.xlsx`;
    XLSX.writeFile(workbook, namaFile);
  };

  const listKategori = ["SEMUA", ...new Set(daftarBarang.map(b => b.kategori.toUpperCase()))];

  const barangTerfilter = daftarBarang.filter(barang => {
    const cocokKategori = kategoriTerpilih === "SEMUA" || barang.kategori.toUpperCase() === kategoriTerpilih;
    const cocokSearch = barang.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return cocokKategori && cocokSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* HEADER NAVBAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded-md">🛠️ INVENTARIS LAB TJKT</span>
            <h1 className="text-xl font-black text-slate-100 tracking-tight mt-1">Sirkulasi Alat Lab</h1>
          </div>
          {/* DI SINI SINKRONISASI COUPLING BARU: Fungsi diganti ke handleToggleAdminMode */}
          <button 
            onClick={handleToggleAdminMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
              isAdminMode 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            {isAdminMode ? "🔒 Keluar (Mode Siswa)" : "🔑 Dashboard Admin"}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* INTERFACE MODE USER (SISWA) */}
        {!isAdminMode ? (
          <div>
            <div className="mb-8">
              <p className="text-sm text-slate-400 max-w-xl">
                Cari alat atau perangkat lab yang kamu butuhkan untuk kegiatan produktif hari ini. Ketik nama alat langsung pada kolom pencarian di bawah.
              </p>
            </div>

            {/* SEARCH BAR & BADGE KATEGORI */}
            <div className="bg-slate-900/40 border border-slate-900/80 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Ketik nama alat praktikum... (Contoh: LAN Tester, Tang)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded-md transition-all"
                  >
                    RESET
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 items-center">
                {listKategori.map((kat) => (
                  <button
                    key={kat}
                    onClick={() => setKategoriTerpilih(kat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200 ${
                      kategoriTerpilih === kat
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            </div>

            {/* GRID DATA BARANG */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 uppercase tracking-widest animate-pulse">Menghubungkan ke database Rak Lab...</p>
              </div>
            ) : barangTerfilter.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-900 rounded-2xl bg-slate-900/5">
                <p className="text-sm text-slate-500">Nama alat atau kategori yang kamu ketik nggak ada di rak, Bro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {barangTerfilter.map((barang) => (
                  <div key={barang.id} className="group relative rounded-2xl border border-slate-900/80 bg-slate-900/20 hover:border-slate-800/80 transition-all duration-300 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-800/60 rounded-md text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          📁 {barang.kategori}
                        </span>
                        <span className={`text-[11px] font-bold ${barang.stok > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {barang.stok > 0 ? `🟢 Tersedia: ${barang.stok} unit` : "🔴 Sedang Habis"}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-200 text-base group-hover:text-indigo-400 transition-colors duration-200">{barang.nama}</h3>
                    </div>
                    <button
                      disabled={barang.stok < 1}
                      onClick={() => setModalPinjam(barang)}
                      className="w-full mt-5 py-2.5 bg-slate-950 border border-slate-800 hover:border-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Pinjam Alat Ini
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          // INTERFACE MODE DASHBOARD CONTROL (ADMIN)
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* FORM REGISTER BARANG BARU */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">📥 Registrasi Alat Baru</h2>
                <form onSubmit={handleTambahAlat} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nama Barang / Perangkat</label>
                    <input
                      type="text"
                      placeholder="Contoh: Cisco Router Switch 24 Port"
                      value={inputNamaAlat}
                      onChange={(e) => setInputNamaAlat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Kuantitas Stok</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={inputStokAlat}
                        onChange={(e) => setInputStokAlat(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Rak / Kategori</label>
                      <input
                        type="text"
                        placeholder="Contoh: Rak Server, Kabel"
                        value={inputKategoriAlat}
                        onChange={(e) => setInputKategoriAlat(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all duration-200">
                    Simpan ke Gudang Rak
                  </button>
                </form>
              </div>

              {/* KONTROL STOK FISIK & HAPUS */}
              <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-6 lg:col-span-2">
                <h2 className="text-sm font-bold text-slate-300 mb-4">🗃️ Kontrol Stok Fisik & Rak</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-1">
                  {daftarBarang.map(b => (
                    <div key={b.id} className="p-3.5 bg-slate-950/80 border border-slate-900 rounded-xl flex justify-between items-center gap-3">
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate">{b.nama}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Kategori: {b.kategori} | Sisa Stok: <span className="text-slate-300">{b.stok} unit</span></p>
                      </div>
                      <button 
                        onClick={() => handleHapusAlat(b.id)}
                        className="px-2.5 py-1 text-[10px] font-bold border border-rose-950 bg-rose-950/20 text-rose-400 rounded-lg hover:bg-rose-950/60 transition-colors shrink-0"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ARSIP LOG SIRKULASI & TAB BULANAN */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-100">📋 Buku Log Kendali Sirkulasi</h2>
                  <p className="text-xs text-slate-400">Arsip riwayat peminjaman siswa di lab.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl max-w-fit">
                  {listTabBulan.map((bulan) => (
                    <button
                      key={bulan.value}
                      onClick={() => setBulanFilterAktif(bulan.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                        bulanFilterAktif === bulan.value
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {bulan.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all duration-200 self-start lg:self-auto"
                >
                  📥 Export Periode ({bulanFilterAktif.split('_')[0]})
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-10 text-xs text-slate-500 animate-pulse">Menghubungkan ke Sheets log periode...</div>
              ) : logPeminjaman.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">Tidak ada data transaksi peminjaman tercatat pada periode {bulanFilterAktif.replace('_', ' ')}.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 pl-2">Nama Siswa</th>
                        <th className="pb-3">Alat Lab</th>
                        <th className="pb-3">Tgl Pinjam</th>
                        <th className="pb-3">Tgl Kembali</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {logPeminjaman.map((log) => (
                        <tr key={log.id_pinjam} className="hover:bg-slate-900/20 transition-colors">
                          <td className="py-3.5 pl-2 font-medium text-slate-200">{log.nama_peminjam}</td>
                          <td className="py-3.5 text-slate-300">{log.nama_alat}</td>
                          <td className="py-3.5 text-slate-400">{formatTgl(log.tgl_pinjam)}</td>
                          <td className="py-3.5 text-slate-400">{formatTgl(log.tgl_kembali)}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              log.status === "Dipinjam" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-2 text-right">
                            {log.status === "Dipinjam" && (
                              <button
                                onClick={() => handleKembalikanAlat(log.id_pinjam)}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-md transition-all shadow"
                              >
                                Pulangkan Alat
                              </button>
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
      </main>

      {/* MODAL CONFIRMATION DI SISI USER */}
      {modalPinjam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-slate-100">Konfirmasi Form Peminjaman</h3>
              <button onClick={() => setModalPinjam(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl mb-4 border border-slate-800/60">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Perangkat Pilihan:</p>
              <p className="text-sm font-bold text-indigo-400 mt-0.5">{modalPinjam.nama}</p>
              <p className="text-[10px] text-slate-500 mt-1">Sisa Stok Lab: {modalPinjam.stok} unit</p>
            </div>
            <form onSubmit={handlePinjamAlat} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Ketik nama lengkap kamu, Bro..."
                  value={namaSiswa}
                  onChange={(e) => setNamaSiswa(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalPinjam(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow"
                >
                  Ajukan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;