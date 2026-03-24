require("dotenv").config();

const readline = require("readline");
const express = require("express");
const cors = require("cors");
const http = require("http");
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

let agent = null;

/* ---------- ROOT ROUTE ---------- */
app.get("/", (req, res) => {
res.send("Presence Keeper Server Running 🚀");
});

/* ---------- HTTP SERVER ---------- */
const httpServer = http.createServer(app);

/* ---------- SOCKET.IO SERVER ---------- */
const io = new Server(httpServer, {
cors: { origin: "*" }
});

/* ⭐ CONNECTION HANDLER (UI + Agent both come here) */
io.on("connection", (socket) => {


console.log("Client connected:", socket.id);

socket.on("error", (err) => {
    console.log("⚠ Socket error:", err.message);
});

/* ⭐ Agent registration event */
socket.on("agent-register", () => {
    agent = socket;
    console.log("✅ Agent registered via socket.io");
    broadcastStatus();
});

/* ⭐ Heartbeat from agent */
socket.on("heartbeat", (data) => {
    console.log("Heartbeat", data.time);
});

socket.on("disconnect", () => {

    if (agent && socket.id === agent.id) {
        console.log("❌ Agent disconnected");
        agent = null;
        broadcastStatus();
    } else {
        console.log("UI disconnected:", socket.id);
    }

});

socket.emit("agent-status", !!agent);


});

function broadcastStatus() {
io.emit("agent-status", !!agent);
}

/* ---------- SAFE COMMAND SENDER ---------- */
function sendCommand(cmd) {


if (!agent) {
    console.log("No agent");
    return false;
}

try {
    console.log("Sending", cmd);
    agent.emit("command", cmd);
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
console.log("HTTP + Socket.IO server running on", HTTP_PORT);
});
