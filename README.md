# SNAP — Photo Booth Application

**Tagline:** *"Capture the Moment, Create the Story"*

SNAP adalah aplikasi photo booth yang dirancang untuk kebutuhan event sekolah, kegiatan OSIS, hingga pameran multimedia. Aplikasi ini memudahkan pengguna dalam memilih template, mengambil foto, melihat preview, dan menyimpannya secara otomatis menggunakan tampilan yang intuitif.

---

## ✨ Fitur Utama

* **Pemilihan Template Awal** — Pengguna memilih template sebelum memulai sesi foto.
* **Preview Template** — Menampilkan contoh pemakaian template sebelum digunakan.
* **Auto Update Preview** — Foto otomatis menyesuaikan template secara real-time.
* **Countdown Animation** — Hitungan mundur sebelum mengambil foto.
* **Shutter Sound** — Efek suara saat foto diambil untuk pengalaman lebih nyata.
* **Slider atau Tombol Navigasi** — Pengguna dapat memilih cara navigasi template (slider atau tombol kiri/kanan).
* **Simpan Foto** — Hasil foto dapat disimpan ke perangkat.
* **Reset / Ulangi Foto** — Menghapus foto dari sisi client tanpa error (bug telah diperbaiki).

---

## 📁 Struktur Proyek (Contoh)

```
└── Photobox Multimedia/
    ├── node_modules
    ├── public/
    │   ├── example/
    │   │   ├── template1.png
    │   │   └── template2.png
    │   ├── templates/
    │   │   ├── template1.png
    │   │   └── template2.png
    │   ├── app.js
    │   ├── index.html
    │   └── style.css
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── server.js
```

---

## 🚀 Cara Menjalankan

1. Clone repository:

   ```bash
   git clone https://github.com/username/snap
   ```
2. Masuk ke folder proyek:

   ```bash
   cd snap
   ```
3. Jalankan proyek:

   ```bash
   npm start
   ```
4. Masuk ke browser dengan alamat ```localhost:3000```
6. Pastikan semua asset seperti **template, suara, ikon** berada di folder yang sesuai.

---

## 🛠 Teknologi yang Digunakan

* HTML5
* CSS3
* JavaScript (Vanilla)
* Audio API
* Node.js

---

## 📌 To-Do List Pengembangan Berikutnya

* Penambahan mode dark/light theme.
* Penambahan filter foto seperti grayscale, sepia, dll.
* Export langsung ke Instagram layout (story/post).

---

## 🧑‍💻 Kontributor

Proyek ini dikembangkan oleh **Multimedia Scada** sebagai bagian dari pengembangan aplikasi interaktif di kegiatan sekolah.

---

## 📜 Lisensi

Aplikasi ini dirilis dengan lisensi **MIT License**. Silakan gunakan, modifikasi, dan distribusikan sesuai kebutuhan.
