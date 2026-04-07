from datetime import UTC, datetime, timedelta

from bson import ObjectId
from flask import Blueprint, current_app, g, jsonify, request
from pymongo.errors import DuplicateKeyError

from app.extensions import get_database
from app.utils.auth import generate_token, jwt_required
from app.utils.codes import delete_code, generate_verification_code, save_code, verify_code
from app.utils.email_service import send_email
from app.utils.serializers import serialize_user
from app.utils.validation import is_valid_email

# FIXED: Removed strict_slashes=False from Blueprint constructor
team_bp = Blueprint("team", __name__, url_prefix="/team")

INVITE_CODE_PURPOSE = "team_invite"


def _read_json() -> dict:
    return request.get_json(silent=True) or {}


def _normalize_email(raw_email: object) -> str:
    return str(raw_email or "").strip().lower()


def _normalize_code(raw_code: object) -> str:
    return str(raw_code or "").strip()


def _send_invite_email(recipient: str, org_name: str, invited_by: str, code: str) -> None:
    app_name = current_app.config["APP_NAME"]
    expiry_hours = current_app.config["TEAM_INVITE_EXPIRY_HOURS"]
    # Get the base URL from config or use a default
    base_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
    join_url = f"{base_url}/team-invite"
    
    subject = f"You've been invited to join {org_name} on {app_name}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; color: #173126; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Team Invitation</h2>
      <p>Hello,</p>
      <p><strong>{invited_by}</strong> has invited you to join <strong>{org_name}</strong> on {app_name}.</p>
      <p>Your invitation code is:</p>
      <div style="display: inline-block; margin: 14px 0; padding: 12px 18px; border-radius: 12px; background: #e7f4e4; font-size: 28px; font-weight: 700; letter-spacing: 0.35em;">
        {code}
      </div>
      <p>This code expires in {expiry_hours} hours.</p>
      <p style="margin: 20px 0;">
        <a href="{join_url}" 
           style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Join the Team
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #10b981;">{join_url}</p>
      <p style="margin-top: 24px;">- {app_name}</p>
    </div>
    """
    send_email(recipient, subject, html_body)


def _is_admin(user: dict) -> bool:
    return user.get("role") in ["admin", "ceo"]


def _get_org_id(user: dict) -> str | None:
    return user.get("org_id")


@team_bp.post("/org/leave")
@jwt_required
def leave_organization():
    """Leave current organization."""
    current_user = g.current_user

    if not current_user.get("org_id"):
        return jsonify({"error": "You are not part of any organization."}), 400

    get_database().users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"org_id": None, "role": "admin"}}
    )

    return jsonify({"message": "You have left the organization successfully."}), 200


@team_bp.post("/org")
@jwt_required
def create_organization():
    """Create a new organization and assign the current user as admin."""
    current_user = g.current_user

    if current_user.get("org_id"):
        return jsonify({"error": "You are already part of an organization. Leave your current org first."}), 400

    payload = _read_json()
    org_name = str(payload.get("name", "")).strip()
    if not org_name:
        return jsonify({"error": "Organization name is required."}), 400

    org_result = get_database().organizations.insert_one({
        "name": org_name,
        "created_by": current_user["_id"],
        "created_at": datetime.now(UTC),
    })

    get_database().users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"org_id": str(org_result.inserted_id), "role": "admin"}}
    )

    return jsonify({
        "message": f"Organization '{org_name}' created successfully.",
        "org_id": str(org_result.inserted_id)
    }), 201


@team_bp.post("/invite")
@jwt_required
def invite_members():
    """Admin invites team members by email."""
    current_user = g.current_user

    if not _is_admin(current_user):
        return jsonify({"error": "Only admins can invite team members."}), 403

    org_id = _get_org_id(current_user)
    if not org_id:
        return jsonify({"error": "You must be part of an organization to invite members."}), 400

    payload = _read_json()
    emails = payload.get("emails", [])

    if not isinstance(emails, list) or not emails:
        return jsonify({"error": "Please provide a list of email addresses."}), 400

    valid_emails = []
    for raw_email in emails:
        email = _normalize_email(raw_email)
        if not email:
            return jsonify({"error": f"Invalid email address: {raw_email}"}), 400
        if not is_valid_email(email):
            return jsonify({"error": f"Invalid email format: {email}"}), 400
        valid_emails.append(email)

    existing_emails = set()
    for email in valid_emails:
        existing_user = get_database().users.find_one({"email": email})
        if existing_user:
            existing_emails.add(email)
            continue

        existing_invite = get_database().team_invitations.find_one({
            "email": email,
            "org_id": org_id,
            "status": "pending"
        })
        if existing_invite:
            existing_emails.add(email)

    results = {"invited": [], "already_exists": list(existing_emails), "failed": []}

    org_doc = get_database().organizations.find_one({"_id": ObjectId(org_id)})
    org_name = org_doc.get("name", "Organization") if org_doc else "Organization"
    invited_by = current_user.get("name", "Admin")

    for email in valid_emails:
        if email in existing_emails:
            continue

        try:
            code = generate_verification_code()
            now = datetime.now(UTC)
            invitation = {
                "email": email,
                "org_id": org_id,
                "invited_by": str(current_user["_id"]),
                "code": code,
                "status": "pending",
                "created_at": now,
                # FIXED: Using timedelta to prevent overflow errors
                "expires_at": now + timedelta(hours=current_app.config["TEAM_INVITE_EXPIRY_HOURS"])
            }

            get_database().team_invitations.insert_one(invitation)

            try:
                _send_invite_email(email, org_name, invited_by, code)
                results["invited"].append(email)
            except Exception as exc:
                get_database().team_invitations.delete_one({"email": email, "org_id": org_id, "status": "pending"})
                results["failed"].append({"email": email, "reason": f"Email sending failed: {exc}"})
        except Exception as exc:
            results["failed"].append({"email": email, "reason": str(exc)})

    status_code = 200 if results["invited"] else 400
    return jsonify({
        "message": f"Invitations processed. {len(results['invited'])} sent, {len(results['already_exists'])} already exist, {len(results['failed'])} failed.",
        "results": results
    }), status_code


def _normalize_username(raw: object) -> str:
    return str(raw or "").strip().lower()


def _is_valid_username(username: str) -> bool:
    """Username must be 3-20 chars, alphanumeric + underscores only."""
    if len(username) < 3 or len(username) > 20:
        return False
    return all(c.isalnum() or c == '_' for c in username)


@team_bp.post("/invite/accept")
def accept_invite():
    """User accepts invitation with code and creates account."""
    import bcrypt
    
    payload = _read_json()
    email = _normalize_email(payload.get("email"))
    code = _normalize_code(payload.get("code"))
    name = str(payload.get("name", "")).strip()
    username = _normalize_username(payload.get("username", ""))
    password = str(payload.get("password", ""))

    if not email or not name or not password:
        return jsonify({"error": "Email, name, and password are required."}), 400
    
    if not is_valid_email(email):
        return jsonify({"error": "Enter a valid email address."}), 400

    if not username:
        return jsonify({"error": "Username is required."}), 400

    if not _is_valid_username(username):
        return jsonify({"error": "Username must be 3-20 characters and contain only letters, numbers, and underscores."}), 400

    if get_database().users.find_one({"email": email}) is not None:
        return jsonify({"error": "An account with this email already exists."}), 409

    if get_database().users.find_one({"username": username}) is not None:
        return jsonify({"error": "This username is already taken. Please choose another."}), 409

    invitation = get_database().team_invitations.find_one({
        "email": email,
        "status": "pending"
    })

    if not invitation:
        return jsonify({"error": "No pending invitation found for this email."}), 404

    if invitation.get("expires_at") and invitation["expires_at"].replace(tzinfo=UTC) < datetime.now(UTC):
        get_database().team_invitations.update_one(
            {"_id": invitation["_id"]},
            {"$set": {"status": "expired"}}
        )
        return jsonify({"error": "Invitation has expired. Please request a new one."}), 400

    if invitation.get("code") != code:
        return jsonify({"error": "Invalid invitation code."}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_document = {
        "name": name,
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "email_verified": True,
        "verified_at": datetime.now(UTC),
        "total_points": 0,
        "org_id": invitation["org_id"],
        "department": payload.get("department"),
        "role": "user",
        "created_at": datetime.now(UTC),
    }

    try:
        result = get_database().users.insert_one(user_document)
    except DuplicateKeyError:
        return jsonify({"error": "An account with this email already exists."}), 409

    get_database().team_invitations.update_one(
        {"_id": invitation["_id"]},
        {"$set": {"status": "accepted", "accepted_at": datetime.now(UTC), "user_id": result.inserted_id}}
    )

    token = generate_token(str(result.inserted_id))
    created_user = get_database().users.find_one({"_id": result.inserted_id})

    return (
        jsonify({
            "message": "Account created successfully. Welcome to the team!",
            "token": token,
            "user": serialize_user(created_user),
        }),
        201,
    )


@team_bp.get("/members")
@jwt_required
def get_team_members():
    """Get all team members for the current user's organization."""
    current_user = g.current_user
    org_id = _get_org_id(current_user)

    if not org_id:
        return jsonify({"error": "You are not part of an organization."}), 400

    members = list(get_database().users.find(
        {"org_id": org_id},
        {"password_hash": 0}
    ).sort("total_points", -1))

    serialized = [serialize_user(member) for member in members]

    for idx, member in enumerate(serialized, 1):
        member["rank"] = idx

    return jsonify({"members": serialized, "org_id": org_id}), 200


