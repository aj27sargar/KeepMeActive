require("dotenv").config();

const readline = require("readline");
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

/* ⭐ GLOBAL CRASH SHIELD */
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
app.use(express.static("public"));

/* ⭐ MULTI AGENT STORE */
let agents = {};   // deviceId -> socket

/* ---------- ROOT ROUTE ---------- */
app.get("/", (req, res) => {
res.send("Presence Keeper Server Running 🚀");
});

app.get("/download/agent", (req, res) => {
const agentPath = path.join(__dirname, "public", "agent.exe");

res.download(agentPath, "agent.exe", (err) => {
    if (err && !res.headersSent) {
        console.log("âš  Agent download failed:", err.message);
        res.status(404).json({ error: "agent.exe not found" });
    }
});
});

/* ---------- HTTP SERVER ---------- */
const httpServer = http.createServer(app);

/* ---------- SOCKET.IO SERVER ---------- */
const io = new Server(httpServer, {
cors: { origin: "*" }
});

/* ⭐ CONNECTION HANDLER */
io.on("connection", (socket) => {


console.log("Client connected:", socket.id);

socket.on("error", (err) => {
    console.log("⚠ Socket error:", err.message);
});

/* ⭐ Agent registration with identity */
socket.on("agent-register", (data) => {

    const { deviceId, deviceName } = data || {};

    if (!deviceId) return;

    socket.deviceId = deviceId;
    socket.deviceName = deviceName || "Unknown Device";

    agents[deviceId] = socket;

    console.log(`✅ Agent registered: ${socket.deviceName} (${deviceId})`);

    broadcastStatus();
});

socket.on("heartbeat", (data) => {
    console.log("Heartbeat", socket.deviceName, data?.time);
});

socket.on("disconnect", () => {

    if (socket.deviceId && agents[socket.deviceId]) {
        console.log(`❌ Agent disconnected: ${socket.deviceName}`);
        delete agents[socket.deviceId];
        broadcastStatus();
    } else {
        console.log("UI disconnected:", socket.id);
    }

});


});

/* ---------- BROADCAST STATUS ---------- */
function broadcastStatus() {


const deviceList = Object.values(agents).map(s => ({
    deviceId: s.deviceId,
    deviceName: s.deviceName
}));

io.emit("device-list", deviceList);


}

/* ---------- SAFE COMMAND SENDER ---------- */
function sendCommand(deviceId, cmd) {

const agent = agents[deviceId];

if (!agent) {
    console.log("Agent not found:", deviceId);
    return false;
}

try {
    console.log("Sending", cmd, "→", agent.deviceName);
    agent.emit("command", cmd);
    return true;
} catch (err) {
    console.log("⚠ Send failed:", err.message);
    delete agents[deviceId];
    broadcastStatus();
    return false;
}


}

/* ---------- CLI ---------- */
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

console.log("Commands: start <deviceId>");

rl.on("line", (input) => {


const parts = input.trim().split(" ");
const cmd = parts[0];
const deviceId = parts[1];

if (!deviceId) {
    console.log("Provide deviceId");
    return;
}

if (cmd === "start")
    sendCommand(deviceId, { action: "START" });

else if (cmd === "stop")
    sendCommand(deviceId, { action: "STOP" });


});

/* ---------- REST API ---------- */

app.get("/devices", (req, res) => {


const list = Object.values(agents).map(s => ({
    deviceId: s.deviceId,
    deviceName: s.deviceName
}));

res.json(list);


});

app.post("/start", (req, res) => {
res.json({
success: sendCommand(req.body.deviceId, { action: "START" })
});
});

app.post("/stop", (req, res) => {
res.json({
success: sendCommand(req.body.deviceId, { action: "STOP" })
});
});

app.post("/mode", (req, res) => {
res.json({
success: sendCommand(req.body.deviceId, {
action: "MODE",
mode: req.body.mode
})
});
});

app.post("/interval", (req, res) => {
res.json({
success: sendCommand(req.body.deviceId, {
action: "INTERVAL",
interval: Number(req.body.interval)
})
});
});

/* ---------- START SERVER ---------- */
httpServer.listen(HTTP_PORT, () => {
console.log("HTTP + Multi-Agent Socket.IO server running on", HTTP_PORT);
});
