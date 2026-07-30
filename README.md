<div align="center">

<img src="./public/skyvora-logo-center.svg" alt="Skyvora Travel" width="180">

# Skyvora Travel

### Platform pemesanan travel antar-jemput bandara yang praktis dan terintegrasi

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

[Lihat Demo](https://travel-booking-gamma.vercel.app) · [Laporkan Masalah](https://github.com/gerryabel/skyvora-travel/issues)

</div>

---

## Tentang Skyvora

**Skyvora Travel** adalah aplikasi full-stack untuk memesan layanan travel antar dan jemput bandara. Pengguna dapat mencari jadwal, memilih perjalanan open trip atau private trip, menentukan titik penjemputan, melakukan pembayaran, dan memantau riwayat pemesanan dalam satu aplikasi.

Selain halaman pelanggan, Skyvora menyediakan panel admin untuk mengelola armada, jadwal, pemesanan, pengguna, serta laporan operasional.

## Fitur Utama

### Untuk pengguna

- Registrasi dan login dengan autentikasi berbasis JWT dan cookie HTTP-only
- Pencarian jadwal berdasarkan rute dan kebutuhan perjalanan
- Pemesanan layanan antar atau jemput bandara
- Pilihan **open trip** dan **private trip**
- Pemilihan jumlah kursi serta alamat penjemputan
- Pembayaran tunai maupun online melalui Midtrans
- Riwayat dan detail pemesanan

### Untuk admin

- Dashboard ringkasan operasional
- Pengelolaan armada dan status kendaraan
- Pengelolaan jadwal, rute, harga, kapasitas, dan kuota
- Pemantauan serta pembaruan status pemesanan
- Pengelolaan pengguna
- Laporan perjalanan dan transaksi

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Antarmuka | React 19, Tailwind CSS 4, Lucide React |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Autentikasi | JOSE, JWT, bcryptjs |
| Visualisasi | Recharts |
| Validasi | Zod |
| Pembayaran | Midtrans |
| Email | Nodemailer |
| Deployment | Vercel |

## Menjalankan Secara Lokal

### Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js 20 atau versi yang lebih baru
- npm
- PostgreSQL

### Instalasi

1. Clone repositori.

   ```bash
   git clone https://github.com/gerryabel/skyvora-travel.git
   cd skyvora-travel
   ```

2. Instal dependensi.

   ```bash
   npm install
   ```

3. Buat file `.env` di direktori utama.

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   NEXTAUTH_SECRET="ganti-dengan-secret-yang-kuat"
   NEXTAUTH_URL="http://localhost:3000"

   MIDTRANS_IS_PRODUCTION="false"
   MIDTRANS_SERVER_KEY=""
   MIDTRANS_CLIENT_KEY=""

   SMTP_HOST=""
   SMTP_PORT="587"
   SMTP_USER=""
   SMTP_PASS=""
   SMTP_FROM=""
   ```

4. Siapkan Prisma Client dan database.

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Jalankan server pengembangan.

   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000) pada browser.

> Variabel Midtrans dibutuhkan untuk pembayaran online, sedangkan variabel SMTP digunakan untuk notifikasi email.

## Perintah Tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan |
| `npm run build` | Membuat build produksi dan Prisma Client |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Memeriksa kualitas kode dengan ESLint |

## Struktur Proyek

```text
skyvora-travel/
├── app/
│   ├── (user)/       # Halaman dan alur pelanggan
│   ├── admin/        # Dashboard serta fitur admin
│   ├── api/          # API autentikasi, jadwal, booking, dan pembayaran
│   └── lib/          # Database, autentikasi, email, dan utilitas
├── components/       # Komponen antarmuka yang dapat digunakan kembali
├── data/             # Data pendukung aplikasi
├── prisma/           # Schema, migration, dan seed database
├── public/           # Aset statis
├── scripts/          # Skrip pendukung proyek
└── types/            # Definisi tipe TypeScript
```

## Alur Pemesanan

```mermaid
flowchart LR
    A[Cari jadwal] --> B[Pilih perjalanan]
    B --> C[Isi detail pemesanan]
    C --> D[Pilih pembayaran]
    D --> E[Pantau status booking]
```

## Kontribusi

Kontribusi, saran, dan laporan bug sangat diterima.

1. Fork repositori ini.
2. Buat branch fitur baru: `git checkout -b feature/nama-fitur`.
3. Commit perubahan: `git commit -m "feat: menambahkan fitur"`.
4. Push branch: `git push origin feature/nama-fitur`.
5. Buka pull request.

## Lisensi

Proyek ini tersedia di bawah [MIT License](LICENSE).

---

<div align="center">

Dibuat oleh [Gerry Abel Al Ashby](https://github.com/gerryabel)

</div>
