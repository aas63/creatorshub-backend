import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tracksRoutes from "./routes/tracks.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"))
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tracks", tracksRoutes);

export default app;
