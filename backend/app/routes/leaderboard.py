from bson import ObjectId
from flask import Blueprint, g, jsonify, request

from app.extensions import get_database
from app.utils.auth import jwt_required

leaderboard_bp = Blueprint("leaderboard", __name__)


@leaderboard_bp.get("/leaderboard")
@jwt_required
def leaderboard():
    """
    Multi-tenant leaderboard with role-based data visibility:
    - Regular users: see only their own ranking among all users
    - CEO/Admin: see department-level aggregation for their org_id
    """
    current_user = g.current_user
    user_role = current_user.get("role", "user")
    user_org_id = current_user.get("org_id")

    # CEO/Admin with org_id sees department leaderboard
    if user_role in ("ceo", "admin") and user_org_id:
        return _get_department_leaderboard(user_org_id)

    # Regular user sees global leaderboard with their own data highlighted
    return _get_global_leaderboard()


def _get_global_leaderboard():
    """Global leaderboard showing top 10 users across all orgs."""
    users = list(
        get_database()
        .users.find({}, {"name": 1, "email": 1, "total_points": 1, "org_id": 1, "department": 1, "role": 1})
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
            "org_id": user.get("org_id"),
            "department": user.get("department"),
        }
        for index, user in enumerate(users)
    ]

    return jsonify({"leaders": leaderboard_entries, "scope": "global"}), 200


def _get_department_leaderboard(org_id):
    """
    Department-level leaderboard for CEO/Admin.
    Aggregates total_points per department within the given org_id.
    """
    pipeline = [
        {"$match": {"org_id": org_id}},
        {
            "$group": {
                "_id": "$department",
                "department": {"$first": "$department"},
                "total_points": {"$sum": "$total_points"},
                "member_count": {"$sum": 1},
                "avg_points": {"$avg": "$total_points"},
                "top_members": {
                    "$push": {
                        "id": {"$toString": "$_id"},
                        "name": "$name",
                        "total_points": "$total_points",
                    }
                },
            }
        },
        {"$sort": {"total_points": -1}},
    ]

    departments = list(get_database().users.aggregate(pipeline))

    # Build ranked entries with top 3 members per department
    entries = []
    for rank, dept in enumerate(departments, 1):
        top_members = sorted(dept.get("top_members", []), key=lambda x: x.get("total_points", 0), reverse=True)[:3]
        entries.append(
            {
                "rank": rank,
                "department": dept.get("department") or "Unassigned",
                "total_points": dept.get("total_points", 0),
                "member_count": dept.get("member_count", 0),
                "avg_points": round(dept.get("avg_points", 0), 2),
                "top_members": top_members,
            }
        )

    return jsonify({"leaders": entries, "scope": "department", "org_id": org_id}), 200


@leaderboard_bp.get("/leaderboard/my-org")
@jwt_required
def get_org_leaderboard():
    """
    Get leaderboard scoped to the current user's organization.
    Regular users see their org's department breakdown.
    CEO/Admin see the full org department leaderboard.
    """
    current_user = g.current_user
    user_org_id = current_user.get("org_id")

    if not user_org_id:
        return jsonify({"error": "You are not associated with an organization."}), 403

    return _get_department_leaderboard(user_org_id)


@leaderboard_bp.get("/leaderboard/my-department")
@jwt_required
def get_department_leaderboard():
    """
    Get leaderboard scoped to the current user's department within their org.
    Shows all users in the same department ranked by points.
    """
    current_user = g.current_user
    user_org_id = current_user.get("org_id")
    user_department = current_user.get("department")

    if not user_org_id or not user_department:
        return jsonify({"error": "You are not associated with a department."}), 403

    match_filter = {"org_id": user_org_id, "department": user_department}

    users = list(
        get_database()
        .users.find(match_filter, {"name": 1, "email": 1, "total_points": 1, "department": 1})
        .sort("total_points", -1)
        .limit(50)
    )

    entries = [
        {
            "rank": index + 1,
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "total_points": user.get("total_points", 0),
            "department": user.get("department"),
        }
        for index, user in enumerate(users)
    ]

    return jsonify({"leaders": entries, "scope": "department_members", "department": user_department}), 200