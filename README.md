# Panganspasial.id — Backend REST & WebGIS API 🌾📍

Backend REST API dan Layanan Spasial Berbasis WebGIS untuk Pemetaan dan Analisis Sektor Peternakan di Kabupaten Pringsewu, Provinsi Lampung.

Dibangun dengan arsitektur **Layered Architecture (N-Tier)** menggunakan **Node.js (ESM)**, **Express.js**, **Prisma ORM v7**, dan **PostgreSQL dengan PostGIS**.

---

## 🚀 Fitur Utama

- 🗺️ **WebGIS Spasial & GeoJSON (RFC 7946)**: Serialisasi titik sebaran peternakan dan batas wilayah administratif (Kecamatan & Desa) ke dalam format standar GeoJSON FeatureCollection untuk peta Leaflet / OpenLayers.
- 🔍 **Bounding Box (BBox) Viewport Query**: Filter data titik peternakan secara efisien berdasarkan area pandang peta pengguna (`bbox=minLng,minLat,maxLng,maxLat`).
- 🔥 **Dynamic Leaflet Heatmap**: Kalkulasi bobot kepadatan populasi ternak dan skala usaha secara dinamis untuk rendering heatmap layer.
- 🐄 **Taksonomi & Populasi Ternak**: Manajemen hierarki komoditas ternak (Kategori $\rightarrow$ Jenis $\rightarrow$ Sub-jenis) dengan validasi data dan relasi ternormalisasi.
- 📊 **Spatial Decision Support System (SDSS)**: Engine kalkulasi perankingan potensi peternakan tiap kecamatan menggunakan metode *Simple Additive Weighting (SAW)*.
- 🔐 **Autentikasi & Otorisasi Role**: Sistem login administrator berbasis JWT (JSON Web Token) dan hashing password dengan bcrypt.
- 📷 **Upload & Pengelolaan Foto Peternakan**: Dukungan upload file gambar multipart dengan validasi MIME, batas ukuran, dan flag *primary photo*.
- 📋 **Workflow Validasi Data Survey**: Manajemen status verifikasi data lapangan (*Pending*, *Valid*, *Rejected*).
- 🚜 **Automated GPKG Importer**: Pipeline otomatis untuk mem-parsing dan mengimpor file `peternakan.gpkg` (GeoPackage) langsung ke database spasial PostGIS.
- 📖 **Dokumentasi Interaktif OpenAPI 3.0 / Swagger UI**: Antarmuka visual untuk eksplorasi dan pengujian seluruh endpoint API di `/api/docs`.
- 🧪 **Automated Test Suite**: Pengujian unit dan integrasi menyeluruh menggunakan Vitest dan Supertest (35/35 tests passing).

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js (v20+ / ESM)
- **Web Framework**: Express.js 5
- **Database & Spatial Engine**: PostgreSQL 16+ dengan ekstensi **PostGIS**
- **ORM & Driver Adapter**: Prisma ORM v7 dengan `@prisma/adapter-pg`
- **Validasi Data**: Zod Schema Validator
- **Keamanan**: Helmet, CORS, Express Rate Limit, bcryptjs, jsonwebtoken
- **File Upload**: Multer
- **Dokumentasi API**: Swagger UI Express (OpenAPI 3.0)
- **Testing**: Vitest & Supertest

---

## 🏗️ Pola Arsitektur (Layered Architecture)

Sistem mengadopsi pola arsitektur berlapis (*N-Tier Layered Architecture*) dengan alur dependensi data satu arah:

$$\text{HTTP Request} \longrightarrow \text{Route / Middleware / Validator} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository / Prisma} \longrightarrow \text{PostgreSQL + PostGIS}$$

