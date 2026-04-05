from datetime import UTC, datetime, timedelta

from bson import ObjectId
from flask import Blueprint, g, jsonify

from app.extensions import get_database
from app.utils.auth import jwt_required

analytics_bp = Blueprint("analytics", __name__)

# CO2 emissions per kg (in kg CO2) — same factors used in impact calculations
CO2_EMISSIONS_PER_KG = {
    "Plastic": 1.5,
    "Paper": 0.9,
    "Glass": 0.3,
    "Organic": 0.5,
    "Metal": 2.0,
}


@analytics_bp.get("/analytics/forecast")
@jwt_required
def get_co2_forecast():
    """
    Return a 30-day CO2 forecast based on the user's last 30 days of waste logs.
    If data is sparse (fewer than 7 days with logs), fall back to a growth-model
    that extrapolates from whatever data is available using a linear trend.

    Multi-tenant support:
    - Regular users: forecast based on their own logs
    - CEO/Admin: forecast based on all logs in their org
    """
    database = get_database()
    now = datetime.now(UTC)
    thirty_days_ago = now - timedelta(days=30)

    current_user = g.current_user
    user_role = current_user.get("role", "user")
    user_org_id = current_user.get("org_id")

    # Build query based on role
    if user_role in ("ceo", "admin") and user_org_id:
        org_users = list(database.users.find({"org_id": user_org_id}, {"_id": 1}))
        org_user_ids = [u["_id"] for u in org_users]
        query = {"user_id": {"$in": org_user_ids}, "created_at": {"$gte": thirty_days_ago}}
    else:
        query = {"user_id": ObjectId(g.current_user_id), "created_at": {"$gte": thirty_days_ago}}

    # Fetch waste logs from the last 30 days
    logs = list(
        database.waste_logs.find(query).sort("created_at", 1)
    )

    # Build a daily time-series of CO2 emissions
    daily_co2 = _build_daily_co2_series(logs, thirty_days_ago, now)

    # Determine if data is sparse
    days_with_data = sum(1 for v in daily_co2.values() if v > 0)
    is_sparse = days_with_data < 7

    if is_sparse:
        forecast = _fallback_growth_model(daily_co2)
    else:
        forecast = _linear_regression_forecast(daily_co2)

    # Compute summary statistics
    total_co2_last_30 = sum(daily_co2.values())
    avg_daily_co2 = total_co2_last_30 / 30
    forecast_total = sum(forecast)

    return jsonify(
        {
            "forecast_period_days": 30,
            "daily_forecast_kg_co2": forecast,
            "total_forecast_kg_co2": round(forecast_total, 2),
            "last_30_days_total_kg_co2": round(total_co2_last_30, 2),
            "avg_daily_kg_co2": round(avg_daily_co2, 2),
            "data_quality": "sparse" if is_sparse else "sufficient",
            "days_with_data": days_with_data,
            "model_used": "growth_fallback" if is_sparse else "linear_regression",
        }
    ), 200


def _build_daily_co2_series(logs, start_date, end_date):
    """
    Build a dict mapping day index (0-29) to CO2 kg emitted on that day.
    """
    daily_co2 = {i: 0.0 for i in range(30)}

    for log in logs:
        log_date = log.get("created_at")
        if log_date is None:
            continue
        if log_date.tzinfo is None:
            log_date = log_date.replace(tzinfo=UTC)

        day_index = (log_date - start_date).days
        if 0 <= day_index < 30:
            waste_type = log.get("type", "")
            quantity = log.get("quantity", 0)
            co2 = quantity * CO2_EMISSIONS_PER_KG.get(waste_type, 0)
            daily_co2[day_index] += co2

    return daily_co2


def _linear_regression_forecast(daily_co2):
    """
    Use simple linear regression on the 30-day series to forecast the next 30 days.
    """
    n = 30
    x_values = list(range(n))
    y_values = [daily_co2[i] for i in range(n)]

    x_mean = sum(x_values) / n
    y_mean = sum(y_values) / n

    numerator = sum((x_values[i] - x_mean) * (y_values[i] - y_mean) for i in range(n))
    denominator = sum((x_values[i] - x_mean) ** 2 for i in range(n))

    if denominator == 0:
        slope = 0
    else:
        slope = numerator / denominator

    intercept = y_mean - slope * x_mean

    forecast = []
    for day in range(30, 60):
        predicted = slope * day + intercept
        forecast.append(round(max(predicted, 0), 4))

    return forecast


def _fallback_growth_model(daily_co2):
    """
    Fallback model for sparse data:
    - Calculate average daily CO2 from days that have data
    - Apply a modest growth factor (5% increase over the forecast period)
      to simulate gradual increase in waste generation habits
    """
    days_with_data = [v for v in daily_co2.values() if v > 0]

    if not days_with_data:
        # No data at all — return zero forecast
        return [0.0] * 30

    avg_co2 = sum(days_with_data) / len(days_with_data)

    # Growth model: start at avg and grow linearly by 5% over 30 days
    growth_rate = 0.05 / 30  # daily growth increment

    forecast = []
    for day in range(30):
        factor = 1 + growth_rate * day
        predicted = avg_co2 * factor
        forecast.append(round(predicted, 4))

    return forecast