import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
    ? new Pool({
          connectionString,
          ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
      })
    : new Pool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: Number(process.env.DB_PORT) || 5432,
      });
