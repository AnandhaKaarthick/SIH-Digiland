"""
DigiLand Mock Dataset Generator
Generates synthetic land-record parcels matching the RoR / Deed / Mutation /
Cadastral schema, in CLEAN (ground-truth) and NOISY (OCR-error-injected)
variants, exported as JSON + CSV.
"""

import json
import csv
import random
import copy

random.seed(42)

# ---------------------------------------------------------------------------
# Reference data pools (Indian revenue-record style)
# ---------------------------------------------------------------------------

DISTRICTS = [
    ("Barabanki", "214"), ("Kanchipuram", "599"), ("Patna", "021"),
    ("Nagpur", "445"), ("Mysuru", "556"), ("Cuttack", "331"),
    ("Ajmer", "104"), ("Hooghly", "271"),
]

TEHSILS = ["Fatehpur", "Sriperumbudur", "Danapur", "Kamptee", "Nanjangud",
           "Athagarh", "Kishangarh", "Chinsurah"]

PARGANAS = ["Kursi", "Walajabad", "Bikram", "Saoner", "Tirumakudalu",
            "Baramba", "Pushkar", "Balagarh"]

VILLAGES = [
    ("Nemili", "629142"), ("Bhitargaon", "128456"), ("Rampur", "331201"),
    ("Kondhali", "445987"), ("Hadinaru", "556210"), ("Baideswar", "331550"),
    ("Roopangarh", "104330"), ("Balitikuri", "271044"),
]

FIRST_NAMES = ["Ramesh", "Suresh", "Mahesh", "Ganesh", "Rajesh", "Murugan",
               "Raman", "Selvam", "Arumugam", "Prakash", "Vinod", "Anil",
               "Sunita", "Kavita", "Lakshmi", "Meena", "Radha", "Geeta"]

LAST_TOKENS = ["Chand", "Lal", "Kumar", "Singh", "Reddy", "Naidu", "Verma",
               "Sharma", "Gupta", "Nair", "Pillai", "Rao"]

LAND_CLASS = ["Agricultural (Irrigated)", "Agricultural (Nanja/Wet)",
              "Agricultural (Dry)", "Residential", "Village Commons",
              "Barren/Uncultivable"]

MUTATION_NATURE = ["Transfer by Registered Sale Deed", "Inheritance",
                    "Gift Deed", "Court Decree Partition"]


def rand_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_TOKENS)}"


def rand_ulpin():
    return "".join(random.choices("0123456789", k=2)) + \
           "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ", k=2)) + \
           "".join(random.choices("0123456789", k=5)) + \
           random.choice("LMNPQ") + \
           "".join(random.choices("0123456789", k=4))


def rand_date(y0=2018, y1=2024):
    y = random.randint(y0, y1)
    m = random.randint(1, 12)
    d = random.randint(1, 28)
    return f"{d:02d}/{m:02d}/{y}"


# ---------------------------------------------------------------------------
# Record generation
# ---------------------------------------------------------------------------

