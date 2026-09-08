def compute_composite_confidence(
    ocr_confidence: float, # 0.0 to 1.0
    parsed_record: dict,
    gis_polygon_area: float = 0.0,
    is_duplicate: bool = False
) -> dict:
    """
    Computes aggregate multi-tier Composite Confidence Score (C in [0.00, 1.00] or 0-100%):
    Composite Score (C) = (0.35 * C_OCR) + (0.30 * C_Rules) + (0.20 * C_DB) + (0.15 * C_Dup)
    """
    # 1. Optical Recognition Quality (C_OCR, Weight = 0.35)
    c_ocr = max(0.0, min(1.0, ocr_confidence if ocr_confidence <= 1.0 else ocr_confidence / 100.0))

    # 2. Deterministic Revenue Rule Invariants (C_Rules, Weight = 0.30)
    sub_plots = parsed_record.get("sub_plots", [])
    total_area = parsed_record.get("total_area") or parsed_record.get("plot_area", 0.0)

    area_rule_passed = True
    if sub_plots and total_area > 0:
        area_rule_passed = abs(sum(sub_plots) - total_area) < 0.01

    raw_shares = parsed_record.get("owner_shares", [1.0])
    parsed_shares = []
    for s in raw_shares:
        if isinstance(s, (int, float)):
            parsed_shares.append(float(s))
        elif isinstance(s, str) and '/' in s:
            try:
                parts = s.split('/')
                parsed_shares.append(float(parts[0]) / float(parts[1]))
            except:
                parsed_shares.append(0.5)
        else:
            try:
                parsed_shares.append(float(s))
            except:
                parsed_shares.append(0.5)

    share_sum = sum(parsed_shares)
    share_rule_passed = abs(share_sum - 1.0) < 0.001

    # Invariant failure drops C_Rules to 0.0
    c_rules = 1.0 if (area_rule_passed and share_rule_passed) else 0.0

    # 3. Master Registry & GIS Cross-Verification (C_DB, Weight = 0.20)
    text_area_sqm = float(parsed_record.get("plot_area_sqm") or parsed_record.get("plot_area", 0.0))
    if gis_polygon_area > 0 and text_area_sqm > 0:
        variance = abs(text_area_sqm - gis_polygon_area) / gis_polygon_area
        c_db = 1.0 if variance <= 0.02 else 0.5
    else:
        c_db = 0.8  # Default fallback if spatial vector layer is pending

    # 4. Deduplication & Overlap Integrity (C_Dup, Weight = 0.15)
    c_dup = 0.0 if is_duplicate else 1.0

    # Compute Weighted Composite Score (0.00 to 1.00)
    composite_score = (0.35 * c_ocr) + (0.30 * c_rules) + (0.20 * c_db) + (0.15 * c_dup)
    composite_score = round(composite_score, 2)
    composite_pct = round(composite_score * 100, 1)

    # Decision Gating & Routing Thresholds
    if composite_score >= 0.85 and c_rules == 1.0:
        routing_status = "AUTO_APPROVED"
        status_flag = "VALID"
        priority_level = "LOW_PRIORITY" # Straight-Through Processing (STP)
    elif composite_score >= 0.60 and c_rules == 1.0:
        routing_status = "REQUIRES_REVIEW"
        status_flag = "FLAGGED_WARNING"
        priority_level = "MEDIUM_PRIORITY" # Needs Human Verification
    else:
        routing_status = "REJECTED_CRITICAL"
        status_flag = "FAILED_CRITICAL"
        priority_level = "HIGH_PRIORITY" # Critical Flag / Rejection / Invariant Failure

    return {
        "composite_confidence": composite_score,
        "composite_pct": composite_pct,
        "routing_status": routing_status,
        "status_flag": status_flag,
        "priority_level": priority_level,
        "breakdown": {
            "ocr_score": round(c_ocr, 2),
            "rules_score": round(c_rules, 2),
            "database_gis_score": round(c_db, 2),
            "deduplication_score": round(c_dup, 2),
            "area_rule_passed": area_rule_passed,
            "share_rule_passed": share_rule_passed,
            "share_sum": round(share_sum, 3)
        }
    }

def auto_detect_document_type(text_content: str, filename: str = "") -> str:
    """
    Auto-detects document schema type based on extracted text & filename markers.
    Returns: 'CONVEYANCE_DEED', 'MUTATION_REGISTER', 'CADASTRAL_MAP', or 'RECORD_OF_RIGHTS'
    """
    text = (str(text_content) + " " + str(filename)).lower()
    
    # 1. Conveyance & Transfer Deeds
    if any(k in text for k in ["sale deed", "gift deed", "partition deed", "relinquishment", "executant", "claimant", "sro office", "stamp duty", "consideration", "book volume", "conveyance"]):
        return "CONVEYANCE_DEED"
        
    # 2. Mutation Register & Orders
    if any(k in text for k in ["mutation", "dakhil-kharij", "dakhil kharij", "vf-6", "vf6", "case reference", "nature of mutation", "transferor", "transferee", "sanctioned date", "succession"]):
        return "MUTATION_REGISTER"
        
    # 3. Spatial Cadastral Map
    if any(k in text for k in ["cadastral", "bhu-naksha", "bhu naksha", "fmb", "field measurement", "sheet number", "projection system", "epsg", "centroid", "tie line", "geometry_type"]):
        return "CADASTRAL_MAP"
        
    # 4. Record of Rights (Default / RoR)
    return "RECORD_OF_RIGHTS"

class ConfidenceScoringService:
    @staticmethod
    def evaluate_record(record_data: dict, field_confidence: dict = None) -> dict:
        ocr_conf = 0.88
        if field_confidence:
            vals = list(field_confidence.values())
            avg = sum(vals) / len(vals)
            ocr_conf = avg / 100.0 if avg > 1.0 else avg
            
        return compute_composite_confidence(
            ocr_confidence=ocr_conf,
            parsed_record=record_data,
            gis_polygon_area=record_data.get("gis_polygon_area", 0.0),
            is_duplicate=record_data.get("is_duplicate", False)
        )

