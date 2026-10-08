const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  getRecipes,
  createRecipe,
  snapAndCook,
  vibeSearch,
  planMeal,
  healthifyRecipe,
  suggestRecipes
} = require("../controllers/recipeController");

/* ===========================
   MULTER CONFIG (IMAGE UPLOAD)
=========================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ===========================
   RECIPE ROUTES
=========================== */

// Get all recipes (optional filter by diet)
router.get("/", getRecipes);

// Add a new recipe (also creates embedding)
router.post("/", createRecipe);

/* ===========================
   AI FEATURES
=========================== */

// 1️⃣ Snap & Cook (Gemini Vision)
router.post(
  "/vision/snap",
  upload.single("image"),
  snapAndCook
);

// 2️⃣ Semantic "Vibe" Search
router.get("/search/vibe", vibeSearch);

// 3️⃣ Goal-Oriented Meal Planner (RAG)
router.post("/plan", planMeal);

// 4️⃣ Health-ify My Plate
router.post("/healthify", healthifyRecipe);

// 5️⃣ Suggest Recipe from Pantry
router.post("/suggest", suggestRecipes);

module.exports = router;
