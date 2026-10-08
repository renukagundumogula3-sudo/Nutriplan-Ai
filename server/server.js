const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const recipeRoutes = require("./routes/recipeRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());

// Allow large payloads (for image uploads / base64)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ===============================
   ROUTES
================================ */
app.use("/api/recipes", recipeRoutes);

app.get("/", (req, res) => {
  res.send("🥗 NutriPlan AI API is running...");
});

/* ===============================
   START SERVER
================================ */
const startServer = async () => {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.warn("⚠️ MongoDB is not reachable. Starting server in degraded mode...");
  }

  app.listen(PORT, () => {
    console.log(`🚀 NutriPlan AI server running on port ${PORT}`);
  });
};

startServer();
