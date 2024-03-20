import { io } from "socket.io-client";
const socketInitialize = () => {
  const socket = io("https://real-time-drawing-board-backend.onrender.com");
  return socket;
};

export default socketInitialize
