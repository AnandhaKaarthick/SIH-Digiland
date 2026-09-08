import io
import math
import os
import base64
from PIL import Image, ImageDraw, ImageFont

def _get_font(size=16, bold=False):
    """Load default font fallback cleanly across OS platforms."""
    try:
        font_name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(font_name, size)
    except IOError:
        try:
            font_name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
            return ImageFont.truetype(font_name, size)
        except IOError:
            return ImageFont.load_default()

DEFAULT_ROR_PAYLOAD = {
    "khata_number": "489",
    "parcels": [
        {
            "khasra_survey_number": "142/3B",
            "base_survey_no": "142",
            "sub_division": "3B",
            "bhu_aadhaar_ulpin": "14BW89201L9842",
            "plot_area": {
                "raw_recorded": "0.45 Acre",
                "metric_sqm": 1821.08,
                "metric_hectares": 0.1821
            },
            "land_classification": "Agricultural",
            "soil_type": "Wet / Nanja",
            "irrigation_source": "Government Canal"
        }
    ],
    "ownership_details": [
        {
            "owner_name": "K. Raman",
            "relationship_type": "Son of",
            "relative_name": "M. Murugan",
            "share_fraction": 1.0,
            "is_primary_owner": True
        }
    ],
    "revenue_taxation": {
        "annual_assessment_inr": 85.50,
        "cess_amount_inr": 12.00,
        "tax_status": "PAID"
    },
    "remarks_kaifiyat": "Bank loan lien active under SBI branch ref 2022/441"
}

DEFAULT_DEED_PAYLOAD = {
    "registration_details": {
        "deed_type": "SALE_DEED",
        "registration_number": "984/2021",
        "book_volume": "1",
        "page_range": "105-112",
        "sro_office": "Lucknow Sadar SRO",
        "execution_date": "2021-04-12",
        "registration_date": "2021-04-14"
    },
    "parties": {
        "executants_sellers": [
            {
                "name": "M. Murugan",
                "relationship_type": "Son of",
                "relative_name": "K. Munusamy",
                "address": "No 12, Car Street, Nemili",
                "identifier_ref": "[Redacted]"
            }
        ],
        "claimants_buyers": [
            {
                "name": "K. Raman",
                "relationship_type": "Son of",
                "relative_name": "M. Murugan",
                "address": "No 14, East Mada Street, Nemili",
                "identifier_ref": "[Redacted]"
            }
        ]
    },
    "financial_consideration": {
        "sale_value_inr": 1500000.00,
        "guideline_value_inr": 1420000.00,
        "stamp_duty_paid_inr": 105000.00,
        "registration_fee_inr": 60000.00
    },
    "property_schedule": {
        "survey_number": "142/3B",
        "transacted_area_sqm": 1821.08,
        "four_boundaries_chauhaddi": {
            "north": "Survey No 141 (Public Canal)",
            "south": "Village Panchayat Road",
            "east": "Survey No 142/3A (P. Sundaram Land)",
            "west": "Survey No 143 (Village Commons)"
        }
    },
    "prior_title_recitals": "Vendor acquired rights via registered Settlement Deed No. 312/1998."
}

DEFAULT_MUTATION_PAYLOAD = {
    "mutation_serial_number": "MUT-2024-0012",
    "case_reference_no": "REV/TEH/2024/782",
    "nature_of_mutation": "SUCCESSION_INHERITANCE",
    "applied_date": "2024-01-10",
    "sanctioned_date": "2024-02-18",
    "survey_numbers_affected": ["142/3B"],
    "transferor_prior_owner": {
        "name": "M. Murugan",
        "prior_khata_no": "310"
    },
    "transferee_new_owner": {
        "name": "K. Raman",
        "new_khata_no": "489",
        "share_acquired": 1.0
    },
    "sanctioning_authority": {
        "officer_designation": "Tehsildar",
        "subdivision": "Lucknow Sadar",
        "digital_signature_verified": True
    }
}

