from flask import Blueprint, jsonify

from app.extensions import get_database

leaderboard_bp = Blueprint("leaderboard", __name__)


@leaderboard_bp.get("/leaderboard")
def leaderboard():
    users = list(
        get_database()
        .users.find({}, {"name": 1, "email": 1, "total_points": 1})
        .sort("total_points", -1)
        .limit(10)
    )

    leaderboard_entries = [
        {
            "rank": index + 1,
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "total_points": user.get("total_points", 0),
        }
        for index, user in enumerate(users)
    ]

    return jsonify({"leaders": leaderboard_entries}), 200
