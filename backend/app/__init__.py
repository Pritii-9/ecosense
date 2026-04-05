from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

from app.config import Config
from app.extensions import init_mongo
from app.routes.analytics import analytics_bp
from app.routes.auth import auth_bp
from app.routes.dashboard import dashboard_bp
from app.routes.impact import impact_bp
from app.routes.leaderboard import leaderboard_bp
from app.routes.recycling_centers import recycling_centers_bp
from app.routes.waste import waste_bp

socketio = SocketIO(cors_allowed_origins="*")


def create_app() -> Flask:
    """Application factory used by Flask and Gunicorn."""
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS_LIST"]}},
        supports_credentials=False,
    )

    init_mongo(app)

    app.register_blueprint(analytics_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(waste_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(recycling_centers_bp)
    app.register_blueprint(impact_bp)

    @app.get("/health")
    def health_check():
        return jsonify({"message": "EcoSense backend is running"}), 200

    return app


def create_app_with_socketio() -> tuple:
    """Create app with Socket.IO support for development server."""
    app = create_app()
    socketio.init_app(app, cors_allowed_origins="*")
    return app, socketio
