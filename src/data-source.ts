import { config } from "dotenv";
config();
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Session } from "./entity/Session";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Session],
  migrations: [],
  subscribers: [],
});
