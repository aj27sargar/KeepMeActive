const WebSocket = require("ws");
const readline = require("readline");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const WS_PORT = process.env.WS_PORT || 5000;
const HTTP_PORT = process.env.HTTP_PORT || 4000;

const wss = new WebSocket.Server({ server: httpServer });

wss.on("connection", (ws) => {

agent = ws;
console.log("Agent connected (cloud)");

broadcastStatus();

ws.on("message", (msg) => {

    let text = msg.toString();

    try {
        let data = JSON.parse(text);

        if (data.type === "heartbeat") {
            console.log("Heartbeat", data.time);
        } else {
            console.log("Agent JSON", data);
        }

    } catch {
        console.log("Raw", text);
    }
});

ws.on("close", () => {
    console.log("Agent disconnected");
    agent = null;
    broadcastStatus();
});

});


const app = express();
app.use(cors());
app.use(express.json());

let agent = null;

console.log("WS server started on", WS_PORT);

/* ---------- SOCKET.IO HTTP SERVER ---------- */

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
cors: { origin: "*" }
});

io.on("connection", (socket) => {
console.log("React UI connected");
socket.emit("agent-status", !!agent);
});

function broadcastStatus() {
io.emit("agent-status", !!agent);
}

/* ---------- AGENT WS CONNECTION ---------- */

wss.on("connection", (ws) => {


agent = ws;
console.log("Agent connected");

broadcastStatus();

ws.on("message", (msg) => {

    let text = msg.toString();

    try {
        let data = JSON.parse(text);

        if (data.type === "heartbeat") {
            console.log("Heartbeat", data.time);
        } else {
            console.log("Agent JSON", data);
        }

    } catch {
        console.log("Raw", text);
    }
});

ws.on("close", () => {
    console.log("Agent disconnected");
    agent = null;
    broadcastStatus();
});


});

/* ---------- COMMAND SENDER ---------- */

function sendCommand(cmd) {


if (!agent) {
    console.log("No agent");
    return false;
}

console.log("Sending", cmd);
agent.send(JSON.stringify(cmd));
return true;


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

/* ---------- START ---------- */

httpServer.listen(HTTP_PORT, () => {
console.log("HTTP + Socket server running on", HTTP_PORT);
});
