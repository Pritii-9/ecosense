import eventlet
eventlet.monkey_patch()

from flask import jsonify
from app import create_app_with_socketio
from app.socket_events import register_socket_events

app, socketio = create_app_with_socketio()
register_socket_events(socketio)


@app.route("/")
def index():
    return jsonify({
        "message": "EcoSense API is running",
        "health": "/health",
        "docs": "https://github.com/Pritii-9/ecosense"
    })


# For Gunicorn preload
application = app
