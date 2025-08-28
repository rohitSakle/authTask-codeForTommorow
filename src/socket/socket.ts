import { Server } from "socket.io";

let io: Server;
export const initSocket = (server: Server) => {
  io = server;
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
      socket.to(room).emit("message", `${socket.id} join ${room}`);
    });

    // Listen for events
    socket.on("message", (data) => {
      console.log("Message received:", data);
      // Broadcast to all connected clients
      io.emit("message", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}
