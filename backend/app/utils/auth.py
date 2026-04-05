from datetime import UTC, datetime, timedelta
from functools import wraps

import jwt
from bson import ObjectId
from flask import current_app, g, jsonify, request

from app.extensions import get_database


def generate_token(user_id: str) -> str:
    expires_at = datetime.now(UTC) + timedelta(hours=current_app.config["JWT_EXPIRES_IN_HOURS"])
    payload = {"user_id": user_id, "exp": expires_at}
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])


def jwt_required(view_function):
    """Validate the bearer token and attach the current user to Flask's context."""

    @wraps(view_function)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization token is missing"}), 401

        token = auth_header.split(" ", maxsplit=1)[1].strip()

        try:
            payload = decode_token(token)
            user = get_database().users.find_one({"_id": ObjectId(payload["user_id"])})
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except (jwt.InvalidTokenError, ValueError, TypeError):
            return jsonify({"error": "Invalid token"}), 401

        if user is None:
            return jsonify({"error": "User not found"}), 401

        g.current_user = user
        g.current_user_id = str(user["_id"])
        return view_function(*args, **kwargs)

    return wrapper