@team_bp.get("/invites/pending")
@jwt_required
def get_pending_invites():
    """Get pending invitations for the current organization."""
    current_user = g.current_user

    if not _is_admin(current_user):
        return jsonify({"error": "Only admins can view pending invitations."}), 403

    org_id = _get_org_id(current_user)
    if not org_id:
        return jsonify({"error": "You are not part of an organization."}), 400

    invites = list(get_database().team_invitations.find(
        {"org_id": org_id, "status": "pending"}
    ).sort("created_at", -1))

    for invite in invites:
        invite["_id"] = str(invite["_id"])
        invite["org_id"] = str(invite["org_id"])
        invite["invited_by"] = str(invite["invited_by"])

    return jsonify({"invites": invites}), 200


@team_bp.post("/invite/resend")
@jwt_required
def resend_invite():
    """Resend an invitation email."""
    current_user = g.current_user

    if not _is_admin(current_user):
        return jsonify({"error": "Only admins can resend invitations."}), 403

    payload = _read_json()
    email = _normalize_email(payload.get("email"))

    if not email:
        return jsonify({"error": "Email is required."}), 400

    org_id = _get_org_id(current_user)
    invitation = get_database().team_invitations.find_one({
        "email": email,
        "org_id": org_id,
        "status": "pending"
    })

    if not invitation:
        return jsonify({"error": "No pending invitation found for this email."}), 404

    new_code = generate_verification_code()
    now = datetime.now(UTC)
    get_database().team_invitations.update_one(
        {"_id": invitation["_id"]},
        {"$set": {
            "code": new_code,
            "created_at": now,
            "expires_at": now + timedelta(hours=current_app.config["TEAM_INVITE_EXPIRY_HOURS"])
        }}
    )

    org_doc = get_database().organizations.find_one({"_id": ObjectId(org_id)})
    org_name = org_doc.get("name", "Organization") if org_doc else "Organization"
    invited_by = current_user.get("name", "Admin")

    try:
        _send_invite_email(email, org_name, invited_by, new_code)
        return jsonify({"message": "Invitation resent successfully."}), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to send email: {exc}"}), 500


@team_bp.post("/invite/cancel")
@jwt_required
def cancel_invite():
    """Cancel a pending invitation."""
    current_user = g.current_user

    if not _is_admin(current_user):
        return jsonify({"error": "Only admins can cancel invitations."}), 403

    payload = _read_json()
    email = _normalize_email(payload.get("email"))

    if not email:
        return jsonify({"error": "Email is required."}), 400

    org_id = _get_org_id(current_user)
    result = get_database().team_invitations.update_one(
        {"email": email, "org_id": org_id, "status": "pending"},
        {"$set": {"status": "cancelled"}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "No pending invitation found for this email."}), 404

    return jsonify({"message": "Invitation cancelled successfully."}), 200