def generate_record(idx: int) -> dict:
    district, dcode = random.choice(DISTRICTS)
    tehsil = random.choice(TEHSILS)
    pargana = random.choice(PARGANAS)
    village, vcode = random.choice(VILLAGES)

    khata_no = f"{random.randint(1, 999):05d}"
    khasra_no = f"{random.randint(100, 199)}/{random.randint(1, 9)}{random.choice(['A','B',''])}"
    ulpin = rand_ulpin()

    area_ha = round(random.uniform(0.05, 2.5), 4)
    area_acre = round(area_ha * 2.47105, 2)
    area_sqm = round(area_ha * 10000, 2)
    revenue = round(area_ha * 100 * random.uniform(0.8, 1.2), 2)

    owner_a = rand_name()
    owner_b = rand_name()
    father = rand_name()

    vendor = owner_a
    vendee = owner_b
    deed_no = f"{random.randint(100, 999)}"
    deed_year = random.randint(2018, 2024)
    sale_amount = int(area_ha * random.randint(2_000_000, 6_000_000))
    stamp_duty = round(sale_amount * 0.07, -2)

    mutation_case = f"MUT-{deed_year}-{random.randint(1000,9999)}"

    # cadastral centroid roughly around Tamil Nadu / North India band, varied per record
    lat = round(random.uniform(11.0, 27.0), 5)
    lon = round(random.uniform(76.0, 84.0), 5)

    record = {
        "record_id": f"DL-{idx:04d}",
        "location": {
            "state_lgd_code": str(random.randint(10, 36)),
            "district": district,
            "district_lgd_code": dcode,
            "tehsil": tehsil,
            "pargana": pargana,
            "village": village,
            "village_lgd_code": vcode,
        },
        "ror": {
            "form_no": "CH-41 / KHATAUNI",
            "fasli_year": f"{random.randint(1425,1432)}-{random.randint(1426,1433)}",
            "khata_no": khata_no,
            "khasra_no": khasra_no,
            "ulpin": ulpin,
            "date_of_issue": rand_date(2021, 2023),
            "owners": [
                {"name": owner_a, "father_name": father, "share": "1/2",
                 "residence": f"Village {village}"},
                {"name": owner_b, "father_name": father, "share": "1/2",
                 "residence": f"Village {village}"},
            ],
            "area_hectare": area_ha,
            "land_revenue_rs": revenue,
            "land_classification": random.choice(LAND_CLASS),
        },
        "deed": {
            "document_no": f"{deed_no} of {deed_year}",
            "registration_date": f"{rand_date(deed_year, deed_year)}",
            "sro_office": f"Sub-Registrar Office, {tehsil}",
            "vendor_name": vendor,
            "vendee_name": vendee,
            "survey_no": khasra_no,
            "extent_acre": area_acre,
            "sale_consideration_rs": sale_amount,
            "stamp_duty_rs": stamp_duty,
            "boundaries": {
                "north": f"Survey No. {random.randint(100,199)} (Canal)",
                "south": "Village Panchayat Road",
                "east": f"Survey No. {khasra_no.split('/')[0]}/{random.randint(1,9)}A",
                "west": f"Survey No. {random.randint(100,199)} (Village Commons)",
            },
        },
        "mutation": {
            "mutation_case_no": mutation_case,
            "filing_date": rand_date(deed_year, deed_year + 1),
            "order_date": rand_date(deed_year, deed_year + 1),
            "nature": random.choice(MUTATION_NATURE),
            "transferor": vendor,
            "transferee": vendee,
            "old_khata_no": f"{random.randint(1,999):05d}",
            "new_khata_no": khata_no,
        },
        "cadastral": {
            "sheet_no": f"{random.randint(1, 20):02d}",
            "scale": "1:1,000",
            "centroid": {"latitude": lat, "longitude": lon},
            "calculated_area_sqm": area_sqm,
            "boundaries": {
                "north": f"Survey No. {random.randint(100,199)} (Canal)",
                "south": "Village Panchayat Road",
                "east": f"Survey No. {khasra_no.split('/')[0]}/{random.randint(1,9)}A",
                "west": f"Survey No. {random.randint(100,199)} (Village Commons)",
            },
        },
        "validation": {
            "confidence_score": round(random.uniform(0.55, 0.99), 2),
            "status": None,  # filled below
        },
    }

    cs = record["validation"]["confidence_score"]
    record["validation"]["status"] = (
        "VALID" if cs >= 0.85 else "FLAGGED" if cs >= 0.60 else "FAILED_CRITICAL"
    )

    return record


# ---------------------------------------------------------------------------
# OCR noise injection (for the "noisy" variant)
# ---------------------------------------------------------------------------

CONFUSABLES = {
    "0": "O", "O": "0", "1": "l", "l": "1", "5": "S", "S": "5",
    "8": "B", "B": "8", "2": "Z", "Z": "2", "6": "G", "G": "6",
}

