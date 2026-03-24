import React, { useState } from "react";
import * as api from "../api/agentApi";

export default function ControlPanel({ onToast }) {
  const [loading, setLoading] = useState(null);
  const [activeMode, setActiveMode] = useState("mouse");
  const [intervalVal, setIntervalVal] = useState(10);

  const handle = async (label, fn) => {
    setLoading(label);
    try {
      await fn();
      onToast("Command Sent");
    } catch {
      onToast("Command Failed", "error");
    } finally {
      setTimeout(() => setLoading(null), 600);
    }
  };

  return (
    <div className="control-panel card">
      <div className="card-header">
        <h2 className="card-title">Controls</h2>
        <p className="card-subtitle">Manage agent behavior</p>
      </div>

      <div className="controls-grid">
        {/* Primary actions */}
        <div className="control-group">
          <label className="group-label">Automation</label>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => handle("start", api.startAutomation)}
              disabled={loading === "start"}
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
              onClick={() => handle("stop", api.stopAutomation)}
              disabled={loading === "stop"}
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
              onClick={() => { setActiveMode("mouse"); handle("mouse", () => api.setMode("mouse")); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8l3 3v3H4v-3l3-3V3z"/>
                <line x1="9" y1="1" x2="9" y2="10"/>
              </svg>
              Mouse Mode
            </button>
            <button
              className={`btn btn-secondary ${activeMode === "keyboard" ? "active" : ""}`}
              onClick={() => { setActiveMode("keyboard"); handle("keyboard", () => api.setMode("keyboard")); }}
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
              onClick={() => handle("interval", () => api.setInterval(intervalVal))}
              disabled={loading === "interval"}
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