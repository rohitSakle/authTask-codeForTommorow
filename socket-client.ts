import { io } from "socket.io-client";

const socket = io("http://localhost:7091");

socket.on("connect", () => {
  console.log("connected to server", socket.id);
});

socket.on("message", (data) => {
  console.log("received message", data);
});

socket.emit("joinRoom", { room: "testRoom" });

socket.on("disconnect", () => {
  console.log("disconnect from server");
});

socket.on("userRegistered", (data) => {
  console.log(`${data.name} registerd`);
});

// npx ts-node socket-client.ts
