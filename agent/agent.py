import socketio
import json
import pyautogui
import time
import threading
from datetime import datetime
import ctypes
import math

sio = socketio.Client(
    reconnection=True,
    reconnection_attempts=999999,
    reconnection_delay=5
)

ws_connected = False
keep_active = False
interval = 10
mode = "mouse"
activity_thread_started = False


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def perform_activity():
    global mode
    try:
        if mode == "mouse":
            x, y = pyautogui.position()

            radius = 40
            steps = 20
            duration = 0.05

            for i in range(steps):
                angle = 2 * math.pi * i / steps
                new_x = x + radius * math.cos(angle)
                new_y = y + radius * math.sin(angle)
                pyautogui.moveTo(new_x, new_y, duration=duration)

            pyautogui.moveTo(x, y, duration=0.1)
            log("ðŸŒ€ Circular mouse jiggle")

        elif mode == "keyboard":
            pyautogui.press("shift")
            log("âŒ¨ Keyboard shift")

    except Exception as e:
        log(f"ðŸ”¥ Activity error: {e}")


def prevent_sleep(enable):
    ES_CONTINUOUS = 0x80000000
    ES_SYSTEM_REQUIRED = 0x00000001
    ES_DISPLAY_REQUIRED = 0x00000002

    if enable:
        ctypes.windll.kernel32.SetThreadExecutionState(
            ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
        )
        log("ðŸ’¡ Sleep prevention ENABLED")
    else:
        ctypes.windll.kernel32.SetThreadExecutionState(ES_CONTINUOUS)
        log("ðŸ’¤ Sleep prevention DISABLED")


@sio.event
def connect():
    global ws_connected, activity_thread_started

    ws_connected = True
    log("ðŸŒ Connected to server (socket.io)")

    sio.emit("agent-register")

    if not activity_thread_started:
        threading.Thread(target=activity_loop, daemon=True).start()
        threading.Thread(target=heartbeat_loop, daemon=True).start()
        activity_thread_started = True
        log("âš™ Activity worker started")


@sio.event
def disconnect():
    global ws_connected
    ws_connected = False
    log("âš  Server connection lost")


@sio.on("command")
def on_message(data):
    global keep_active, interval, mode

    log(f"ðŸ“© Command: {data}")

    try:
        action = data.get("action")

        if action == "START":
            keep_active = True
            prevent_sleep(True)
            log("ðŸŸ¢ Automation STARTED")

        elif action == "STOP":
            keep_active = False
            prevent_sleep(False)
            log("ðŸ›‘ Automation STOPPED")

        elif action == "MODE":
            mode = data.get("mode", "mouse")
            log(f"âš™ Mode set â†’ {mode}")

        elif action == "INTERVAL":
            interval = data.get("interval", 10)
            log(f"â± Interval set â†’ {interval}s")

    except Exception as e:
        log(f"ðŸ”¥ Command error: {e}")


def activity_loop():
    global keep_active

    while True:
        if keep_active and ws_connected:
            perform_activity()
            log("âœ… Activity tick")
            time.sleep(interval)
        else:
            time.sleep(1)


def heartbeat_loop():
    while True:
        if ws_connected:
            try:
                sio.emit("heartbeat", {
                    "time": datetime.now().strftime("%H:%M:%S")
                })
            except:
                pass
        time.sleep(20)


def start():
    while True:
        try:
            log("ðŸ”„ Trying to connect server...")
            sio.connect(
                "https://keepmeactive.onrender.com",
                transports=["websocket"]
            )
            sio.wait()
        except Exception as e:
            log(f"ðŸ”¥ Connection error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    log("ðŸš€ Agent starting...")
    start()
