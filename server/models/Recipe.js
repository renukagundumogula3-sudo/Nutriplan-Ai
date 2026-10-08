const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    instructions: [{ type: String }], // Array of steps
    time: { type: String }, // e.g. "30 min"
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    dietType: { type: String, enum: ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan"], required: true },
    image: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recipe", recipeSchema);
