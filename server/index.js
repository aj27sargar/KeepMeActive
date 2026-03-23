require("dotenv").config();

const WebSocket = require("ws");
const readline = require("readline");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

/* ⭐ GLOBAL CRASH SHIELD (Production Must) */
process.on("uncaughtException", (err) => {
console.log("🔥 Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (err) => {
console.log("🔥 Unhandled Rejection:", err);
});

const HTTP_PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

let agent = null;

/* ---------- ROOT ROUTE ---------- */
app.get("/", (req, res) => {
res.send("Presence Keeper Server Running 🚀");
});

/* ---------- HTTP SERVER ---------- */
const httpServer = http.createServer(app);

/* ---------- SOCKET.IO ---------- */
const io = new Server(httpServer, {
cors: { origin: "*" }
});

io.on("connection", (socket) => {
console.log("React UI connected");


socket.on("error", (err) => {
    console.log("⚠ Socket.io client error:", err.message);
});

socket.emit("agent-status", !!agent);


});

function broadcastStatus() {
io.emit("agent-status", !!agent);
}

/* ---------- AGENT WEBSOCKET ---------- */
const wss = new WebSocket.Server({ server: httpServer });

/* ⭐ WS SERVER ERROR GUARD */
wss.on("error", (err) => {
console.log("⚠ WS Server error:", err.message);
});

wss.on("connection", (ws) => {


agent = ws;
console.log("Agent connected (cloud)");
broadcastStatus();

/* ⭐ Prevent crash on invalid frames */
ws.on("error", (err) => {
    console.log("⚠ Agent WS error:", err.message);
});

ws.on("message", (msg) => {

    try {
        const text = msg.toString();

        try {
            const data = JSON.parse(text);

            if (data.type === "heartbeat") {
                console.log("Heartbeat", data.time);
            } else {
                console.log("Agent JSON", data);
            }

        } catch {
            console.log("Raw", text);
        }

    } catch (err) {
        console.log("⚠ Message handling error:", err.message);
    }

});

ws.on("close", () => {
    console.log("Agent disconnected");
    agent = null;
    broadcastStatus();
});


});

/* ---------- SAFE COMMAND SENDER ---------- */
function sendCommand(cmd) {


if (!agent) {
    console.log("No agent");
    return false;
}

try {
    console.log("Sending", cmd);
    agent.send(JSON.stringify(cmd));
    return true;
} catch (err) {
    console.log("⚠ Send failed:", err.message);
    agent = null;
    broadcastStatus();
    return false;
}


}

/* ---------- CLI ---------- */
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

console.log("Commands: start stop mouse keyboard interval 5");

rl.on("line", (input) => {


input = input.trim();

if (input === "start") sendCommand({ action: "START" });
else if (input === "stop") sendCommand({ action: "STOP" });
else if (input === "mouse") sendCommand({ action: "MODE", mode: "mouse" });
else if (input === "keyboard") sendCommand({ action: "MODE", mode: "keyboard" });
else if (input.startsWith("interval")) {

    let val = parseInt(input.split(" ")[1]);

    if (!isNaN(val))
        sendCommand({ action: "INTERVAL", interval: val });
    else
        console.log("Invalid interval");
}


});

/* ---------- REST API ---------- */
app.post("/start", (req, res) => {
res.json({ success: sendCommand({ action: "START" }) });
});

app.post("/stop", (req, res) => {
res.json({ success: sendCommand({ action: "STOP" }) });
});

app.post("/mode", (req, res) => {
res.json({
success: sendCommand({
action: "MODE",
mode: req.body.mode
})
});
});

app.post("/interval", (req, res) => {
res.json({
success: sendCommand({
action: "INTERVAL",
interval: req.body.interval
})
});
});

app.get("/status", (req, res) => {
res.json({ agentConnected: !!agent });
});

/* ---------- START SERVER ---------- */
httpServer.listen(HTTP_PORT, () => {
console.log("HTTP + WS server running on", HTTP_PORT);
});
