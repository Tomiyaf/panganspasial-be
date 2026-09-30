import os
import json
import sqlite3
import sys

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def extract_boundaries(gpkg_path="peternakan_bataswilayah.gpkg", output_json="gpkg_boundaries.json"):
    print(f"Reading boundaries from {gpkg_path}...")
    if not os.path.exists(gpkg_path):
        raise FileNotFoundError(f"File not found: {gpkg_path}")

    con = sqlite3.connect(gpkg_path)
    cur = con.cursor()

    # Query all features in peternakan_bataswilayah
    query = """
        SELECT 
            COALESCE(NAMOBJ, WADMKD) as village_name,
            WADMKC as district_name,
            WADMKK as regency_name,
            COALESCE(KDEPUM, IDDESA) as village_code,
            geom
        FROM peternakan_bataswilayah
    """
    rows = cur.execute(query).fetchall()
    print(f"Found {len(rows)} village boundary records in GPKG.")

    envelope_sizes = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}
    results = []

    for village_name, district_name, regency_name, village_code, geom_blob in rows:
        if not geom_blob:
            continue
        
        flags = geom_blob[3]
        envelope_type = (flags >> 1) & 0x07
        envelope_size = envelope_sizes.get(envelope_type, 0)
        wkb_offset = 8 + envelope_size
        wkb_bytes = geom_blob[wkb_offset:]

        results.append({
            "name": village_name.strip() if village_name else None,
            "district": district_name.strip() if district_name else "Adiluwih",
            "regency": regency_name.strip() if regency_name else "Pringsewu",
            "code": village_code.strip() if village_code else None,
            "wkb_hex": wkb_bytes.hex()
        })

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"Successfully exported {len(results)} village boundaries to {output_json}")
    con.close()
    return results

if __name__ == "__main__":
    extract_boundaries()
