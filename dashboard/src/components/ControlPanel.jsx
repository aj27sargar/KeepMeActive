import React, { useState } from "react";
import * as api from "../api/agentApi";

export default function ControlPanel({ devices = [], onToast }) {
  const [loading, setLoading] = useState(null);
  const [activeMode, setActiveMode] = useState("mouse");
  const [intervalVal, setIntervalVal] = useState(10);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const resolvedDeviceId =
    selectedDeviceId || (devices.length > 0 ? devices[0].deviceId : "");

  const handle = async (label, fn) => {
    if (!resolvedDeviceId) {
      onToast("No connected agent found", "error");
      return;
    }

    setLoading(label);
    try {
      await fn();
      onToast("Command sent");
    } catch {
      onToast("Command failed", "error");
    } finally {
      setTimeout(() => setLoading(null), 600);
    }
  };

  const downloadUrl = api.getAgentDownloadUrl();

  return (
    <div className="control-panel card">
      <div className="card-header">
        <h2 className="card-title">Controls</h2>
        <p className="card-subtitle">Manage agent behavior</p>
      </div>

      <div className="controls-grid">
        <div className="control-group">
          <label className="group-label">Target Agent</label>
          <select
            className="device-select"
            value={resolvedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={devices.length === 0}
          >
            {devices.length === 0 ? (
              <option value="">No agents connected</option>
            ) : (
              devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.deviceName} ({device.deviceId})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="control-group">
          <label className="group-label">Agent Download</label>
          <div className="download-card">
            <div>
              <p className="download-title">Download Windows Agent</p>
              <p className="download-text">
                Install the desktop agent to connect this device to the dashboard.
              </p>
            </div>
            <a
              className="btn btn-primary download-btn"
              href={downloadUrl}
              download="agent.exe"
              target="_blank"
              rel="noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              Download agent.exe
            </a>
          </div>
        </div>

        {/* Primary actions */}
        <div className="control-group">
          <label className="group-label">Automation</label>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => handle("start", () => api.startAutomation(resolvedDeviceId))}
              disabled={loading === "start" || !resolvedDeviceId}
            >
              {loading === "start" ? <Spinner /> : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
              Start Automation
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handle("stop", () => api.stopAutomation(resolvedDeviceId))}
              disabled={loading === "stop" || !resolvedDeviceId}
            >
              {loading === "stop" ? <Spinner /> : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
              )}
              Stop Automation
            </button>
          </div>
        </div>

        {/* Mode selection */}
        <div className="control-group">
          <label className="group-label">Input Mode</label>
          <div className="btn-row">
            <button
              className={`btn btn-secondary ${activeMode === "mouse" ? "active" : ""}`}
              onClick={() => {
                setActiveMode("mouse");
                handle("mouse", () => api.setMode(resolvedDeviceId, "mouse"));
              }}
              disabled={!resolvedDeviceId}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8l3 3v3H4v-3l3-3V3z"/>
                <line x1="9" y1="1" x2="9" y2="10"/>
              </svg>
              Mouse Mode
            </button>
            <button
              className={`btn btn-secondary ${activeMode === "keyboard" ? "active" : ""}`}
              onClick={() => {
                setActiveMode("keyboard");
                handle("keyboard", () => api.setMode(resolvedDeviceId, "keyboard"));
              }}
              disabled={!resolvedDeviceId}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="10"/>
                <line x1="10" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="14" y2="10"/>
                <line x1="18" y1="10" x2="18" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>
              </svg>
              Keyboard Mode
            </button>
          </div>
        </div>

        {/* Interval */}
        <div className="control-group">
          <label className="group-label">Interval (seconds)</label>
          <div className="interval-row">
            <input
              type="number"
              className="interval-input"
              value={intervalVal}
              min={1}
              max={300}
              onChange={(e) => setIntervalVal(e.target.value)}
            />
            <button
              className="btn btn-outline"
              onClick={() => handle("interval", () => api.setInterval(resolvedDeviceId, Number(intervalVal)))}
              disabled={loading === "interval" || !resolvedDeviceId}
            >
              {loading === "interval" ? <Spinner /> : "Set"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="spinner" />;
}
