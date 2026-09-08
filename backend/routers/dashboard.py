from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard Metrics"])

@router.get("/metrics")
def get_dashboard_metrics():
    return {
        "archival_digitization": {
            "processed_count": 14892,
            "weekly_increment": "+1,640",
            "growth_rate": "12.4%",
            "target": "15.2k"
        },
        "ocr_nlp_accuracy": {
            "overall_accuracy_pct": 98.42,
            "handwritten_accuracy_pct": 94.10,
            "printed_accuracy_pct": 99.80,
            "target_benchmark": "95.0%"
        },
        "pending_verification": {
            "queue_size": 14,
            "critical_flags": 3,
            "warning_flags": 11,
            "avg_review_time_mins": 3.4
        },
        "district_digitization": {
            "overall_district_pct": 91.80,
            "total_parcels_mapped": 142050,
            "verified_parcels": 130400,
            "district_name": "Lucknow Division"
        }
    }
