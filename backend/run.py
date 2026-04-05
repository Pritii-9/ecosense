from app import create_app_with_socketio
from app.socket_events import register_socket_events

app, socketio = create_app_with_socketio()
register_socket_events(socketio)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
