import React from "react";

export default function StatusBadge({ online }) {
  return (
    <div className={`status-badge ${online ? "online" : "offline"}`}>
      <span className={`status-dot ${online ? "pulse" : ""}`} />
      <span className="status-label">Agent {online ? "Online" : "Offline"}</span>
    </div>
  );
}