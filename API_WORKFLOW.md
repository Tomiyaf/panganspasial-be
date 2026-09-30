# Panduan Integrasi API & Alur Kerja Frontend (FE Guide)

Dokumen ini adalah panduan lengkap alur kerja (workflow), format respon, dan autentikasi untuk developer dan **AI Agent Frontend** yang mengonsumsi Backend Panganspasial.id.

---

## 1. Konfigurasi Dasar

- **Base URL Lokal:** `http://localhost:5000/api`
- **File Spesifikasi OpenAPI:** [`src/docs/openapi.json`](file:///D:/pemrograman/panganspasial/panganspasial-be/src/docs/openapi.json)
- **Swagger Interactive UI:** `http://localhost:5000/api/docs`

---

## 2. Pola Respon Data (Response Envelope)

Backend menggunakan **2 pola respon** yang berbeda tergantung jenis endpoint:

### A. Pola REST API Standar (Envelope)
Digunakan oleh hampir seluruh endpoint (`/farms`, `/auth`, `/statistics`, `/admin/*`, dll.):

```json
{
  "success": true,
  "message": "Farms retrieved successfully",
  "data": [ ... ],
  "meta": {
    "total": 54,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

Format Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation Error",
    "details": [
      { "field": "farm_name", "message": "Farm name is required" }
    ]
  }
}
```

### B. Pola Spasial WebGIS (Raw RFC 7946 GeoJSON)
Digunakan khusus oleh endpoint layer peta:
- `GET /api/spatial/farms`
- `GET /api/spatial/districts`
- `GET /api/spatial/villages`

> [!IMPORTANT]
> Endpoint spasial mengembalikan **Raw GeoJSON FeatureCollection** tanpa wrapper `success` atau `data`. Anda bisa langsung memasukkannya ke Leaflet: `L.geoJSON(res.data)`.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "1",
      "geometry": {
        "type": "Point",
        "coordinates": [105.0205381, -5.2269279]
      },
      "properties": {
        "id": "1",
        "farm_name": "Peternakan Barokah Jaya",
        "owner_name": "Haji Slamet",
        "category": "Komersial",
        "scale": "Besar",
        "district": "Adiluwih",
        "total_population": 150
      }
    }
  ]
}
```

---

## 3. Alur Kerja Utama (Key Workflows)

### Workflow 1: Autentikasi Admin
1. Kirim `POST /api/auth/login` dengan payload:
   ```json
   { "email": "admin@panganspasial.id", "password": "..." }
   ```
2. Simpan `data.token` di LocalStorage/Cookies/State.
3. Sertakan header di setiap request endpoint admin (`/api/admin/*`):
   ```http
   Authorization: Bearer <token>
   ```
4. Cek sesi aktif saat inisialisasi aplikasi FE: `GET /api/auth/me`.

---

### Workflow 2: Form Input Peternakan Admin (Cascading & Upload Foto)

1. **Ambil Master Data Form:**
   - Kategori: `GET /api/farm-categories`
   - Skala Usaha: `GET /api/farm-scales`
   - Kecamatan: `GET /api/spatial/districts`
   - Desa/Pekon (Cascading saat kecamatan dipilih): `GET /api/spatial/villages?district_id={district_id}`
2. **Kirim Data Peternakan:**
   - Kirim `POST /api/admin/farms` dengan `FarmInput`:
     ```json
     {
       "farm_name": "Peternakan Berkah",
       "owner_name": "Pak Budi",
       "latitude": -5.2269,
       "longitude": 105.0205,
       "district_id": 8,
       "village_id": 1,
       "farm_category_id": 1,
       "farm_scale_id": 2
     }
     ```
   - Ambil `data.id` dari respon.
3. **Upload Foto Kandang:**
   - Kirim `POST /api/admin/farms/{farmId}/photos` menggunakan `FormData` (`multipart/form-data`):
     - `photo`: File binary
     - `caption`: "Tampak depan"
     - `is_primary`: "true"
4. **Tambah Komoditas Ternak:**
   - Kirim `POST /api/admin/farms/{farmId}/livestock`:
     ```json
     { "livestock_type_id": 1, "population": 50 }
     ```

---

### Workflow 3: Integrasi Peta WebGIS (Leaflet / Mapbox)

```typescript
// Contoh integrasi Leaflet di React/Vue
import L from "leaflet";
import axios from "axios";

// 1. Load Batas Kecamatan Poligon
const { data: districtGeoJSON } = await axios.get("/api/spatial/districts");
L.geoJSON(districtGeoJSON, {
  style: { color: "#3388ff", weight: 2, fillOpacity: 0.1 }
}).addTo(map);

// 2. Load Titik Marker Peternakan dengan Bounding Box & Filter
const bbox = map.getBounds().toBBoxString(); // minLng,minLat,maxLng,maxLat
const { data: farmGeoJSON } = await axios.get(`/api/spatial/farms?bbox=${bbox}`);

L.geoJSON(farmGeoJSON, {
  pointToLayer: (feature, latlng) => L.marker(latlng),
  onEachFeature: (feature, layer) => {
    layer.on("click", async () => {
      // Ambil detail lengkap untuk popup / sidebar
      const { data: res } = await axios.get(`/api/farms/${feature.properties.id}`);
      showFarmDetailModal(res.data);
    });
  }
}).addTo(map);

// 3. Load Heatmap Layer (leaflet.heat)
const { data: heatRes } = await axios.get("/api/heatmap");
const heatPoints = heatRes.data.points.map(p => [p.latitude, p.longitude, p.weight]);
L.heatLayer(heatPoints, { radius: 25, blur: 15 }).addTo(map);
```

---

### Workflow 4: Dashboard Statistik & SDSS Rekomendasi Wilayah

1. **Ringkasan KPI Dashboard:**
   - `GET /api/statistics/overview` (mendukung filter `?district_id=...`).
2. **Grafik Agregasi:**
   - Populasi per jenis ternak: `GET /api/statistics/livestock`.
   - Distribusi per kecamatan: `GET /api/statistics/farms`.
3. **Peringkat Potensi Wilayah (SDSS SAW):**
   - Publik: `GET /api/recommendations` (menampilkan peringkat 1..N tiap kecamatan, skor `score`, `recommendation`, dan `explanation`).
   - Admin Recalculate: `POST /api/admin/recommendations/calculate`.

---

## 4. Rekomendasi Otomatisasi Type untuk FE (TypeScript)

Jalankan perintah ini di project Frontend Anda untuk menghasilkan interface TypeScript secara instan:

```bash
# Install tool
npm install -D openapi-typescript

# Generate types dari file openapi.json
npx openapi-typescript path/to/openapi.json -o src/types/api.d.ts
```