DEFAULT_MAP_PAYLOAD = {
    "map_sheet_number": "Sheet-04",
    "projection_system": "EPSG:4326",
    "extracted_features": [
        {
            "khasra_survey_number": "142/3B",
            "geometry_type": "Polygon",
            "coordinates": [
                [
                    [79.94125, 12.98142],
                    [79.94189, 12.98145],
                    [79.94185, 12.98082],
                    [79.94121, 12.98080],
                    [79.94125, 12.98142]
                ]
            ],
            "calculated_gis_area_sqm": 1821.50,
            "centroid": {
                "latitude": 12.98112,
                "longitude": 79.94155
            }
        }
    ],
    "tie_line_measurements": [
        {
            "from_marker": "G1",
            "to_marker": "G2",
            "field_distance_meters": 45.2
        }
    ]
}

def generate_ror_image(data=None) -> Image.Image:
    data = data or DEFAULT_ROR_PAYLOAD
    img = Image.new("RGB", (900, 1100), color=(252, 252, 248))
    draw = ImageDraw.Draw(img)
    f_title = _get_font(20, bold=True)
    f_sub = _get_font(14, bold=True)
    f_text = _get_font(12, bold=False)

    draw.rectangle([20, 20, 880, 1080], outline=(40, 40, 40), width=2)
    draw.text((450, 50), "GOVERNMENT REVENUE DEPARTMENT — RECORD OF RIGHTS (RoR)", fill=(10, 30, 80), font=f_title, anchor="mm")
    draw.line([40, 75, 860, 75], fill=(40, 40, 40), width=1)

    parcel = (data.get("parcels") or [{}])[0]
    owner = (data.get("ownership_details") or [{}])[0]

    y = 95
    draw.text((50, y), f"Khata Number: {data.get('khata_number', '489')}", fill=(0, 0, 0), font=f_sub)
    draw.text((450, y), f"ULPIN / Bhu-Aadhaar: {parcel.get('bhu_aadhaar_ulpin', '14BW89201L9842')}", fill=(0, 0, 0), font=f_sub)
    
    y += 40
    draw.text((50, y), f"Khasra / Survey No: {parcel.get('khasra_survey_number', '142/3B')}", fill=(0, 0, 0), font=f_text)
    draw.text((450, y), f"Plot Area: {(parcel.get('plot_area') or {}).get('raw_recorded', '0.45 Acre')} ({(parcel.get('plot_area') or {}).get('metric_sqm', 1821.08)} sqm)", fill=(0, 0, 0), font=f_text)

    y += 35
    draw.text((50, y), f"Primary Landowner: {owner.get('owner_name', 'K. Raman')}", fill=(0, 0, 0), font=f_sub)
    draw.text((450, y), f"Land Class: {parcel.get('land_classification', 'Agricultural')} ({parcel.get('soil_type', 'Wet')})", fill=(0, 0, 0), font=f_text)

    y += 40
    draw.line([40, y, 860, y], fill=(180, 180, 180), width=1)
    y += 20
    draw.text((50, y), f"Remarks / Kaifiyat: {data.get('remarks_kaifiyat', 'None')}", fill=(180, 20, 20), font=f_text)

    return img

def generate_deed_image(data=None) -> Image.Image:
    data = data or DEFAULT_DEED_PAYLOAD
    img = Image.new("RGB", (900, 1100), color=(250, 248, 242))
    draw = ImageDraw.Draw(img)
    f_title = _get_font(20, bold=True)
    f_sub = _get_font(13, bold=True)
    f_text = _get_font(12, bold=False)

    draw.rectangle([20, 20, 880, 1080], outline=(80, 20, 20), width=2)
    reg = data.get("registration_details") or {}
    draw.text((450, 50), f"CONVEYANCE & TRANSFER DEED OF SALE — REG #{reg.get('registration_number', '984/2021')}", fill=(100, 20, 20), font=f_title, anchor="mm")
    
    y = 100
    draw.text((50, y), f"SRO Office: {reg.get('sro_office', 'Sadar SRO')}", fill=(0, 0, 0), font=f_sub)
    draw.text((450, y), f"Execution Date: {reg.get('execution_date', '2021-04-12')}", fill=(0, 0, 0), font=f_sub)

    sellers = (data.get("parties") or {}).get("executants_sellers") or [{}]
    buyers = (data.get("parties") or {}).get("claimants_buyers") or [{}]
    fin = data.get("financial_consideration") or {}

    y += 40
    draw.text((50, y), f"Vendor / Seller: {sellers[0].get('name', 'M. Murugan')}", fill=(0, 0, 0), font=f_text)
    draw.text((450, y), f"Purchaser / Buyer: {buyers[0].get('name', 'K. Raman')}", fill=(0, 0, 0), font=f_text)

    y += 35
    draw.text((50, y), f"Financial Consideration: Rs. {fin.get('sale_value_inr', 1500000):,.2f}", fill=(0, 0, 0), font=f_sub)
    draw.text((450, y), f"Stamp Duty Paid: Rs. {fin.get('stamp_duty_paid_inr', 105000):,.2f}", fill=(0, 0, 0), font=f_text)

    return img

