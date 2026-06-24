const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const incomeRoutes = require("./routes/income");
const expenseRoutes = require("./routes/expense");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ── Middleware ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/income",    incomeRoutes);
app.use("/api/expense",   expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "Expense Tracker API running ✅" }));

// ── DB + Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
