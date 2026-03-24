import axios from "axios";

const BASE = "https://keepmeactive.onrender.com";

export const startAutomation = () => axios.post(`${BASE}/start`);
export const stopAutomation = () => axios.post(`${BASE}/stop`);
export const setMode = (mode) => axios.post(`${BASE}/mode`, { mode });
export const setInterval = (interval) => axios.post(`${BASE}/interval`, { interval });