import eventlet
eventlet.monkey_patch()

from app import create_app_with_socketio
from app.socket_events import register_socket_events

app, socketio = create_app_with_socketio()
register_socket_events(socketio)