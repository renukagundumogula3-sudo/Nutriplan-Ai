require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                // Log all models to be sure
                console.log(`- ${m.name}`);
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();
