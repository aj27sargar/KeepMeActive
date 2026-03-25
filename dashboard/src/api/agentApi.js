import axios from "axios";

export const SERVER_BASE = "https://keepmeactive.onrender.com";

export const fetchDevices = async () => {
  const { data } = await axios.get(`${SERVER_BASE}/devices`);
  return data;
};

export const startAutomation = (deviceId) =>
  axios.post(`${SERVER_BASE}/start`, { deviceId });

export const stopAutomation = (deviceId) =>
  axios.post(`${SERVER_BASE}/stop`, { deviceId });

export const setMode = (deviceId, mode) =>
  axios.post(`${SERVER_BASE}/mode`, { deviceId, mode });

export const setInterval = (deviceId, interval) =>
  axios.post(`${SERVER_BASE}/interval`, { deviceId, interval });

export const getAgentDownloadUrl = () => `${SERVER_BASE}/download/agent`;
