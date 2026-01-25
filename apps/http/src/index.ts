import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.listen(process.env.HTTP_PORT, () => {
  console.log(`HTTP server listening on ${process.env.HTTP_PORT}`);
});