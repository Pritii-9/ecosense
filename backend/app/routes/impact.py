from datetime import UTC, datetime, timedelta

from bson import ObjectId
from flask import Blueprint, g, jsonify, request

from app.extensions import get_database
from app.utils.auth import jwt_required

impact_bp = Blueprint("impact", __name__)

# CO2 savings estimates per kg (in kg CO2)
CO2_SAVINGS_PER_KG = {
    "Plastic": 1.5,
    "Paper": 0.9,
    "Glass": 0.3,
    "Organic": 0.5,
    "Metal": 2.0,
}

# Trees saved estimate: 1 tree absorbs ~22kg CO2 per year
CO2_PER_TREE_KG = 22


@impact_bp.get("/impact")
@jwt_required
def get_community_impact():
    """Get aggregated community environmental impact statistics."""
    database = get_database()
    now = datetime.now(UTC)
    today_start = datetime(now.year, now.month, now.day, tzinfo=UTC)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    # Get all waste logs for different time periods
    def get_stats_for_period(start_date):
        pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {
                "$group": {
                    "_id": "$type",
                    "total_quantity": {"$sum": "$quantity"},
                    "total_points": {"$sum": "$points"},
                    "count": {"$sum": 1},
                }
            },
        ]
        return list(database.waste_logs.aggregate(pipeline))

    today_stats = get_stats_for_period(today_start)
    week_stats = get_stats_for_period(week_start)
    month_stats = get_stats_for_period(month_start)
    all_stats = list(
        database.waste_logs.aggregate([
            {
                "$group": {
                    "_id": "$type",
                    "total_quantity": {"$sum": "$quantity"},
                    "total_points": {"$sum": "$points"},
                    "count": {"$sum": 1},
                }
            },
        ])
    )

    def calculate_totals(stats):
        total_quantity = sum(s["total_quantity"] for s in stats)
        total_points = sum(s["total_points"] for s in stats)
        total_co2 = sum(
            s["total_quantity"] * CO2_SAVINGS_PER_KG.get(s["_id"], 0) for s in stats
        )
        trees_saved = total_co2 / CO2_PER_TREE_KG if total_co2 > 0 else 0
        return {
            "total_quantity": total_quantity,
            "total_points": total_points,
            "total_co2_saved_kg": round(total_co2, 2),
            "trees_saved_equivalent": round(trees_saved, 2),
            "log_count": sum(s["count"] for s in stats),
        }

    # Count unique active users (logged waste in last 24 hours)
    active_users_24h = database.waste_logs.count_documents(
        {"created_at": {"$gte": now - timedelta(hours=24)}},
        distinct=True,
    )
    active_user_ids = database.waste_logs.distinct(
        "user_id", {"created_at": {"$gte": now - timedelta(hours=24)}}
    )
    total_users = database.users.count_documents({})

    # Get type breakdown for all time
    type_breakdown = {}
    for stat in all_stats:
        type_breakdown[stat["_id"]] = {
            "quantity": stat["total_quantity"],
            "points": stat["total_points"],
            "co2_saved_kg": round(
                stat["total_quantity"] * CO2_SAVINGS_PER_KG.get(stat["_id"], 0), 2
            ),
        }

    return jsonify(
        {
            "today": calculate_totals(today_stats),
            "this_week": calculate_totals(week_stats),
            "this_month": calculate_totals(month_stats),
            "all_time": calculate_totals(all_stats),
            "active_recyclers_24h": len(active_user_ids),
            "total_users": total_users,
            "type_breakdown": type_breakdown,
        }
    ), 200


@impact_bp.get("/impact/activity-feed")
@jwt_required
def get_activity_feed():
    """Get recent anonymized waste logging activity."""
    database = get_database()
    recent_logs = list(
        database.waste_logs.find(
            {}, {"user_id": 1, "type": 1, "quantity": 1, "points": 1, "created_at": 1}
        )
        .sort("created_at", -1)
        .limit(20)
    )

    feed = []
    for log in recent_logs:
        time_ago = _time_ago(log.get("created_at"))
        feed.append(
            {
                "type": log["type"],
                "quantity": log["quantity"],
                "points": log["points"],
                "time_ago": time_ago,
            }
        )

    return jsonify({"feed": feed}), 200


def _time_ago(dt):
    if not dt:
        return "unknown"
    now = datetime.now(UTC)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    diff = now - dt
    seconds = int(diff.total_seconds())

    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        mins = seconds // 60
        return f"{mins}m ago"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours}h ago"
    else:
        days = seconds // 86400
        return f"{days}d ago"