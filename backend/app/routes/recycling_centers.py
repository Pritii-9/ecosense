from math import asin, cos, radians, sin, sqrt

from flask import Blueprint, jsonify, request

recycling_centers_bp = Blueprint("recycling_centers", __name__)

MOCK_CENTERS = [
    {"name": "Green Loop Recycling Hub", "address": "MG Road, Bengaluru", "lat": 12.9756, "lng": 77.6050},
    {"name": "Riverfront Plastic Recovery Point", "address": "Indiranagar, Bengaluru", "lat": 12.9784, "lng": 77.6408},
    {"name": "Metro Scrap & Metal Center", "address": "Koramangala, Bengaluru", "lat": 12.9345, "lng": 77.6111},
    {"name": "EcoDrop Paper Collection", "address": "Jayanagar, Bengaluru", "lat": 12.9250, "lng": 77.5938},
    {"name": "Urban Compost Community Yard", "address": "HSR Layout, Bengaluru", "lat": 12.9116, "lng": 77.6474},
    {"name": "City Glass Return Station", "address": "Whitefield, Bengaluru", "lat": 12.9698, "lng": 77.7500},
]


def _distance_in_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Simple haversine calculation for sorting nearby results."""
    radius = 6371
    latitude_delta = radians(lat2 - lat1)
    longitude_delta = radians(lng2 - lng1)
    a = (
        sin(latitude_delta / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(longitude_delta / 2) ** 2
    )
    return 2 * radius * asin(sqrt(a))


@recycling_centers_bp.get("/recycling-centers")
def get_recycling_centers():
    raw_lat = request.args.get("lat")
    raw_lng = request.args.get("lng")

    try:
        latitude = float(raw_lat) if raw_lat is not None else None
        longitude = float(raw_lng) if raw_lng is not None else None
    except ValueError:
        return jsonify({"error": "Latitude and longitude must be valid numbers"}), 400

    centers = []
    for center in MOCK_CENTERS:
        enriched_center = {
            **center,
            "distance_km": round(
                _distance_in_km(latitude, longitude, center["lat"], center["lng"]),
                2,
            )
            if latitude is not None and longitude is not None
            else None,
        }
        centers.append(enriched_center)

    if latitude is not None and longitude is not None:
        centers.sort(key=lambda center: center["distance_km"] if center["distance_km"] is not None else 9999)

    return jsonify({"centers": centers[:5]}), 200
