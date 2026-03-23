import websocket
import json
import pyautogui
import time
import threading
from datetime import datetime
import ctypes
import math

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

            radius = 40        # circle size
            steps = 20         # smoothness
            duration = 0.05    # speed

            for i in range(steps):
                angle = 2 * math.pi * i / steps
                new_x = x + radius * math.cos(angle)
                new_y = y + radius * math.sin(angle)
                pyautogui.moveTo(new_x, new_y, duration=duration)

            pyautogui.moveTo(x, y, duration=0.1)

            log("🌀 Circular mouse jiggle")

        elif mode == "keyboard":
            pyautogui.press("shift")
            log("⌨ Keyboard shift")

    except Exception as e:
        log(f"🔥 Activity error: {e}")


def prevent_sleep(enable):
    ES_CONTINUOUS = 0x80000000
    ES_SYSTEM_REQUIRED = 0x00000001
    ES_DISPLAY_REQUIRED = 0x00000002

    if enable:
        ctypes.windll.kernel32.SetThreadExecutionState(
            ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
        )
        log("💡 Sleep prevention ENABLED")
    else:
        ctypes.windll.kernel32.SetThreadExecutionState(ES_CONTINUOUS)
        log("💤 Sleep prevention DISABLED")


def on_message(ws, message):
    global keep_active, interval, mode

    log(f"📩 Command: {message}")

    try:
        data = json.loads(message)
        action = data.get("action")

        if action == "START":
            keep_active = True
            prevent_sleep(True)
            log("🟢 Automation STARTED")

        elif action == "STOP":
            keep_active = False
            prevent_sleep(False)
            log("🛑 Automation STOPPED")

        elif action == "MODE":
            mode = data.get("mode", "mouse")
            log(f"⚙ Mode set → {mode}")

        elif action == "INTERVAL":
            interval = data.get("interval", 10)
            log(f"⏱ Interval set → {interval}s")

    except Exception as e:
        log(f"🔥 Command error: {e}")


def on_open(ws):
    global ws_connected, activity_thread_started

    ws_connected = True
    log("🌐 Connected to server")

    # start activity worker ONLY once
    if not activity_thread_started:
        threading.Thread(target=activity_loop, daemon=True).start()
        activity_thread_started = True
        log("⚙ Activity worker started")


def on_close(ws, a, b):
    global ws_connected
    ws_connected = False
    log("⚠ Server connection lost")


def on_error(ws, error):
    log(f"🔥 WS error: {error}")


def activity_loop():
    global keep_active

    while True:
        if keep_active and ws_connected:
            perform_activity()
            log("✅ Activity tick")
            time.sleep(interval)
        else:
            time.sleep(1)


def heartbeat_loop(ws):
    while True:
        if ws_connected:
            try:
                msg = json.dumps({
                    "type": "heartbeat",
                    "time": datetime.now().strftime("%H:%M:%S")
                })
                ws.send(msg)
            except:
                pass
        time.sleep(20)


def start():

    while True:

        log("🔄 Trying to connect server...")

        ws = websocket.WebSocketApp(
            "wss://keepmeactive.onrender.com",
            on_message=on_message,
            on_open=on_open,
            on_close=on_close,
            on_error=on_error
        )

        threading.Thread(target=heartbeat_loop, args=(ws,), daemon=True).start()

        ws.run_forever()

        log("⏳ Reconnect in 5 sec...")
        time.sleep(5)


if __name__ == "__main__":
    log("🚀 Agent starting...")
    start()