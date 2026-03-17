import express from "express";
import cron from "node-cron";
import dotenv from "dotenv";
import { checkProposal } from "./services/service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Example API
app.get("/", (req, res) => {
    res.send("Server running...");
});

// Cron Job (runs every minute)
cron.schedule("* * * * *", async () => {
    checkProposal()
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});