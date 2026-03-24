import React, { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import AgentPreview from "../components/AgentPreview";
import StatusBadge from "../components/StatusBadge";
import ControlPanel from "../components/ControlPanel";
import Toast from "../components/Toast";

export default function DashboardPage({ online, dark, onToggleDark }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  return (
    <div className={`app-shell ${dark ? "dark" : "light"}`}>
      <Navbar dark={dark} onToggle={onToggleDark} />

      <main className="dashboard-main">
        {/* Status row */}
        <div className="status-row">
          <div className="status-info">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">Monitor and control your automation agent</p>
          </div>
          <StatusBadge online={online} />
        </div>

        {/* Main grid */}
        <div className="dashboard-grid">
          <AgentPreview />
          <ControlPanel onToast={showToast} />
        </div>

        {/* Footer */}
        <footer className="dash-footer">
          <span>PresenceKeeper v2.0</span>
          <span className="footer-sep">·</span>
          <span>Desktop Automation Engine</span>
        </footer>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}