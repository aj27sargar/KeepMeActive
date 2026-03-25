import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { fetchDevices, SERVER_BASE } from "./api/agentApi";
import AppRouter from "./router/AppRouter";
import "./styles/global.css";

const socket = io(SERVER_BASE);

export default function App() {
  const [online, setOnline] = useState(false);
  const [devices, setDevices] = useState([]);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const handleDeviceList = (list = []) => {
      setDevices(list);
      setOnline(list.length > 0);
    };

    socket.on("device-list", handleDeviceList);
    fetchDevices()
      .then(handleDeviceList)
      .catch(() => {
        setDevices([]);
        setOnline(false);
      });

    return () => socket.off("device-list", handleDeviceList);
  }, []);

  return (
    <AppRouter
      online={online}
      devices={devices}
      dark={dark}
      onToggleDark={() => setDark((d) => !d)}
    />
  );
}
