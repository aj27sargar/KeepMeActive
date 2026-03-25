import React from "react";

export default function StatusBadge({ online, count = 0 }) {
  return (
    <div className={`status-badge ${online ? "online" : "offline"}`}>
      <span className={`status-dot ${online ? "pulse" : ""}`} />
      <span className="status-label">
        {online ? `${count} Agent${count === 1 ? "" : "s"} Online` : "Agent Offline"}
      </span>
    </div>
  );
}
