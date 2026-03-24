import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import AppRouter from "./router/AppRouter";
import "./styles/global.css";

const socket = io("https://keepmeactive.onrender.com");

export default function App() {
  const [online, setOnline] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    socket.on("agent-status", setOnline);
    return () => socket.off("agent-status", setOnline);
  }, []);

  return (
    <AppRouter
      online={online}
      dark={dark}
      onToggleDark={() => setDark((d) => !d)}
    />
  );
}