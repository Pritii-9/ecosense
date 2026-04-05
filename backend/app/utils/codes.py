import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from flask import current_app

from app.extensions import get_database


def _utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def generate_verification_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _hash_code(code: str) -> str:
    payload = f"{current_app.config['JWT_SECRET_KEY']}::{code}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def save_code(email: str, purpose: str, code: str, metadata: dict | None = None) -> datetime:
    now = _utc_now()
    expires_at = now + timedelta(minutes=current_app.config["AUTH_CODE_EXPIRY_MINUTES"])
    document = {
        "email": email,
        "purpose": purpose,
        "code_hash": _hash_code(code),
        "created_at": now,
        "expires_at": expires_at,
        "attempt_count": 0,
        "metadata": metadata or {},
    }

    get_database().auth_codes.update_one(
        {"email": email, "purpose": purpose},
        {"$set": document},
        upsert=True,
    )
    return expires_at


def verify_code(email: str, purpose: str, code: str) -> tuple[bool, str, dict | None]:
    record = get_database().auth_codes.find_one({"email": email, "purpose": purpose})

    if record is None:
        return False, "No active verification code was found. Please request a new code.", None

    expires_at = record.get("expires_at")
    if expires_at is None or expires_at < _utc_now():
        get_database().auth_codes.delete_one({"_id": record["_id"]})
        return False, "This verification code has expired. Please request a new one.", None

    if record.get("attempt_count", 0) >= 5:
        get_database().auth_codes.delete_one({"_id": record["_id"]})
        return False, "Too many incorrect attempts. Please request a new code.", None

    if record.get("code_hash") != _hash_code(code):
        get_database().auth_codes.update_one(
            {"_id": record["_id"]},
            {"$inc": {"attempt_count": 1}},
        )
        return False, "The verification code is incorrect.", None

    return True, "Code verified successfully.", record


def delete_code(email: str, purpose: str) -> None:
    get_database().auth_codes.delete_one({"email": email, "purpose": purpose})
