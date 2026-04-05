from datetime import UTC, datetime

import bcrypt
from flask import Blueprint, current_app, jsonify, request
from pymongo.errors import DuplicateKeyError

from app.extensions import get_database
from app.utils.auth import generate_token
from app.utils.codes import delete_code, generate_verification_code, save_code, verify_code
from app.utils.email_service import send_email
from app.utils.serializers import serialize_user
from app.utils.validation import is_valid_code, is_valid_email, is_valid_name, is_valid_password

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

REGISTER_CODE_PURPOSE = "register"
RESET_CODE_PURPOSE = "password_reset"


def _read_json() -> dict:
    return request.get_json(silent=True) or {}


def _normalize_name(raw_name: object) -> str:
    return str(raw_name or "").strip()


def _normalize_email(raw_email: object) -> str:
    return str(raw_email or "").strip().lower()


def _normalize_password(raw_password: object) -> str:
    return str(raw_password or "")


def _normalize_code(raw_code: object) -> str:
    return str(raw_code or "").strip()


def _send_code_email(recipient: str, recipient_name: str, code: str, purpose: str) -> None:
    app_name = current_app.config["APP_NAME"]
    expiry_minutes = current_app.config["AUTH_CODE_EXPIRY_MINUTES"]
    action_label = "email verification" if purpose == REGISTER_CODE_PURPOSE else "password reset"
    subject = f"Your {action_label} code for {app_name}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; color: #173126; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">{app_name} verification</h2>
      <p>Hello {recipient_name or "there"},</p>
      <p>Your {action_label} code is:</p>
      <div style="display: inline-block; margin: 14px 0; padding: 12px 18px; border-radius: 12px; background: #e7f4e4; font-size: 28px; font-weight: 700; letter-spacing: 0.35em;">
        {code}
      </div>
      <p>This code expires in {expiry_minutes} minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p style="margin-top: 24px;">- {app_name}</p>
    </div>
    """
    send_email(recipient, subject, html_body)


def _validate_name_email(name: str, email: str) -> tuple[bool, tuple | None]:
    if not name:
        return False, (jsonify({"error": "First name is required."}), 400)

    if not is_valid_name(name):
        return (
            False,
            (
                jsonify(
                    {
                        "error": "Enter a valid first name using letters, spaces, apostrophes, or hyphens only."
                    }
                ),
                400,
            ),
        )

    if not email:
        return False, (jsonify({"error": "Email is required."}), 400)

    if not is_valid_email(email):
        return False, (jsonify({"error": "Enter a valid email address."}), 400)

    return True, None


def _validate_password(password: str) -> tuple[bool, tuple | None]:
    if not password:
        return False, (jsonify({"error": "Password is required."}), 400)

    if not is_valid_password(password):
        return (
            False,
            (
                jsonify(
                    {
                        "error": "Password must be 8-64 characters and include uppercase, lowercase, number, and special character."
                    }
                ),
                400,
            ),
        )

    return True, None


@auth_bp.post("/register/request-code")
def request_register_code():
    payload = _read_json()
    name = _normalize_name(payload.get("name"))
    email = _normalize_email(payload.get("email"))
    is_valid, error_response = _validate_name_email(name, email)

    if not is_valid:
        return error_response

    existing_user = get_database().users.find_one({"email": email})
    if existing_user is not None:
        return jsonify({"error": "An account with this email already exists."}), 409

    code = generate_verification_code()
    save_code(email, REGISTER_CODE_PURPOSE, code, {"name": name})

    try:
        _send_code_email(email, name, code, REGISTER_CODE_PURPOSE)
    except Exception as exc:
        delete_code(email, REGISTER_CODE_PURPOSE)
        return jsonify({"error": f"Unable to send verification email. {exc}"}), 500

    return (
        jsonify(
            {
                "message": "Verification code sent successfully. Please check your email.",
                "email": email,
            }
        ),
        200,
    )


@auth_bp.post("/register")
def register():
    payload = _read_json()
    name = _normalize_name(payload.get("name"))
    email = _normalize_email(payload.get("email"))
    password = _normalize_password(payload.get("password"))
    code = _normalize_code(payload.get("code"))

    is_valid, error_response = _validate_name_email(name, email)
    if not is_valid:
        return error_response

    is_valid, error_response = _validate_password(password)
    if not is_valid:
        return error_response

    if not is_valid_code(code):
        return jsonify({"error": "Enter the 6-digit verification code sent to your email."}), 400

    if get_database().users.find_one({"email": email}) is not None:
        return jsonify({"error": "An account with this email already exists."}), 409

    code_is_valid, message, record = verify_code(email, REGISTER_CODE_PURPOSE, code)
    if not code_is_valid:
        return jsonify({"error": message}), 400

    stored_name = record.get("metadata", {}).get("name") if record else None
    final_name = stored_name or name
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user_document = {
        "name": final_name,
        "email": email,
        "password_hash": password_hash,
        "email_verified": True,
        "verified_at": datetime.now(UTC),
        "total_points": 0,
        "created_at": datetime.now(UTC),
    }

    try:
        result = get_database().users.insert_one(user_document)
    except DuplicateKeyError:
        return jsonify({"error": "An account with this email already exists."}), 409

    delete_code(email, REGISTER_CODE_PURPOSE)
    created_user = get_database().users.find_one({"_id": result.inserted_id})
    token = generate_token(str(result.inserted_id))

    return (
        jsonify(
            {
                "message": "Registration successful.",
                "token": token,
                "user": serialize_user(created_user),
            }
        ),
        201,
    )


@auth_bp.post("/login")
def login():
    payload = _read_json()
    email = _normalize_email(payload.get("email"))
    password = _normalize_password(payload.get("password"))

    if not email:
        return jsonify({"error": "Email is required."}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Enter a valid email address."}), 400

    if not password:
        return jsonify({"error": "Password is required."}), 400

    user = get_database().users.find_one({"email": email})
    if user is None:
        return jsonify({"error": "No account was found for this email address."}), 404

    if user.get("email_verified") is False:
        return jsonify({"error": "Please verify your email before logging in."}), 403

    password_matches = bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8"))
    if not password_matches:
        return jsonify({"error": "Incorrect password. Please try again."}), 401

    token = generate_token(str(user["_id"]))
    return jsonify({"message": "Login successful.", "token": token, "user": serialize_user(user)}), 200


@auth_bp.post("/forgot-password/request-code")
def request_password_reset_code():
    payload = _read_json()
    email = _normalize_email(payload.get("email"))

    if not email:
        return jsonify({"error": "Email is required."}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Enter a valid email address."}), 400

    user = get_database().users.find_one({"email": email})
    if user is None:
        return jsonify({"error": "No account exists with this email address."}), 404

    code = generate_verification_code()
    save_code(email, RESET_CODE_PURPOSE, code, {"name": user.get("name", "")})

    try:
        _send_code_email(email, user.get("name", ""), code, RESET_CODE_PURPOSE)
    except Exception as exc:
        delete_code(email, RESET_CODE_PURPOSE)
        return jsonify({"error": f"Unable to send reset email. {exc}"}), 500

    return jsonify({"message": "Password reset code sent successfully.", "email": email}), 200


@auth_bp.post("/forgot-password/reset")
def reset_password():
    payload = _read_json()
    email = _normalize_email(payload.get("email"))
    password = _normalize_password(payload.get("password"))
    code = _normalize_code(payload.get("code"))

    if not email:
        return jsonify({"error": "Email is required."}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Enter a valid email address."}), 400

    if get_database().users.find_one({"email": email}) is None:
        return jsonify({"error": "No account exists with this email address."}), 404

    is_valid, error_response = _validate_password(password)
    if not is_valid:
        return error_response

    if not is_valid_code(code):
        return jsonify({"error": "Enter the 6-digit password reset code."}), 400

    code_is_valid, message, _record = verify_code(email, RESET_CODE_PURPOSE, code)
    if not code_is_valid:
        return jsonify({"error": message}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    get_database().users.update_one(
        {"email": email},
        {"$set": {"password_hash": password_hash, "password_updated_at": datetime.now(UTC)}},
    )
    delete_code(email, RESET_CODE_PURPOSE)

    return jsonify({"message": "Password updated successfully. You can now log in."}), 200


@auth_bp.post("/logout")
def logout():
    return jsonify({"message": "Logout successful"}), 200
