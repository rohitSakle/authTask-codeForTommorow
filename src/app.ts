import { config } from "dotenv";
config();
import "reflect-metadata";
import { AppDataSource } from "./data-source";

import express, { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/socket";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

import authRoute from "./routes/auth.route";

const { PORT, HOST } = process.env;
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth/api", authRoute);

AppDataSource.initialize()
  .then(() => {
    console.log("database connected");
  })
  .catch((error) => console.log(error));

// init socket
initSocket(io);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error caught by middleware:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  return res.status(status).json({
    message,
  });
});

server.listen(Number(PORT), HOST, () => {
  console.log(`sever listen on http://${HOST}:${PORT}`);
});