def generate_mutation_image(data=None) -> Image.Image:
    data = data or DEFAULT_MUTATION_PAYLOAD
    img = Image.new("RGB", (900, 1100), color=(248, 250, 248))
    draw = ImageDraw.Draw(img)
    f_title = _get_font(20, bold=True)
    f_sub = _get_font(13, bold=True)
    f_text = _get_font(12, bold=False)

    draw.rectangle([20, 20, 880, 1080], outline=(20, 80, 40), width=2)
    draw.text((450, 50), f"MUTATION REGISTER ORDER — {data.get('mutation_serial_number', 'MUT-2024-0012')}", fill=(20, 80, 40), font=f_title, anchor="mm")

    y = 100
    draw.text((50, y), f"Nature of Mutation: {data.get('nature_of_mutation', 'SUCCESSION_INHERITANCE')}", fill=(0, 0, 0), font=f_sub)
    draw.text((450, y), f"Sanctioned Date: {data.get('sanctioned_date', '2024-02-18')}", fill=(0, 0, 0), font=f_sub)

    prior = data.get("transferor_prior_owner") or {}
    new_owner = data.get("transferee_new_owner") or {}

    y += 40
    draw.text((50, y), f"Prior Owner (Transferor): {prior.get('name', 'M. Murugan')}", fill=(0, 0, 0), font=f_text)
    draw.text((450, y), f"New Owner (Transferee): {new_owner.get('name', 'K. Raman')}", fill=(0, 0, 0), font=f_text)

    return img

def generate_map_image(data=None) -> Image.Image:
    data = data or DEFAULT_MAP_PAYLOAD
    img = Image.new("RGB", (900, 1100), color=(240, 244, 248))
    draw = ImageDraw.Draw(img)
    f_title = _get_font(20, bold=True)
    f_sub = _get_font(13, bold=True)

    draw.rectangle([20, 20, 880, 1080], outline=(0, 60, 120), width=2)
    draw.text((450, 50), f"SPATIAL CADASTRAL MAP (FMB / BHU-NAKSHA) — {data.get('map_sheet_number', 'Sheet-04')}", fill=(0, 60, 120), font=f_title, anchor="mm")

    # Draw Cadastral Polygon
    draw.polygon([(250, 300), (650, 280), (600, 650), (200, 600)], outline=(0, 60, 120), fill=(200, 225, 250))
    draw.text((420, 460), "Survey # 142/3B\nArea: 1821.50 sqm", fill=(0, 0, 0), font=f_sub, align="center")

    return img

def generate_document_image(doc_type: str, custom_payload: dict = None) -> Image.Image:
    if doc_type == "CONVEYANCE_DEED":
        return generate_deed_image(custom_payload)
    elif doc_type == "MUTATION_ORDER":
        return generate_mutation_image(custom_payload)
    elif doc_type == "CADASTRAL_MAP":
        return generate_map_image(custom_payload)
    else:
        return generate_ror_image(custom_payload)

def get_preset_payloads() -> dict:
    return {
        "RECORD_OF_RIGHTS": DEFAULT_ROR_PAYLOAD,
        "CONVEYANCE_DEED": DEFAULT_DEED_PAYLOAD,
        "MUTATION_ORDER": DEFAULT_MUTATION_PAYLOAD,
        "CADASTRAL_MAP": DEFAULT_MAP_PAYLOAD,
    }
