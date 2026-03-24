import React from "react";
import DashboardPage from "../pages/DashboardPage";

// Minimal client-side router. Extend with react-router-dom for multi-page.
export default function AppRouter({ online, dark, onToggleDark }) {
  return (
    <DashboardPage
      online={online}
      dark={dark}
      onToggleDark={onToggleDark}
    />
  );
}