```text
panganspasial-be/
├── src/
│   ├── config/             # Konfigurasi environment (Zod fail-fast validation)
│   ├── controllers/        # Request & response handling, HTTP status codes
│   ├── docs/               # Spesifikasi OpenAPI 3.0 (openapi.json)
│   ├── lib/                # Prisma Client singleton (@prisma/adapter-pg)
│   ├── middlewares/        # Auth JWT, Role Authorize, Multer, Rate Limiter, Error Handler
│   ├── repositories/       # Data Access Layer (Prisma queries & raw PostGIS SQL)
│   ├── routes/             # Definisi modular endpoint Express
│   ├── services/           # Business logic, validasi taksonomi, SDSS engine
│   ├── utils/              # GeoJSON Serializer, Response Helper, GPKG Importer
│   ├── validators/         # Schema validasi input Zod
│   ├── app.js              # Express application setup
│   └── server.js           # Server listener & graceful shutdown
├── prisma/
│   ├── schema.prisma       # 16 Model database spasial & relasional
│   ├── seed.js             # Master data idempotent seeder
│   └── migrations/         # SQL migration scripts (termasuk PostGIS extension & spatial index)
├── tests/                  # Automated integration & regression test suites
├── public/uploads/         # Direktori penyimpanan file foto statis
└── peternakan.gpkg         # Dataset spasial awal GeoPackage
```

---

## ⚙️ Persyaratan Sistem & Instalasi

### 1. Prasyarat
- **Node.js**: Versi 20.0.0 atau lebih baru
- **PostgreSQL**: Versi 15+ dengan ekstensi **PostGIS** yang sudah terpasang

### 2. Kloning & Instalasi Dependensi
```bash
# Masuk ke direktori backend
cd panganspasial-be

# Install dependensi
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` dan sesuaikan kredensial database PostgreSQL Anda:
```env
NODE_ENV=development
PORT=5000

# Format: postgresql://<user>:<password>@<host>:<port>/<dbname>?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/panganspasial?schema=public"

# JWT Authentication
JWT_SECRET="super_secret_jwt_key_panganspasial_2026"
JWT_EXPIRES_IN="7d"

# CORS & Uploads
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://localhost:5000"
UPLOAD_DIR="public/uploads"
MAX_FILE_SIZE_MB=5
```

> [!NOTE]
> Jika password database Anda mengandung karakter khusus seperti `#`, pastikan di-encode dalam URL (contoh: `#` menjadi `%23`).

### 4. Migrasi Database & Seeding
```bash
# 1. Jalankan migrasi Prisma ke PostgreSQL (otomatis mengaktifkan ekstensi postgis)
npm run prisma:migrate

# 2. Jalankan seeder master data (Roles, Admin User, Kategori, Skala, dan Taksonomi Ternak)
npm run seed

# 3. Impor dataset peternakan dari GeoPackage (40 Peternakan & 41 Komoditas Ternak)
npm run import:gpkg
```

### 5. Menjalankan Server
```bash
# Mode Development (auto-reload)
npm run dev

# Mode Production
npm start
```
Server akan aktif di: `http://localhost:5000`

---

## 📖 Dokumentasi API Interaktif (Swagger UI)

Setelah server berjalan, buka browser dan akses:
👉 **`http://localhost:5000/api/docs`**

Akun Administrator Default untuk Pengujian:
- **Email**: `admin@panganspasial.id`
- **Password**: `Admin#2026`

---

## 🌐 Ringkasan Endpoint API

### 1. Autentikasi (`/api/auth`)
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login admin & dapatkan token JWT | Publik |
| `GET` | `/api/auth/me` | Ambil data profil admin yang sedang login | Admin (Bearer) |

### 2. Peternakan & Lokasi Spasial (`/api/farms`)
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `GET` | `/api/farms` | Daftar peternakan publik (Pagination & Filter) | Publik |
| `GET` | `/api/farms/:id` | Detail peternakan untuk popup dan profil | Publik |
| `GET` | `/api/admin/farms` | Daftar peternakan panel admin | Admin (Bearer) |
| `POST` | `/api/admin/farms` | Tambah peternakan baru (Sinkronisasi PostGIS) | Admin (Bearer) |
| `PATCH` | `/api/admin/farms/:id` | Update data / geser koordinat peternakan | Admin (Bearer) |
| `DELETE` | `/api/admin/farms/:id` | Hapus peternakan (Cascade delete) | Admin (Bearer) |

