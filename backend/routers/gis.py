from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/gis", tags=["GIS Cadastral"])

@router.get("/parcels")
def get_cadastral_parcels():
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "REC-2026-8819",
                "properties": {
                    "khasra_no": "42/1",
                    "ulpin": "UP-LKO-421-9921",
                    "owner_name": "Ramesh Kumar & Suresh Kumar",
                    "recorded_area": "2428.11 sqm",
                    "gis_computed_area": "2426.50 sqm",
                    "status": "VALID",
                    "village": "Rampur"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [80.9400, 26.8500],
                            [80.9425, 26.8500],
                            [80.9425, 26.8520],
                            [80.9400, 26.8520],
                            [80.9400, 26.8500]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "id": "REC-2026-8820",
                "properties": {
                    "khasra_no": "108/B",
                    "ulpin": "UP-LKO-108-4421",
                    "owner_name": "Harish Chandra & Mahesh Chandra",
                    "recorded_area": "4050.00 sqm",
                    "gis_computed_area": "3890.00 sqm",
                    "status": "FLAGGED_WARNING",
                    "village": "Chinhat"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [80.9430, 26.8500],
                            [80.9465, 26.8500],
                            [80.9465, 26.8525],
                            [80.9430, 26.8525],
                            [80.9430, 26.8500]
                        ]
                    ]
                }
            }
        ]
    }
