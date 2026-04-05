from bson import ObjectId
from flask import Blueprint, g, jsonify

from app.extensions import get_database
from app.utils.auth import jwt_required
from app.utils.serializers import serialize_waste_log

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/points")
@jwt_required
def points():
    database = get_database()
    user = database.users.find_one({"_id": ObjectId(g.current_user_id)})
    recent_logs = list(
        database.waste_logs.find({"user_id": ObjectId(g.current_user_id)})
        .sort([("date", -1), ("created_at", -1)])
        .limit(5)
    )

    breakdown_pipeline = [
        {"$match": {"user_id": ObjectId(g.current_user_id)}},
        {"$group": {"_id": "$type", "quantity": {"$sum": "$quantity"}, "points": {"$sum": "$points"}}},
        {"$sort": {"points": -1}},
    ]
    waste_breakdown = [
        {"type": item["_id"], "quantity": item["quantity"], "points": item["points"]}
        for item in database.waste_logs.aggregate(breakdown_pipeline)
    ]

    return jsonify(
        {
            "total_points": user.get("total_points", 0) if user else 0,
            "recent_logs": [serialize_waste_log(log) for log in recent_logs],
            "waste_breakdown": waste_breakdown,
        }
    ), 200