### 3. Komoditas Ternak & Populasi (`/api/livestock`)
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `GET` | `/api/farms/:farmId/livestock` | Daftar komoditas ternak per peternakan | Publik |
| `POST` | `/api/admin/farms/:farmId/livestock` | Tambah komoditas ternak baru | Admin (Bearer) |
| `PATCH` | `/api/admin/livestock/:id` | Update populasi atau jenis ternak | Admin (Bearer) |
| `DELETE` | `/api/admin/livestock/:id` | Hapus catatan ternak | Admin (Bearer) |

### 4. WebGIS & Spatial Layer (`/api/spatial` & `/api/heatmap`)
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `GET` | `/api/spatial/farms` | GeoJSON FeatureCollection titik peternakan (mendukung `bbox`) | Publik |
| `GET` | `/api/spatial/districts` | GeoJSON FeatureCollection batas kecamatan | Publik |
| `GET` | `/api/spatial/villages` | GeoJSON FeatureCollection batas desa/pekon | Publik |
| `GET` | `/api/spatial/districts/:id` | Detail spasial dan statistik per kecamatan | Publik |
| `GET` | `/api/heatmap` | Dataset koordinat berbobot dinamis untuk Leaflet Heatmap | Publik |

### 5. Dashboard Statistik (`/api/statistics`)
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `GET` | `/api/statistics/overview` | Ringkasan KPI (Total peternakan, populasi, distribusi) | Publik |
| `GET` | `/api/statistics/farms` | Statistik jumlah peternakan per kecamatan | Publik |
| `GET` | `/api/statistics/livestock` | Statistik populasi per jenis ternak | Publik |

### 6. Sistem Pendukung Keputusan SDSS (`/api/recommendations`)
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `GET` | `/api/recommendations` | Peringkat rekomendasi potensi wilayah (Metode SAW) | Publik |
| `POST` | `/api/admin/recommendations/calculate` | Hitung ulang & simpan histori hasil SDSS | Admin (Bearer) |
| `GET/POST/PATCH/DELETE`| `/api/admin/sdss/criteria` | Kelola kriteria dan bobot SDSS | Admin (Bearer) |

### 7. Foto Peternakan & Validasi Survey
| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `GET` | `/api/farms/:farmId/photos` | Ambil daftar foto peternakan | Publik |
| `POST` | `/api/admin/farms/:farmId/photos` | Upload foto peternakan (Multipart Form) | Admin (Bearer) |
| `PATCH` | `/api/admin/farm-photos/:id` | Update caption & set primary photo | Admin (Bearer) |
| `DELETE` | `/api/admin/farm-photos/:id` | Hapus foto beserta file fisik di disk | Admin (Bearer) |
| `GET/POST/PATCH` | `/api/admin/validations` | Kelola status validasi survey lapangan | Admin (Bearer) |

---

## 🧪 Pengujian Otomatis (Testing)

Proyek ini dilengkapi dengan *Automated Test Suite* menggunakan **Vitest** dan **Supertest**:

```bash
# Menjalankan seluruh test suite
npm test

# Menjalankan test dalam mode watch
npm run test:watch
```

**Hasil Pengujian:**
```text
✓ tests/health.test.js (2 tests)
✓ tests/import.test.js (5 tests)
✓ tests/admin_and_core.test.js (16 tests)
✓ tests/spatial_and_sdss.test.js (12 tests)

Test Files  4 passed (4)
     Tests  35 passed (35)
```

---

## 🗄️ Database Management (Prisma Studio)

Untuk melihat dan mengelola isi database melalui antarmuka web GUI:
```bash
npm run prisma:studio
```
Prisma Studio akan terbuka di browser pada: `http://localhost:5555`

---
