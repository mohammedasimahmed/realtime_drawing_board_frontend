import { io } from "socket.io-client";
const socketInitialize = () => {
  const socket = io("http://localhost:5000");
  return socket;
};

export default socketInitialize
