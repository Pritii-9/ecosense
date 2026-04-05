"""Socket.IO event handlers for real-time updates."""

from datetime import UTC, datetime, timedelta

from bson import ObjectId
from flask import request
from flask_socketio import emit

from app.extensions import get_database

# CO2 savings estimates per kg (in kg CO2)
CO2_SAVINGS_PER_KG = {
    "Plastic": 1.5,
    "Paper": 0.9,
    "Glass": 0.3,
    "Organic": 0.5,
    "Metal": 2.0,
}

CO2_PER_TREE_KG = 22


def register_socket_events(socketio):
    """Register all Socket.IO event handlers."""

    @socketio.on("connect")
    def handle_connect():
        """Handle client connection."""
        emit("connected", {"message": "Connected to EcoSense real-time server"})

    @socketio.on("disconnect")
    def handle_disconnect():
        """Handle client disconnection."""
        pass

    @socketio.on("join_impact_room")
    def handle_join_impact_room():
        """Join the impact room for real-time updates."""
        from flask_socketio import join_room
        join_room("impact")
        emit("joined", {"room": "impact"})

    @socketio.on("request_impact_update")
    def handle_impact_update():
        """Send current impact stats to requesting client."""
        impact_data = _get_impact_data()
        emit("impact_update", impact_data)

    @socketio.on("request_activity_feed")
    def handle_activity_feed():
        """Send recent activity feed to requesting client."""
        feed = _get_activity_feed()
        emit("activity_feed", feed)


def broadcast_new_waste_log(waste_type, quantity, points, user_id=None):
    """Broadcast a new waste log to all connected clients."""
    from app import socketio

    # Get user name
    user_name = "Unknown User"
    try:
        database = get_database()
        if user_id:
            user = database.users.find_one({"_id": ObjectId(user_id)}, {"name": 1})
            if user:
                user_name = user.get("name", "Unknown User")
    except Exception:
        pass

    # Emit activity notification
    socketio.emit(
        "new_activity",
        {
            "user_name": user_name,
            "type": waste_type,
            "quantity": quantity,
            "points": points,
            "time_ago": "just now",
        },
        room="impact",
    )

    # Broadcast updated impact stats
    impact_data = _get_impact_data()
    socketio.emit("impact_update", impact_data, room="impact")


def broadcast_leaderboard_update():
    """Notify clients that leaderboard has been updated."""
    from app import socketio

    socketio.emit("leaderboard_updated", {"message": "Leaderboard updated"})


def _get_impact_data():
    """Calculate current community impact statistics."""
    database = get_database()
    now = datetime.now(UTC)
    today_start = datetime(now.year, now.month, now.day, tzinfo=UTC)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

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

    active_user_ids = database.waste_logs.distinct(
        "user_id", {"created_at": {"$gte": now - timedelta(hours=24)}}
    )
    total_users = database.users.count_documents({})

    type_breakdown = {}
    for stat in all_stats:
        type_breakdown[stat["_id"]] = {
            "quantity": stat["total_quantity"],
            "points": stat["total_points"],
            "co2_saved_kg": round(
                stat["total_quantity"] * CO2_SAVINGS_PER_KG.get(stat["_id"], 0), 2
            ),
        }

    return {
        "today": calculate_totals(today_stats),
        "this_week": calculate_totals(week_stats),
        "this_month": calculate_totals(month_stats),
        "all_time": calculate_totals(all_stats),
        "active_recyclers_24h": len(active_user_ids),
        "total_users": total_users,
        "type_breakdown": type_breakdown,
    }


def _get_activity_feed():
    """Get recent activity feed with user names."""
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
        user_name = "Unknown User"
        try:
            user = database.users.find_one({"_id": log.get("user_id")}, {"name": 1})
            if user:
                user_name = user.get("name", "Unknown User")
        except Exception:
            pass

        feed.append(
            {
                "user_name": user_name,
                "type": log["type"],
                "quantity": log["quantity"],
                "points": log["points"],
                "time_ago": _time_ago(log.get("created_at")),
            }
        )

    return {"feed": feed}


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