def corrupt_string(s: str, rate: float = 0.15) -> str:
    chars = list(s)
    for i, c in enumerate(chars):
        if c in CONFUSABLES and random.random() < rate:
            chars[i] = CONFUSABLES[c]
    out = "".join(chars)
    # occasional stray space / dropped char to mimic OCR segmentation errors
    if random.random() < 0.2 and len(out) > 4:
        pos = random.randint(1, len(out) - 2)
        out = out[:pos] + " " + out[pos:]
    if random.random() < 0.1 and len(out) > 4:
        pos = random.randint(0, len(out) - 1)
        out = out[:pos] + out[pos + 1:]
    return out


def make_noisy(clean: dict) -> dict:
    noisy = copy.deepcopy(clean)
    injected_errors = []

    # 1. OCR-style character noise on identifiers / names
    targets = [
        ("ror.khasra_no", noisy["ror"], "khasra_no"),
        ("ror.ulpin", noisy["ror"], "ulpin"),
        ("ror.khata_no", noisy["ror"], "khata_no"),
        ("deed.document_no", noisy["deed"], "document_no"),
        ("mutation.mutation_case_no", noisy["mutation"], "mutation_case_no"),
    ]
    for label, obj, key in targets:
        if random.random() < 0.6:
            before = obj[key]
            after = corrupt_string(before, rate=0.25)
            if after != before:
                obj[key] = after
                injected_errors.append(
                    {"field": label, "type": "ocr_char_confusion",
                     "original": before, "corrupted": after}
                )

    # 2. Owner name misspelling (handwriting OCR)
    if random.random() < 0.5:
        owner = random.choice(noisy["ror"]["owners"])
        before = owner["name"]
        after = corrupt_string(before.replace("a", "a "), rate=0.1).strip()
        if after != before:
            owner["name"] = after
            injected_errors.append(
                {"field": "ror.owners[].name", "type": "handwriting_misread",
                 "original": before, "corrupted": after}
            )

    # 3. Deliberate cross-document mismatch (area) — a validation-engine test case
    if random.random() < 0.4:
        before = noisy["cadastral"]["calculated_area_sqm"]
        drift = round(before * random.uniform(0.03, 0.12), 2)
        after = round(before + drift, 2)
        noisy["cadastral"]["calculated_area_sqm"] = after
        injected_errors.append(
            {"field": "cadastral.calculated_area_sqm",
             "type": "cross_document_area_mismatch",
             "original": before, "corrupted": after,
             "note": "Cadastral polygon area drifts from RoR recorded area — should trigger validation flag"}
        )

    # 4. Deliberate khasra number mismatch between deed and RoR (duplicate/typo case)
    if random.random() < 0.3:
        before = noisy["deed"]["survey_no"]
        after = corrupt_string(before, rate=0.3)
        if after != before:
            noisy["deed"]["survey_no"] = after
            injected_errors.append(
                {"field": "deed.survey_no", "type": "cross_document_khasra_mismatch",
                 "original": before, "corrupted": after,
                 "note": "Deed survey number no longer matches RoR khasra number"}
            )

    # 5. Revenue / area numeric OCR slip (decimal point drop)
    if random.random() < 0.35:
        before = noisy["ror"]["land_revenue_rs"]
        after = round(before * 10, 2) if random.random() < 0.5 else round(before / 10, 2)
        noisy["ror"]["land_revenue_rs"] = after
        injected_errors.append(
            {"field": "ror.land_revenue_rs", "type": "decimal_point_ocr_error",
             "original": before, "corrupted": after}
        )

    # Recompute a lowered confidence score to reflect injected noise
    penalty = min(0.4, 0.05 * len(injected_errors))
    new_cs = max(0.20, round(noisy["validation"]["confidence_score"] - penalty, 2))
    noisy["validation"]["confidence_score"] = new_cs
    noisy["validation"]["status"] = (
        "VALID" if new_cs >= 0.85 else "FLAGGED" if new_cs >= 0.60 else "FAILED_CRITICAL"
    )
    noisy["injected_errors"] = injected_errors
    noisy["is_noisy_variant"] = True
    return noisy


