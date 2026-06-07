# Panel Admin Absensi Karyawan (Backstrap Template)

Proyek ini dibuat untuk memenuhi tugas **Technical Test Frontend Web Developer**. Proyek ini adalah sebuah aplikasi panel admin sederhana namun premium untuk manajemen absensi karyawan (CRUD) dengan tampilan responsif, bergaya visual **BackStrap** (Bootstrap 4 & CoreUI base), serta fungsionalitas penuh.

Aplikasi ini diimplementasikan sebagai **Single Page Application (SPA)** berbasis HTML5, CSS3 kustom, dan Vanilla JavaScript, menggunakan `localStorage` untuk penyimpanan data yang persisten.

---

## Fitur Utama

1. **Dashboard Analitik**:
   - Kartu Statistik: Total Absensi, Kehadiran Hari Ini, Jumlah Laki-laki, dan Jumlah Perempuan.
   - Indikator Rerata Jam Masuk karyawan secara real-time.
   - Grafik Batang (Bar Chart) kehadiran harian 7 hari terakhir berbasis Chart.js.
   - Grafik Donat (Doughnut Chart) rasio gender karyawan berbasis Chart.js.
2. **List Data Kehadiran (Read & Delete)**:
   - Menampilkan daftar karyawan yang telah melakukan absensi dalam bentuk tabel terstruktur.
   - **Fitur Pencarian (Search)**: Cari karyawan berdasarkan nama atau alamat secara real-time.
   - **Fitur Pengurutan (Sorting)**: Klik pada header kolom tabel (Nama, Alamat, Gender, Tanggal, Jam Masuk, Jam Keluar) untuk mengurutkan data secara *ascending* (A-Z) atau *descending* (Z-A).
   - **Fitur Halaman (Pagination)**: Batasi jumlah data yang tampil per halaman (opsi: 5, 10, 20 data).
   - **Hapus Data**: Disertai konfirmasi pop-up modal modern sebelum data dihapus secara permanen.
3. **Input & Edit Absensi (Create & Update)**:
   - Form interaktif dengan validasi input yang ketat (misal: jam keluar harus setelah jam masuk, semua kolom wajib diisi).
   - Selector jenis kelamin menggunakan *Card Option* interaktif.
   - Mengisi otomatis tanggal hari ini dan jam saat ini secara default untuk mempermudah input.
4. **Tema Gelap & Terang (Light & Dark Mode)**:
   - Toggle di bagian kanan atas navbar untuk berganti tema dengan efek transisi yang halus.
   - Tema tersimpan di `localStorage` sehingga preferensi pengguna tetap bertahan saat halaman dimuat ulang.
5. **Mock Data Seeder**:
   - Tombol **Reset & Seed Data** pada menu sidebar untuk memuat ulang data demo awal (12 data absensi dengan nama karyawan Indonesia) sehingga aplikasi bisa langsung diuji kemampuannya.
6. **Toast Notification**:
   - Notifikasi sukses/warning/danger melayang di sudut layar setiap kali ada operasi CRUD berhasil dilakukan.

---

## Teknologi yang Digunakan

- **CSS & UI Framework**:
  - [BackStrap CSS v0.5.1](https://github.com/DigitallyHappy/BackStrap) (CoreUI & Bootstrap 4) via jsDelivr CDN.
  - [FontAwesome v5.15.4](https://cdnjs.com/libraries/font-awesome) (Icon Pack) via cdnjs.
  - [Google Fonts (Outfit)](https://fonts.google.com/specimen/Outfit) (Tipografi modern).
  - Custom CSS (`css/custom.css`) untuk kustomisasi transisi halaman, efek glassmorphism, visual tombol gender, dan tema gelap.
- **JavaScript & Data Engine**:
  - Vanilla JS (`js/app.js`) untuk pengolahan router, logika CRUD, sorting, pencarian, dan pagination.
  - [Chart.js v4](https://www.chartjs.org/) (Visualisasi data chart) via jsDelivr CDN.
  - [jQuery v3.5.1](https://jquery.com/) & [Popper.js v1.16.1](https://popper.js.org/) (Diperlukan oleh fungsionalitas Bootstrap 4 seperti dropdown dan modal).
  - Browser [Web Storage API (localStorage)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) untuk persistensi data CRUD.

---

## Struktur Direktori

```text
absensi-karyawan/
├── css/
│   └── custom.css      # Style kustom untuk transisi, warna tema, dan animasi
├── js/
│   └── app.js          # Seluruh logika CRUD, filter, chart, routing, dan tema
├── index.html          # Struktur layout utama admin BackStrap & SPA views
└── README.md           # Dokumentasi proyek (file ini)
```

---

## Cara Menjalankan Aplikasi Secara Lokal

Karena proyek ini menggunakan frontend murni tanpa compiler/bundler berat, Anda dapat menjalankannya dengan sangat mudah:

### Opsi 1: Menjalankan Langsung (Sederhana)
1. Ekstrak folder `/absensi-karyawan/`.
2. Klik ganda (double-click) file `index.html` untuk membukanya di browser Anda (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Opsi 2: Menggunakan Local Development Server (Rekomendasi)
Untuk performa optimal dan menghindari isu kebijakan CORS lokal browser (jika ada):
- Jika menggunakan VS Code, Anda bisa memasang ekstensi **Live Server**, lalu klik kanan pada file `index.html` dan pilih **Open with Live Server**.
- Atau, jalankan perintah berikut di terminal Anda pada direktori proyek:
  ```bash
  npx serve
  ```
  Lalu buka alamat `http://localhost:3000` (atau port yang tertera) di browser Anda.

---

## Cara Menyimpan Source Code ke Repositori (GitHub/GitLab)

Ikuti langkah-langkah berikut untuk mengunggah source code ini ke akun GitHub atau GitLab Anda agar dapat ditinjau:

1. **Buka Terminal** dan arahkan ke direktori proyek:
   ```bash
   cd /path/to/your/project/absensi-karyawan
   ```
2. **Inisialisasi Git**:
   ```bash
   git init
   ```
3. **Tambahkan semua file ke staging**:
   ```bash
   git add .
   ```
4. **Lakukan commit pertama**:
   ```bash
   git commit -m "feat: inisialisasi panel admin absensi karyawan"
   ```
5. **Buat repositori baru** di [GitHub](https://github.com/new) atau [GitLab](https://gitlab.com/projects/new) (kosong tanpa README/license agar tidak ada konflik).
6. **Hubungkan repositori lokal dengan repositori online**:
   - Jika menggunakan GitHub:
     ```bash
     git branch -M main
     git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPOSITORI_ANDA.git
     ```
   - Jika menggunakan GitLab:
     ```bash
     git remote add origin https://gitlab.com/USERNAME_ANDA/NAMA_REPOSITORI_ANDA.git
     ```
7. **Push kode Anda ke repositori online**:
   ```bash
   git push -u origin main (atau git push -u origin master)
   ```
8. **Bagikan tautan repositori online tersebut** (misal: `https://github.com/username/project-name`) untuk proses peninjauan.
