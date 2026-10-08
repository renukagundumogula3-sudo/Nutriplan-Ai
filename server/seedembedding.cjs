const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { MongoClient } = require("mongodb");
require("dotenv").config();

/* ===============================
   ENV VALIDATION
================================ */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not defined");
  process.exit(1);
}

if (!process.env.PINECONE_API_KEY) {
  console.error("❌ PINECONE_API_KEY not defined");
  process.exit(1);
}

if (!process.env.PINECONE_INDEX) {
  console.error("❌ PINECONE_INDEX not defined");
  process.exit(1);
}

/* ===============================
   MAIN
================================ */
async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const index = pinecone.index(process.env.PINECONE_INDEX);

  /* ===============================
     MONGODB
  ================================ */
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();

    const db = client.db("nutriplan");
    const collection = db.collection("recipes");

    const recipes = await collection.find({}).toArray();
    console.log(`🍽️ Found ${recipes.length} recipes`);

    // CLEAR EXISTING VECTORS
    try {
      await index.deleteAll();
      console.log("🗑️ Cleared existing Pinecone vectors");
    } catch (e) {
      console.log("⚠️ Could not clear index (might be empty or serverless restriction):", e.message);
    }

    /* ===============================
       CREATE EMBEDDINGS
    ================================ */
    const vectors = [];

    for (const recipe of recipes) {
      const textForEmbedding = `
        Recipe Title: ${recipe.title}
        Description: ${recipe.description}
        Diet Type: ${recipe.dietType}
        Ingredients: ${recipe.ingredients.join(", ")}
        Calories: ${recipe.calories}
        Protein: ${recipe.protein}
      `;

      // RATE LIMIT HANDLING (Basic)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 sec delay to avoid rate limits

      const result = await model.embedContent(textForEmbedding);
      const embedding = result.embedding.values;

      console.log(`✅ Created embedding for recipe: ${recipe.title}`);

      vectors.push({
        id: recipe._id.toString(),
        values: embedding,
        metadata: {
          title: recipe.title,
          dietType: recipe.dietType,
          calories: recipe.calories,
          protein: recipe.protein
        }
      });
    }

    console.log(`📦 Total vectors generated: ${vectors.length}`);

    /* ===============================
       UPSERT TO PINECONE
    ================================ */
    if (vectors.length > 0) {
      // Chunking upserts if too many (Pinecone limit is usually 100-1000 vectors per call)
      // Here assuming 20 recipes is fine
      await index.upsert(vectors);
      console.log("🚀 Successfully uploaded recipe embeddings to Pinecone");
    } else {
      console.log("⚠️ No vectors to upload");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    process.exit();
  }
}

main();
