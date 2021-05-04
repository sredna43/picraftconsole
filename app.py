from flask import Flask, render_template
from flask_socketio import SocketIO
from threading import Thread, Event
import json
import sys
import mcrcon
import socket
import atexit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secretkey321'
app.config['DEBUG'] = False

socketio = SocketIO(app)


with open('config/config.json') as f:
    cfg = json.load(f)

def rcon_login():
    global sock
    global cfg
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((cfg['host'], cfg['port']))
        result = mcrcon.login(sock, cfg['password'])
        app.logger.debug('Result: ' + str(result))
        socketio.emit('login', {'logged_in': result, 'host': cfg['host'], 'port': str(cfg['port'])})
    except:
        socketio.emit('login', {'logged_in': False, 'host': cfg['host'], 'port': str(cfg['port'])})
        return

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def rcon_connect():
    app.logger.debug('Client connected')
    rcon_login()

@socketio.on('disconnect')
def rcon_disconnect():
    app.logger.debug("Client disconnected")

@socketio.on('command')
def handle_my_custom_event(request, methods=['GET', 'POST']):
    global sock
    app.logger.debug('received input: ' + str(request['data']))
    response = mcrcon.command(sock, str(request['data']))
    socketio.emit('response', {'response': response})

@socketio.on('reload config')
def reload_config():
    app.logger.debug('reloading config')
    global sock
    global cfg
    with open('config/config.json') as f:
        cfg = json.load(f)
    socketio.emit('response', {'response': 'Config reloaded'})
    rcon_login()

def shutdown():
    global sock
    sock.close()

atexit.register(shutdown)

if __name__ == "__main__":
    rcon_login()
    port = cfg['app_port'] if cfg['app_port'] else 5000
    socketio.run(app, debug=True, port=port)
