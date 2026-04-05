from datetime import UTC, date, datetime

from bson import ObjectId
from flask import Blueprint, g, jsonify, request

from app.extensions import get_database
from app.utils.auth import jwt_required
from app.utils.serializers import serialize_waste_log

waste_bp = Blueprint("waste", __name__)

WASTE_POINTS = {
    "Plastic": 5,
    "Paper": 3,
    "Glass": 4,
    "Organic": 2,
    "Metal": 6,
}


def _parse_log_date(raw_date: str | None) -> date:
    if not raw_date:
        return datetime.now(UTC).date()

    return datetime.strptime(raw_date, "%Y-%m-%d").date()


@waste_bp.route("/waste", methods=["POST", "GET"])
@jwt_required
def waste():
    if request.method == "POST":
        return create_waste_log()

    return get_waste_logs()


def create_waste_log():
    payload = request.get_json(silent=True) or {}
    waste_type = str(payload.get("type", "")).strip().title()
    raw_quantity = payload.get("quantity")

    if waste_type not in WASTE_POINTS:
        return jsonify({"error": "Waste type must be Plastic, Paper, Glass, Organic, or Metal"}), 400

    try:
        quantity = int(raw_quantity)
    except (TypeError, ValueError):
        return jsonify({"error": "Quantity must be a whole number"}), 400

    if quantity <= 0:
        return jsonify({"error": "Quantity must be greater than zero"}), 400

    try:
        log_date = _parse_log_date(payload.get("date"))
    except ValueError:
        return jsonify({"error": "Date must be in YYYY-MM-DD format"}), 400

    points = WASTE_POINTS[waste_type] * quantity
    stored_date = datetime.combine(log_date, datetime.min.time(), tzinfo=UTC)
    waste_log = {
        "user_id": ObjectId(g.current_user_id),
        "type": waste_type,
        "quantity": quantity,
        "points": points,
        "date": stored_date,
        "created_at": datetime.now(UTC),
    }

    database = get_database()
    inserted = database.waste_logs.insert_one(waste_log)
    database.users.update_one({"_id": ObjectId(g.current_user_id)}, {"$inc": {"total_points": points}})

    created_log = database.waste_logs.find_one({"_id": inserted.inserted_id})

    # Broadcast real-time update
    try:
        from app.socket_events import broadcast_new_waste_log, broadcast_leaderboard_update
        broadcast_new_waste_log(waste_type, quantity, points, user_id=g.current_user_id)
        broadcast_leaderboard_update()
    except Exception:
        pass  # Don't fail the request if socket broadcast fails

    return jsonify(
        {
            "message": "Waste log created successfully",
            "log": serialize_waste_log(created_log),
            "total_points": g.current_user.get("total_points", 0) + points,
        }
    ), 201


def get_waste_logs():
    database = get_database()
    logs = list(
        database.waste_logs.find({"user_id": ObjectId(g.current_user_id)}).sort(
            [("date", -1), ("created_at", -1)]
        )
    )

    return jsonify({"logs": [serialize_waste_log(log) for log in logs]}), 200
