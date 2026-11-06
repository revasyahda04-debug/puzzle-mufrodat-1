# Mufrodat Ceria — Full-stack

Aplikasi latihan kosakata Bahasa Arab untuk siswa kelas 4 SD. Dibangun dengan Next.js App Router, PostgreSQL, Prisma, dan autentikasi berbasis cookie.

## Fitur
- Registrasi akun siswa dan login.
- Akun admin/guru dibuat melalui seed, bukan pendaftaran publik.
- Daftar materi mufrodat berdasarkan kategori.
- Audio MP3 melalui URL audio.
- Permainan menyusun huruf Arab dengan klik.
- Pemeriksaan jawaban dan penyimpanan skor/riwayat ke database.
- Panel admin untuk menambah dan menonaktifkan materi.

## Teknologi
- Next.js (frontend + API backend)
- TypeScript
- PostgreSQL (Neon atau Supabase)
- Prisma ORM
- bcryptjs + JWT cookie (jose)
- CSS responsif dan Noto Naskh Arabic

## Menjalankan secara lokal
1. Install Node.js versi LTS.
2. Salin `.env.example` menjadi `.env`.
3. Isi `DATABASE_URL` dengan database PostgreSQL.
4. Ganti `AUTH_SECRET` dengan string acak panjang.
5. Jalankan:

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`.

Akun admin awal mengikuti `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env`. Ganti password sebelum aplikasi dipublikasikan. Data contoh akan dibuat saat seed.

## Deploy
### Database
Buat database PostgreSQL di Neon atau Supabase, lalu salin connection string ke `DATABASE_URL`. Pastikan SSL aktif.

### Vercel
1. Push repository ini ke GitHub.
2. Import repository di Vercel.
3. Tambahkan environment variables `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD`.
4. Build command: `npm run build`.
5. Deploy.
6. Setelah deployment, jalankan `npx prisma db push` dan `npm run db:seed` dari terminal lokal yang memakai `DATABASE_URL` production (atau gunakan job migrasi terkontrol).

## Menambahkan audio
Unggah MP3 ke layanan penyimpanan file yang mendukung URL publik (misalnya Supabase Storage), lalu tempel URL publik pada kolom URL audio di panel guru. Untuk file lokal selama development, file dapat diletakkan di `public/audio/namafile.mp3` dan URL-nya `/audio/namafile.mp3`. Jangan mengandalkan penyimpanan file lokal pada filesystem serverless Vercel untuk unggahan permanen.

## Format huruf
Kolom `letters` memakai pemisah `|` dan urutan logis huruf, misalnya `ك|ت|ا|ب`. Pemeriksaan jawaban menormalisasi harakat dan tatweel. Uji kata yang memiliki hamzah, ta marbuthah, alif maqsura, dan variasi ejaan secara khusus sebelum dipakai untuk penilaian kelas.

## Catatan produksi
- Ganti `AUTH_SECRET` dan password admin contoh.
- Gunakan HTTPS (otomatis pada Vercel).
- Pertimbangkan rate limiting pada endpoint login/registrasi sebelum digunakan publik.
- Tambahkan kebijakan privasi dan persetujuan sekolah/orang tua jika menyimpan data anak.
- Panel admin saat ini menyediakan tambah dan nonaktifkan materi; pengeditan dapat ditambahkan pada iterasi berikutnya.
- Skor yang ditampilkan di halaman adalah skor sesi browser; riwayat lengkap tersimpan di database dan endpoint `/api/attempts`.
