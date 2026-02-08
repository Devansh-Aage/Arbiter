import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import orgRoutes from "./routes/orgRoutes";
import { appIsLoggedIn } from "./middleware/app-isLoggedIn";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);

app.get("/api/app/auth", appIsLoggedIn);

app.get("/", (req, res) => {
  res.send("Arbiter HTTP Server");
});

app.listen(process.env.HTTP_PORT, () => {
  console.log(`HTTP server listening on ${process.env.HTTP_PORT}`);
});