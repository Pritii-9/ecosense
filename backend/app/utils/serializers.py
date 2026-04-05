from datetime import date, datetime


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "email_verified": user.get("email_verified", False),
        "total_points": user.get("total_points", 0),
        "org_id": user.get("org_id"),
        "department": user.get("department"),
        "role": user.get("role", "user"),
    }


def serialize_waste_log(log: dict) -> dict:
    raw_date = log.get("date")
    if isinstance(raw_date, datetime):
        formatted_date = raw_date.date().isoformat()
    elif isinstance(raw_date, date):
        formatted_date = raw_date.isoformat()
    else:
        formatted_date = str(raw_date)

    return {
        "id": str(log["_id"]),
        "user_id": str(log["user_id"]),
        "type": log["type"],
        "quantity": log["quantity"],
        "points": log["points"],
        "date": formatted_date,
        "created_at": log.get("created_at").isoformat() if log.get("created_at") else None,
    }