# ---------------------------------------------------------------------------
# Flattening for CSV export
# ---------------------------------------------------------------------------

def flatten(record: dict) -> dict:
    owners = record["ror"]["owners"]
    owner_names = "; ".join(o["name"] for o in owners)
    owner_shares = "; ".join(o["share"] for o in owners)

    flat = {
        "record_id": record["record_id"],
        "district": record["location"]["district"],
        "district_lgd_code": record["location"]["district_lgd_code"],
        "tehsil": record["location"]["tehsil"],
        "pargana": record["location"]["pargana"],
        "village": record["location"]["village"],
        "village_lgd_code": record["location"]["village_lgd_code"],
        "khata_no": record["ror"]["khata_no"],
        "khasra_no": record["ror"]["khasra_no"],
        "ulpin": record["ror"]["ulpin"],
        "ror_date_of_issue": record["ror"]["date_of_issue"],
        "owner_names": owner_names,
        "owner_shares": owner_shares,
        "area_hectare": record["ror"]["area_hectare"],
        "land_revenue_rs": record["ror"]["land_revenue_rs"],
        "land_classification": record["ror"]["land_classification"],
        "deed_document_no": record["deed"]["document_no"],
        "deed_registration_date": record["deed"]["registration_date"],
        "deed_vendor": record["deed"]["vendor_name"],
        "deed_vendee": record["deed"]["vendee_name"],
        "deed_survey_no": record["deed"]["survey_no"],
        "deed_sale_consideration_rs": record["deed"]["sale_consideration_rs"],
        "deed_stamp_duty_rs": record["deed"]["stamp_duty_rs"],
        "mutation_case_no": record["mutation"]["mutation_case_no"],
        "mutation_filing_date": record["mutation"]["filing_date"],
        "mutation_order_date": record["mutation"]["order_date"],
        "mutation_nature": record["mutation"]["nature"],
        "mutation_transferor": record["mutation"]["transferor"],
        "mutation_transferee": record["mutation"]["transferee"],
        "cadastral_sheet_no": record["cadastral"]["sheet_no"],
        "cadastral_centroid_lat": record["cadastral"]["centroid"]["latitude"],
        "cadastral_centroid_lon": record["cadastral"]["centroid"]["longitude"],
        "cadastral_calculated_area_sqm": record["cadastral"]["calculated_area_sqm"],
        "confidence_score": record["validation"]["confidence_score"],
        "validation_status": record["validation"]["status"],
    }
    if record.get("is_noisy_variant"):
        flat["is_noisy_variant"] = True
        flat["injected_error_count"] = len(record.get("injected_errors", []))
        flat["injected_error_types"] = "; ".join(
            e["type"] for e in record.get("injected_errors", [])
        )
    else:
        flat["is_noisy_variant"] = False
        flat["injected_error_count"] = 0
        flat["injected_error_types"] = ""
    return flat


def write_csv(path: str, rows: list):
    if not rows:
        return
    fieldnames = list(rows[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    n_records = 15
    clean_records = [generate_record(i + 1) for i in range(n_records)]
    noisy_records = [make_noisy(r) for r in clean_records]

    with open("clean_records.json", "w", encoding="utf-8") as f:
        json.dump(clean_records, f, indent=2, ensure_ascii=False)

    with open("noisy_records.json", "w", encoding="utf-8") as f:
        json.dump(noisy_records, f, indent=2, ensure_ascii=False)

    write_csv("clean_records.csv", [flatten(r) for r in clean_records])
    write_csv("noisy_records.csv", [flatten(r) for r in noisy_records])

    # Combined file (clean + noisy) — handy for a single training CSV/JSON
    combined = clean_records + noisy_records
    with open("combined_records.json", "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)
    write_csv("combined_records.csv", [flatten(r) for r in combined])

    print(f"Generated {len(clean_records)} clean + {len(noisy_records)} noisy records.")


if __name__ == "__main__":
    main()
