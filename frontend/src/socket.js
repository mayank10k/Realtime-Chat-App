import { io } from "socket.io-client";

const SOCKET_URL = "";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Wait until we have a token
  auth: {
    token: localStorage.getItem("token") // Fetched during login
  }
});