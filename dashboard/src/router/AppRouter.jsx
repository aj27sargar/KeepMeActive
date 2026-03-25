import React from "react";
import DashboardPage from "../pages/DashboardPage";

// Minimal client-side router. Extend with react-router-dom for multi-page.
export default function AppRouter({ online, devices, dark, onToggleDark }) {
  return (
    <DashboardPage
      online={online}
      devices={devices}
      dark={dark}
      onToggleDark={onToggleDark}
    />
  );
}
